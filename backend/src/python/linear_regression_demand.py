"""
BloodBI Analytics — Linear Regression Blood Demand Prediction

Forecasts the number of blood bags requested per day
for the next 30 days, broken down by blood type.

Output:
  - models/lr_demand_model.pkl
  - models/lr_scaler.pkl
  - models/lr_results.json
  - models/graphs/lr_*.png
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from datetime import datetime, timedelta

import mysql.connector
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


# ─── Configuration ────────────────────────────────────────────────────────────

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "bloodbi"),
}

MODELS_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../../../models"
    )
)

GRAPHS_DIR = os.path.join(
    MODELS_DIR,
    "graphs"
)

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(GRAPHS_DIR, exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE = 0.20
FORECAST_DAYS = 30
MIN_REAL_ROWS = 80
MIN_TRAINING_ROWS = 30

BLOOD_TYPES = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
]

BLOOD_TYPE_MAP = {
    "A_POS": "A+",
    "A_NEG": "A-",
    "B_POS": "B+",
    "B_NEG": "B-",
    "AB_POS": "AB+",
    "AB_NEG": "AB-",
    "O_POS": "O+",
    "O_NEG": "O-",
    "A+": "A+",
    "A-": "A-",
    "B+": "B+",
    "B-": "B-",
    "AB+": "AB+",
    "AB-": "AB-",
    "O+": "O+",
    "O-": "O-",
}

BLOOD_TYPE_ENCODING = {
    "A+": 1,
    "A-": 2,
    "B+": 3,
    "B-": 4,
    "AB+": 5,
    "AB-": 6,
    "O+": 7,
    "O-": 8,
}


# ─── 1. Data Loading ──────────────────────────────────────────────────────────

def normalize_blood_type(value):
    if value is None:
        return "O+"

    text = str(value).strip()

    return BLOOD_TYPE_MAP.get(
        text,
        text
    )


def load_from_database() -> pd.DataFrame:
    """
    Loads blood requests from MySQL.

    Correct table:
        blood_requests

    Correct date column:
        created_at

    If the database contains too few rows for training,
    the script falls back to synthetic data.
    """

    query = """
        SELECT
            DATE(br.created_at) AS date,
            DAYOFWEEK(br.created_at) AS day_of_week,
            DAYOFMONTH(br.created_at) AS day_of_month,
            MONTH(br.created_at) AS month,

            CASE
                WHEN DAYOFWEEK(br.created_at) IN (1, 7)
                THEN 1
                ELSE 0
            END AS is_weekend,

            br.blood_type AS blood_type,

            COUNT(*) AS requests_count

        FROM blood_requests br

        WHERE br.created_at >= DATE_SUB(CURDATE(), INTERVAL 18 MONTH)

        GROUP BY
            DATE(br.created_at),
            br.blood_type

        ORDER BY date
    """

    try:
        conn = mysql.connector.connect(
            **DB_CONFIG
        )

        df = pd.read_sql(
            query,
            conn
        )

        conn.close()

        if df.empty:
            print("[DB] Table blood_requests is empty.")
            print("[DB] Falling back to synthetic data ...")
            return _synthetic_data()

        df["date"] = pd.to_datetime(
            df["date"]
        )

        df["blood_type"] = df[
            "blood_type"
        ].apply(
            normalize_blood_type
        )

        df["blood_type_encoded"] = df[
            "blood_type"
        ].map(
            BLOOD_TYPE_ENCODING
        ).fillna(0).astype(int)

        print(
            f"[DB] Loaded {len(df):,} daily blood-request rows from MySQL."
        )

        if len(df) < MIN_REAL_ROWS:
            print(
                "[DB] Not enough real rows for Linear Regression training."
            )
            print(
                f"[DB] Minimum required: {MIN_REAL_ROWS} aggregated rows."
            )
            print(
                "[DB] Falling back to synthetic data ..."
            )

            return _synthetic_data()

        return df

    except Exception as err:
        print(
            f"[DB] Loading failed: {err}"
        )
        print(
            "[DB] Falling back to synthetic data ..."
        )

        return _synthetic_data()


def _synthetic_data(days: int = 540) -> pd.DataFrame:
    """
    Generates 18 months of synthetic daily request data
    for all 8 blood types.
    """

    rng = np.random.default_rng(
        RANDOM_STATE
    )

    dates = [
        datetime.today() -
        timedelta(days=days - i)
        for i in range(days)
    ]

    rows = []

    for bt_idx, bt in enumerate(BLOOD_TYPES):
        base = rng.integers(
            4,
            18
        )

        for i, d in enumerate(dates):
            trend = i * 0.003

            weekly = 3 * np.sin(
                2 * np.pi * i / 7
            )

            monthly = 1.5 * np.cos(
                2 * np.pi * i / 30
            )

            noise = rng.normal(
                0,
                1.2
            )

            count = max(
                0,
                int(
                    base +
                    trend +
                    weekly +
                    monthly +
                    noise
                )
            )

            rows.append({
                "date": d,
                "day_of_week": d.isoweekday(),
                "day_of_month": d.day,
                "month": d.month,
                "is_weekend": int(
                    d.isoweekday() >= 6
                ),
                "blood_type_encoded": bt_idx + 1,
                "blood_type": bt,
                "requests_count": count,
            })

    df = pd.DataFrame(rows)

    print(
        f"[Synth] Generated {len(df):,} synthetic daily rows."
    )

    return df


# ─── 2. Feature Engineering ──────────────────────────────────────────────────

FEATURE_COLS = [
    "day_of_week",
    "day_of_month",
    "month",
    "is_weekend",
    "blood_type_encoded",
    "requests_lag1",
    "requests_lag7",
    "rolling_mean_7d",
]

TARGET_COL = "requests_count"


def engineer_features(
    df: pd.DataFrame
) -> pd.DataFrame:
    """
    Adds lag and rolling mean features per blood type.
    """

    df = df.sort_values(
        [
            "blood_type",
            "date",
        ]
    ).copy()

    df["requests_lag1"] = df.groupby(
        "blood_type"
    )["requests_count"].shift(1)

    df["requests_lag7"] = df.groupby(
        "blood_type"
    )["requests_count"].shift(7)

    df["rolling_mean_7d"] = (
        df.groupby(
            "blood_type"
        )["requests_count"]
        .transform(
            lambda x:
                x.shift(1)
                .rolling(
                    7,
                    min_periods=1
                )
                .mean()
        )
    )

    df = df.dropna(
        subset=FEATURE_COLS
    )

    return df


# ─── 3. Training & Evaluation ─────────────────────────────────────────────────

def train_and_evaluate(
    df: pd.DataFrame
):
    df = engineer_features(df)

    if df.empty or len(df) < MIN_TRAINING_ROWS:
        print(
            "[ML] Not enough rows after feature engineering."
        )
        print(
            "[ML] Falling back to synthetic training data ..."
        )

        df = _synthetic_data()
        df = engineer_features(df)

    X = df[FEATURE_COLS].astype(float)
    y = df[TARGET_COL].astype(float)

    if len(X) < MIN_TRAINING_ROWS:
        raise ValueError(
            "Not enough samples to train the Linear Regression model."
        )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        shuffle=False,
    )

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(
        X_train
    )

    X_test_scaled = scaler.transform(
        X_test
    )

    model = LinearRegression()

    model.fit(
        X_train_scaled,
        y_train
    )

    y_pred = model.predict(
        X_test_scaled
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            y_pred
        )
    )

    mae = mean_absolute_error(
        y_test,
        y_pred
    )

    r2 = r2_score(
        y_test,
        y_pred
    )

    cv = cross_val_score(
        model,
        X_train_scaled,
        y_train,
        cv=5,
        scoring="r2",
    )

    print(
        f"\n{'═' * 55}"
    )
    print(
        "  Linear Regression Demand Forecast — Results"
    )
    print(
        f"{'═' * 55}"
    )
    print(
        f"  RMSE              : {rmse:.4f}"
    )
    print(
        f"  MAE               : {mae:.4f}"
    )
    print(
        f"  R²                : {r2:.4f}"
    )
    print(
        f"  CV-5 R²           : {cv.mean():.4f} ± {cv.std():.4f}"
    )
    print(
        f"{'═' * 55}\n"
    )

    return (
        model,
        scaler,
        df,
        y_test,
        y_pred,
        rmse,
        mae,
        r2,
        cv,
    )


# ─── 4. Forecast Next 30 Days ────────────────────────────────────────────────

def forecast_next_30_days(
    model,
    scaler,
    df: pd.DataFrame
) -> list:
    """
    Generates a 30-day forecast for each blood type.
    """

    today = datetime.today().date()
    forecasts = []

    for bt_idx, bt in enumerate(BLOOD_TYPES):
        bt_df = df[
            df["blood_type"] == bt
        ].sort_values(
            "date"
        )

        if bt_df.empty:
            continue

        last_7 = bt_df[
            "requests_count"
        ].iloc[-7:].tolist()

        last_1 = bt_df[
            "requests_count"
        ].iloc[-1]

        for d in range(
            1,
            FORECAST_DAYS + 1
        ):
            future_date = today + timedelta(
                days=d
            )

            lag1 = last_1

            lag7 = (
                last_7[-7]
                if len(last_7) >= 7
                else np.mean(last_7)
            )

            roll7 = (
                np.mean(last_7[-7:])
                if len(last_7) >= 7
                else np.mean(last_7)
            )

            row = [[
                future_date.isoweekday(),
                future_date.day,
                future_date.month,
                int(
                    future_date.isoweekday() >= 6
                ),
                bt_idx + 1,
                lag1,
                lag7,
                roll7,
            ]]

            pred = float(
                model.predict(
                    scaler.transform(row)
                )[0]
            )

            pred = max(
                0,
                round(
                    pred,
                    2
                )
            )

            std = max(
                1,
                pred * 0.12
            )

            forecasts.append({
                "date": str(future_date),
                "blood_type": bt,
                "predicted_requests": pred,
                "confidence_lower": round(
                    max(
                        0,
                        pred - 1.96 * std
                    ),
                    2,
                ),
                "confidence_upper": round(
                    pred + 1.96 * std,
                    2,
                ),
            })

            last_7.append(pred)
            last_1 = pred

    return forecasts


# ─── 5. Visualisations ───────────────────────────────────────────────────────

PALETTE = {
    "bg": "#0f172a",
    "card": "#1e293b",
    "accent": "#e11d48",
    "blue": "#3b82f6",
    "green": "#22c55e",
    "text": "#f8fafc",
    "muted": "#94a3b8",
}


def _dark_fig(
    figsize=(9, 5)
):
    fig, ax = plt.subplots(
        figsize=figsize,
        facecolor=PALETTE["card"],
    )

    ax.set_facecolor(
        PALETTE["card"]
    )

    for spine in ax.spines.values():
        spine.set_color(
            "#334155"
        )

    ax.tick_params(
        colors=PALETTE["text"]
    )

    ax.xaxis.label.set_color(
        PALETTE["text"]
    )

    ax.yaxis.label.set_color(
        PALETTE["text"]
    )

    ax.title.set_color(
        PALETTE["text"]
    )

    return fig, ax


def plot_actual_vs_predicted(
    y_test,
    y_pred,
    out_path
):
    fig, ax = _dark_fig(
        (9, 5)
    )

    x = np.arange(
        min(
            200,
            len(y_test)
        )
    )

    ax.plot(
        x,
        list(y_test)[:200],
        color=PALETTE["blue"],
        lw=1.5,
        label="Actual",
    )

    ax.plot(
        x,
        y_pred[:200],
        color=PALETTE["accent"],
        lw=1.5,
        linestyle="--",
        label="Predicted",
    )

    ax.set_title(
        "Actual vs Predicted Daily Requests",
        fontsize=13,
    )

    ax.set_xlabel(
        "Time Index"
    )

    ax.set_ylabel(
        "Request Count"
    )

    ax.legend(
        facecolor=PALETTE["card"],
        edgecolor="#334155",
        labelcolor=PALETTE["text"],
    )

    plt.tight_layout()

    fig.savefig(
        out_path,
        dpi=120,
        bbox_inches="tight",
        facecolor=PALETTE["card"],
    )

    plt.close(fig)

    print(
        f"[Graph] Saved actual vs predicted → {out_path}"
    )


def plot_30d_forecast(
    forecasts: list,
    out_path
):
    df_f = pd.DataFrame(
        forecasts
    )

    df_f["date"] = pd.to_datetime(
        df_f["date"]
    )

    highlight = [
        "O+",
        "A+",
        "B+",
    ]

    fig, ax = _dark_fig(
        (10, 5)
    )

    colors = [
        PALETTE["accent"],
        PALETTE["blue"],
        PALETTE["green"],
    ]

    for bt, col in zip(
        highlight,
        colors
    ):
        sub = df_f[
            df_f["blood_type"] == bt
        ]

        if sub.empty:
            continue

        ax.plot(
            sub["date"],
            sub["predicted_requests"],
            lw=2,
            label=bt,
            color=col,
        )

        ax.fill_between(
            sub["date"],
            sub["confidence_lower"],
            sub["confidence_upper"],
            alpha=0.12,
            color=col,
        )

    ax.set_title(
        "30-Day Blood Request Forecast by Type",
        fontsize=13,
    )

    ax.set_xlabel(
        "Date"
    )

    ax.set_ylabel(
        "Predicted Requests / Day"
    )

    ax.tick_params(
        axis="x",
        rotation=30,
    )

    ax.legend(
        facecolor=PALETTE["card"],
        edgecolor="#334155",
        labelcolor=PALETTE["text"],
    )

    plt.tight_layout()

    fig.savefig(
        out_path,
        dpi=120,
        bbox_inches="tight",
        facecolor=PALETTE["card"],
    )

    plt.close(fig)

    print(
        f"[Graph] Saved 30-day forecast → {out_path}"
    )


def plot_residuals(
    y_test,
    y_pred,
    out_path
):
    residuals = np.array(
        list(y_test)
    ) - y_pred

    fig, axes = plt.subplots(
        1,
        2,
        figsize=(12, 5),
        facecolor=PALETTE["card"],
    )

    for ax in axes:
        ax.set_facecolor(
            PALETTE["card"]
        )

        for spine in ax.spines.values():
            spine.set_color(
                "#334155"
            )

        ax.tick_params(
            colors=PALETTE["text"]
        )

        ax.xaxis.label.set_color(
            PALETTE["text"]
        )

        ax.yaxis.label.set_color(
            PALETTE["text"]
        )

        ax.title.set_color(
            PALETTE["text"]
        )

    axes[0].scatter(
        y_pred,
        residuals,
        alpha=0.4,
        color=PALETTE["blue"],
        s=12,
    )

    axes[0].axhline(
        0,
        color=PALETTE["accent"],
        lw=1.5,
        linestyle="--",
    )

    axes[0].set_xlabel(
        "Predicted"
    )

    axes[0].set_ylabel(
        "Residual"
    )

    axes[0].set_title(
        "Residuals vs Fitted",
        fontsize=12,
    )

    axes[1].hist(
        residuals,
        bins=35,
        color=PALETTE["blue"],
        edgecolor="#334155",
        alpha=0.85,
    )

    axes[1].axvline(
        0,
        color=PALETTE["accent"],
        lw=1.5,
        linestyle="--",
    )

    axes[1].set_xlabel(
        "Residual"
    )

    axes[1].set_ylabel(
        "Frequency"
    )

    axes[1].set_title(
        "Residual Distribution",
        fontsize=12,
    )

    plt.tight_layout()

    fig.savefig(
        out_path,
        dpi=120,
        bbox_inches="tight",
        facecolor=PALETTE["card"],
    )

    plt.close(fig)

    print(
        f"[Graph] Saved residuals → {out_path}"
    )


def plot_coefficients(
    model,
    out_path
):
    coefs = model.coef_
    abs_coef = np.abs(coefs)
    indices = np.argsort(abs_coef)[::-1]

    labels = [
        FEATURE_COLS[i]
        for i in indices
    ]

    colors = [
        PALETTE["accent"]
        if c > 0
        else PALETTE["blue"]
        for c in coefs[indices]
    ]

    fig, ax = _dark_fig(
        (8, 4)
    )

    ax.barh(
        labels[::-1],
        coefs[indices][::-1],
        color=colors[::-1],
        edgecolor="#334155",
        height=0.55,
    )

    ax.axvline(
        0,
        color="#475569",
        lw=1,
    )

    ax.set_title(
        "Regression Coefficients",
        fontsize=13,
    )

    ax.set_xlabel(
        "Coefficient value"
    )

    plt.tight_layout()

    fig.savefig(
        out_path,
        dpi=120,
        bbox_inches="tight",
        facecolor=PALETTE["card"],
    )

    plt.close(fig)

    print(
        f"[Graph] Saved coefficients → {out_path}"
    )


# ─── 6. Zone Risk ─────────────────────────────────────────────────────────────

def compute_zone_risk(
    forecasts: list
) -> list:
    df_f = pd.DataFrame(
        forecasts
    )

    agg = df_f.groupby(
        "blood_type"
    )["predicted_requests"].mean().reset_index()

    thresholds = {
        "CRITICAL": 15,
        "HIGH": 10,
        "MEDIUM": 6,
    }

    def label(value):
        if value >= thresholds["CRITICAL"]:
            return "CRITICAL"

        if value >= thresholds["HIGH"]:
            return "HIGH"

        if value >= thresholds["MEDIUM"]:
            return "MEDIUM"

        return "LOW"

    agg["risk"] = agg[
        "predicted_requests"
    ].apply(label)

    agg["avg_daily_need"] = agg[
        "predicted_requests"
    ].round(2)

    return agg[
        [
            "blood_type",
            "avg_daily_need",
            "risk",
        ]
    ].to_dict(
        orient="records"
    )


# ─── 7. Persist ──────────────────────────────────────────────────────────────

def save_results(
    model,
    scaler,
    rmse,
    mae,
    r2,
    cv,
    forecasts,
    zone_risk,
):
    joblib.dump(
        model,
        os.path.join(
            MODELS_DIR,
            "lr_demand_model.pkl"
        )
    )

    joblib.dump(
        scaler,
        os.path.join(
            MODELS_DIR,
            "lr_scaler.pkl"
        )
    )

    print(
        f"[Save] Models saved to {MODELS_DIR}/"
    )

    df_f = pd.DataFrame(
        forecasts
    )

    df_f["date"] = pd.to_datetime(
        df_f["date"]
    )

    weekly = (
        df_f.groupby(
            [
                pd.Grouper(
                    key="date",
                    freq="W"
                ),
                "blood_type",
            ]
        )["predicted_requests"]
        .sum()
        .reset_index()
    )

    weekly["date"] = weekly[
        "date"
    ].astype(str)

    weekly_list = weekly.to_dict(
        orient="records"
    )

    results = {
        "model": "Linear Regression Blood Demand",
        "version": "1.0.0",
        "features": FEATURE_COLS,
        "metrics": {
            "rmse": round(
                float(rmse),
                4
            ),
            "mae": round(
                float(mae),
                4
            ),
            "r2": round(
                float(r2),
                4
            ),
            "cv_mean": round(
                float(cv.mean()),
                4
            ),
            "cv_std": round(
                float(cv.std()),
                4
            ),
        },
        "forecast_days": FORECAST_DAYS,
        "daily_forecasts": forecasts,
        "weekly_forecasts": weekly_list,
        "zone_risk": zone_risk,
        "graphs": {
            "actual_vs_predicted":
                "models/graphs/lr_actual_vs_predicted.png",
            "forecast_30d":
                "models/graphs/lr_forecast_30d.png",
            "residuals":
                "models/graphs/lr_residuals.png",
            "coefficients":
                "models/graphs/lr_coefficients.png",
        },
    }

    out_path = os.path.join(
        MODELS_DIR,
        "lr_results.json"
    )

    with open(
        out_path,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            results,
            file,
            indent=2,
            ensure_ascii=False
        )

    print(
        f"[Save] Results JSON saved → {out_path}"
    )

    return results


# ─── 8. Main ─────────────────────────────────────────────────────────────────

def main():
    print(
        "\n🩸  BloodBI — Linear Regression Demand Forecast Pipeline"
    )

    print(
        "=" * 55
    )

    df = load_from_database()

    (
        model,
        scaler,
        df_fe,
        y_test,
        y_pred,
        rmse,
        mae,
        r2,
        cv,
    ) = train_and_evaluate(df)

    plot_actual_vs_predicted(
        y_test,
        y_pred,
        os.path.join(
            GRAPHS_DIR,
            "lr_actual_vs_predicted.png"
        )
    )

    plot_residuals(
        y_test,
        y_pred,
        os.path.join(
            GRAPHS_DIR,
            "lr_residuals.png"
        )
    )

    plot_coefficients(
        model,
        os.path.join(
            GRAPHS_DIR,
            "lr_coefficients.png"
        )
    )

    forecasts = forecast_next_30_days(
        model,
        scaler,
        df_fe
    )

    plot_30d_forecast(
        forecasts,
        os.path.join(
            GRAPHS_DIR,
            "lr_forecast_30d.png"
        )
    )

    zone_risk = compute_zone_risk(
        forecasts
    )

    results = save_results(
        model,
        scaler,
        rmse,
        mae,
        r2,
        cv,
        forecasts,
        zone_risk,
    )

    print(
        "\n✅  Pipeline complete."
    )

    print(
        f"   RMSE : {rmse:.4f}"
    )

    print(
        f"   R²   : {r2:.4f}"
    )

    print(
        f"   MAE  : {mae:.4f}"
    )

    return results


if __name__ == "__main__":
    main()