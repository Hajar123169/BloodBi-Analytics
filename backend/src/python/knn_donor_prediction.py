"""
BloodBI Analytics — KNN Donor Behavior Prediction
Predicts whether a donor will donate again within the next 6 months.
Uses the RFMT (Recency, Frequency, Monetary, Time) feature set
inspired by the UCI Blood Transfusion dataset.
 
Output:
  - models/knn_donor_model.pkl     → trained KNN classifier
  - models/knn_scaler.pkl          → fitted StandardScaler
  - models/knn_results.json        → metrics + predictions for the API
"""
 
import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
 
import mysql.connector
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, roc_auc_score, roc_curve
)
 
# ─── Configuration ────────────────────────────────────────────────────────────
 
DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", 3306)),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "3006"),
    "database": os.getenv("DB_NAME", "bloodbi_v2"),
}
 
MODELS_DIR  = os.path.join(os.path.dirname(__file__), "../../../../models")
GRAPHS_DIR  = os.path.join(MODELS_DIR, "graphs")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(GRAPHS_DIR, exist_ok=True)
 
RANDOM_STATE = 42
TEST_SIZE    = 0.20
K_NEIGHBORS  = 7          # odd → no ties; tuned for typical blood-donor datasets
 
 
# ─── 1. Data Loading ──────────────────────────────────────────────────────────
 
def load_from_database() -> pd.DataFrame:
    """
    Loads donor features from MySQL.
    Returns a DataFrame with columns:
        recency_months, frequency, volume_ml, time_since_first,
        nb_donations_last_year, blood_type_encoded, will_donate_again (target)
    """
    query = """
        SELECT
            dp.id                                                         AS donor_id,
            TIMESTAMPDIFF(MONTH, MAX(don.donation_date), CURDATE())       AS recency_months,
            COUNT(don.id)                                                  AS frequency,
            SUM(don.volume_ml)                                             AS volume_ml,
            TIMESTAMPDIFF(MONTH, dp.registration_date, CURDATE())         AS time_since_first,
            SUM(don.donation_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) AS nb_donations_last_year,
            CASE dp.blood_type
                WHEN 'A+'  THEN 1  WHEN 'A-'  THEN 2
                WHEN 'B+'  THEN 3  WHEN 'B-'  THEN 4
                WHEN 'AB+' THEN 5  WHEN 'AB-' THEN 6
                WHEN 'O+'  THEN 7  WHEN 'O-'  THEN 8
                ELSE 0
            END                                                            AS blood_type_encoded,
            CASE
                WHEN TIMESTAMPDIFF(MONTH, MAX(don.donation_date), CURDATE()) <= 6 THEN 1
                ELSE 0
            END                                                            AS will_donate_again
        FROM donor_profile dp
        JOIN donation don ON don.donor_id = dp.id
        GROUP BY dp.id, dp.registration_date, dp.blood_type
        HAVING COUNT(don.id) >= 1
    """
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        df = pd.read_sql(query, conn)
        conn.close()
        print(f"[DB] Loaded {len(df):,} donor records from MySQL.")
        return df
    except mysql.connector.Error as err:
        print(f"[DB] Connection failed: {err}")
        print("[DB] Falling back to synthetic data for demonstration …")
        return _synthetic_data()
 
 
def _synthetic_data(n: int = 800) -> pd.DataFrame:
    """
    Generates realistic synthetic donor data when the DB is unavailable.
    Mirrors the blood-transfusion UCI distribution (class imbalance ~76/24).
    """
    rng = np.random.default_rng(RANDOM_STATE)
    recency   = rng.integers(0, 25, n)
    frequency = rng.integers(1, 50, n)
    volume    = frequency * rng.integers(200, 600, n)
    time_ff   = rng.integers(1, 98, n)
    last_yr   = np.clip(rng.integers(0, 5, n), 0, frequency)
    blood_enc = rng.integers(1, 9, n)
 
    # Logistic-like rule: donate again if recency ≤ 6 with some noise
    prob = 1 / (1 + np.exp(0.4 * recency - 0.08 * frequency - 0.5))
    target = (rng.random(n) < prob).astype(int)
 
    return pd.DataFrame({
        "donor_id":              np.arange(n),
        "recency_months":        recency,
        "frequency":             frequency,
        "volume_ml":             volume,
        "time_since_first":      time_ff,
        "nb_donations_last_year": last_yr,
        "blood_type_encoded":    blood_enc,
        "will_donate_again":     target,
    })
 
 
# ─── 2. Pre-processing ────────────────────────────────────────────────────────
 
FEATURE_COLS = [
    "recency_months",
    "frequency",
    "volume_ml",
    "time_since_first",
    "nb_donations_last_year",
    "blood_type_encoded",
]
TARGET_COL = "will_donate_again"
 
 
def preprocess(df: pd.DataFrame):
    df = df.dropna(subset=FEATURE_COLS + [TARGET_COL])
    X = df[FEATURE_COLS].astype(float)
    y = df[TARGET_COL].astype(int)
 
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
 
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)
 
    return X_train_s, X_test_s, y_train, y_test, scaler, X_test, df
 
 
# ─── 3. Training & Evaluation ─────────────────────────────────────────────────
 
def train_and_evaluate(X_train, X_test, y_train, y_test):
    model = KNeighborsClassifier(
        n_neighbors=K_NEIGHBORS,
        weights="distance",      # closer donors carry more weight
        metric="euclidean",
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
 
    y_pred  = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
 
    accuracy  = accuracy_score(y_test, y_pred)
    auc       = roc_auc_score(y_test, y_proba)
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="accuracy")
    cm        = confusion_matrix(y_test, y_pred)
    report    = classification_report(y_test, y_pred, output_dict=True)
 
    print(f"\n{'═'*55}")
    print(f"  KNN Donor Prediction — Results (k={K_NEIGHBORS})")
    print(f"{'═'*55}")
    print(f"  Accuracy          : {accuracy:.4f}  ({accuracy*100:.2f}%)")
    print(f"  AUC-ROC           : {auc:.4f}")
    print(f"  CV-5 Accuracy     : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"  Confusion Matrix  :\n{cm}")
    print(f"{'═'*55}\n")
 
    return model, y_pred, y_proba, accuracy, auc, cv_scores, cm, report
 
 
# ─── 4. Visualisations ───────────────────────────────────────────────────────
 
PALETTE = {"bg": "#0f172a", "card": "#1e293b", "accent": "#e11d48",
           "blue": "#3b82f6", "green": "#22c55e", "text": "#f8fafc"}
 
def _dark_fig(figsize=(8, 5)):
    fig, ax = plt.subplots(figsize=figsize, facecolor=PALETTE["card"])
    ax.set_facecolor(PALETTE["card"])
    for spine in ax.spines.values():
        spine.set_color("#334155")
    ax.tick_params(colors=PALETTE["text"])
    ax.xaxis.label.set_color(PALETTE["text"])
    ax.yaxis.label.set_color(PALETTE["text"])
    ax.title.set_color(PALETTE["text"])
    return fig, ax
 
 
def plot_confusion_matrix(cm, out_path):
    fig, ax = _dark_fig((6, 5))
    labels = ["Won't Donate", "Will Donate"]
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="RdYlGn",
        xticklabels=labels, yticklabels=labels,
        linewidths=1, linecolor="#334155",
        cbar_kws={"shrink": 0.8},
        ax=ax,
    )
    ax.set_title("Confusion Matrix", fontsize=14, pad=12)
    ax.set_xlabel("Predicted", labelpad=8)
    ax.set_ylabel("Actual", labelpad=8)
    plt.setp(ax.get_xticklabels(), color=PALETTE["text"], fontsize=10)
    plt.setp(ax.get_yticklabels(), color=PALETTE["text"], fontsize=10, rotation=0)
    plt.tight_layout()
    fig.savefig(out_path, dpi=120, bbox_inches="tight", facecolor=PALETTE["card"])
    plt.close(fig)
    print(f"[Graph] Saved confusion matrix → {out_path}")
 
 
def plot_roc_curve(y_test, y_proba, auc, out_path):
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    fig, ax = _dark_fig((7, 5))
    ax.plot(fpr, tpr, color=PALETTE["accent"], lw=2,
            label=f"KNN (AUC = {auc:.3f})")
    ax.plot([0, 1], [0, 1], "--", color="#475569", lw=1.5, label="Random")
    ax.fill_between(fpr, tpr, alpha=0.08, color=PALETTE["accent"])
    ax.set_xlim([0, 1]); ax.set_ylim([0, 1.02])
    ax.set_xlabel("False Positive Rate"); ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve — Donor Return Prediction", fontsize=13)
    legend = ax.legend(loc="lower right", facecolor=PALETTE["card"],
                       edgecolor="#334155", labelcolor=PALETTE["text"])
    plt.tight_layout()
    fig.savefig(out_path, dpi=120, bbox_inches="tight", facecolor=PALETTE["card"])
    plt.close(fig)
    print(f"[Graph] Saved ROC curve → {out_path}")
 
 
def plot_feature_importance(model, X_train, y_train, out_path):
    """
    Permutation-style importance for KNN using accuracy drop.
    """
    from sklearn.inspection import permutation_importance
    result = permutation_importance(
        model, X_train, y_train, n_repeats=10,
        random_state=RANDOM_STATE, n_jobs=-1
    )
    importances = result.importances_mean
    indices     = np.argsort(importances)[::-1]
    labels      = [FEATURE_COLS[i] for i in indices]
    colors      = [PALETTE["accent"] if i == indices[0] else PALETTE["blue"]
                   for i in range(len(labels))]
 
    fig, ax = _dark_fig((8, 4))
    bars = ax.barh(labels[::-1], importances[indices][::-1], color=colors[::-1],
                   edgecolor="#334155", height=0.55)
    for bar, val in zip(bars, importances[indices][::-1]):
        ax.text(bar.get_width() + 0.002, bar.get_y() + bar.get_height() / 2,
                f"{val:.4f}", va="center", color=PALETTE["text"], fontsize=9)
    ax.set_title("Feature Importance (Permutation)", fontsize=13)
    ax.set_xlabel("Mean accuracy decrease")
    plt.tight_layout()
    fig.savefig(out_path, dpi=120, bbox_inches="tight", facecolor=PALETTE["card"])
    plt.close(fig)
    print(f"[Graph] Saved feature importance → {out_path}")
 
 
def plot_cv_scores(cv_scores, out_path):
    fig, ax = _dark_fig((7, 4))
    folds = [f"Fold {i+1}" for i in range(len(cv_scores))]
    bar_colors = [PALETTE["green"] if s >= cv_scores.mean() else PALETTE["blue"]
                  for s in cv_scores]
    ax.bar(folds, cv_scores * 100, color=bar_colors, edgecolor="#334155", width=0.5)
    ax.axhline(cv_scores.mean() * 100, color=PALETTE["accent"],
               linestyle="--", lw=1.5, label=f"Mean {cv_scores.mean()*100:.2f}%")
    ax.set_ylim([max(0, (cv_scores.min() - 0.05) * 100), 100])
    ax.set_ylabel("Accuracy (%)")
    ax.set_title("5-Fold Cross-Validation Accuracy", fontsize=13)
    legend = ax.legend(facecolor=PALETTE["card"], edgecolor="#334155",
                       labelcolor=PALETTE["text"])
    for bar, val in zip(ax.patches, cv_scores):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                f"{val*100:.1f}%", ha="center", color=PALETTE["text"], fontsize=9)
    plt.tight_layout()
    fig.savefig(out_path, dpi=120, bbox_inches="tight", facecolor=PALETTE["card"])
    plt.close(fig)
    print(f"[Graph] Saved CV scores → {out_path}")
 
 
# ─── 5. High-risk Donors Extraction ──────────────────────────────────────────
 
def extract_high_risk(df, scaler, model, top_n: int = 20):
    """
    Returns the top_n donors least likely to donate again (highest risk of churn).
    """
    X_all = scaler.transform(df[FEATURE_COLS].astype(float))
    proba_not_donate = model.predict_proba(X_all)[:, 0]  # P(won't donate)
    df = df.copy()
    df["churn_risk"] = proba_not_donate
    high_risk = (
        df.nlargest(top_n, "churn_risk")[
            ["donor_id", "recency_months", "frequency", "blood_type_encoded", "churn_risk"]
        ]
        .round({"churn_risk": 4})
        .to_dict(orient="records")
    )
    return high_risk
 
 
# ─── 6. Persist Artefacts ─────────────────────────────────────────────────────
 
def save_results(model, scaler, accuracy, auc, cv_scores, report, high_risk, df):
    joblib.dump(model,  os.path.join(MODELS_DIR, "knn_donor_model.pkl"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "knn_scaler.pkl"))
    print(f"[Save] Models saved to {MODELS_DIR}/")
 
    # Class distribution
    dist = df[TARGET_COL].value_counts().to_dict()
 
    results = {
        "model":          "KNN Donor Prediction",
        "version":        "1.0.0",
        "k_neighbors":    K_NEIGHBORS,
        "features":       FEATURE_COLS,
        "accuracy":       round(accuracy, 4),
        "auc_roc":        round(auc, 4),
        "cv_mean":        round(float(cv_scores.mean()), 4),
        "cv_std":         round(float(cv_scores.std()), 4),
        "cv_scores":      [round(s, 4) for s in cv_scores.tolist()],
        "classification_report": report,
        "class_distribution": {
            "will_donate":     int(dist.get(1, 0)),
            "wont_donate":     int(dist.get(0, 0)),
        },
        "high_risk_donors": high_risk,
        "graphs": {
            "confusion_matrix":    "models/graphs/knn_confusion_matrix.png",
            "roc_curve":           "models/graphs/knn_roc_curve.png",
            "feature_importance":  "models/graphs/knn_feature_importance.png",
            "cv_scores":           "models/graphs/knn_cv_scores.png",
        },
    }
 
    out_path = os.path.join(MODELS_DIR, "knn_results.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[Save] Results JSON saved → {out_path}")
    return results
 
 
# ─── 7. Main ──────────────────────────────────────────────────────────────────
 
def main():
    print("\n🩸  BloodBI — KNN Donor Prediction Pipeline")
    print("=" * 55)
 
    df = load_from_database()
 
    X_train_s, X_test_s, y_train, y_test, scaler, X_test_raw, df = preprocess(df)
 
    model, y_pred, y_proba, accuracy, auc, cv_scores, cm, report = \
        train_and_evaluate(X_train_s, X_test_s, y_train, y_test)
 
    plot_confusion_matrix(cm,
        os.path.join(GRAPHS_DIR, "knn_confusion_matrix.png"))
    plot_roc_curve(y_test, y_proba, auc,
        os.path.join(GRAPHS_DIR, "knn_roc_curve.png"))
    plot_feature_importance(model, X_train_s, y_train,
        os.path.join(GRAPHS_DIR, "knn_feature_importance.png"))
    plot_cv_scores(cv_scores,
        os.path.join(GRAPHS_DIR, "knn_cv_scores.png"))
 
    high_risk = extract_high_risk(df, scaler, model, top_n=20)
    results   = save_results(model, scaler, accuracy, auc, cv_scores,
                              report, high_risk, df)
 
    print(f"\n✅  Pipeline complete.")
    print(f"   Accuracy : {accuracy*100:.2f}%")
    print(f"   AUC-ROC  : {auc:.4f}")
    print(f"   CV-5 Avg : {cv_scores.mean()*100:.2f}%")
    return results
 
 
if __name__ == "__main__":
    main()
