package com.bloodbi.controller;
 
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
 
/**
 * BloodBI Analytics — AI Prediction REST Controller
 *
 * Exposes four endpoints that serve results pre-computed by the Python
 * KNN and Linear-Regression pipelines.
 *
 * All endpoints are under /api/predictions and return JSON.
 * The models directory is resolved relative to the working directory
 * (project root) so both "mvn spring-boot:run" and a packaged JAR work.
 *
 * Endpoints:
 *   GET /api/predictions/demand          → 30-day blood demand forecast
 *   GET /api/predictions/donor-behavior  → KNN donor churn model metrics
 *   GET /api/predictions/high-risk       → Top 20 donors likely to churn
 *   GET /api/predictions/zone-risk       → Risk level per blood type
 *   GET /api/predictions/graph/{name}    → Serve a pre-generated PNG chart
 */
@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PredictionController {
 
   private static final String MODELS_DIR =
        "C:/Users/emans/OneDrive/Desktop/bloodbi_app/models";
    private final ObjectMapper  mapper     = new ObjectMapper();
 
    // ─── Helpers ──────────────────────────────────────────────────────────────
 
    /**
     * Loads a JSON result file from the models directory.
     * Returns a descriptive error map if the file is missing or unreadable.
     */
    private Map<String, Object> loadJson(String filename) {
        Path path = Paths.get(MODELS_DIR, filename);
        if (!Files.exists(path)) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error",   "Model results not found");
            err.put("detail",  "Run the Python pipeline first: python backend/src/python/" + filename.replace(".json", ".py"));
            err.put("missing", path.toAbsolutePath().toString());
            return err;
        }
        try {
            JsonNode node = mapper.readTree(path.toFile());
            return mapper.convertValue(node, Map.class);
        } catch (IOException e) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error",  "Failed to parse results JSON");
            err.put("detail", e.getMessage());
            return err;
        }
    }
 
    // ─── 1. Blood Demand Forecast ─────────────────────────────────────────────
 
    /**
     * Returns the full Linear-Regression demand forecast payload.
     *
     * Response shape (subset):
     * {
     *   "metrics":           { rmse, mae, r2, cv_mean, cv_std },
     *   "daily_forecasts":   [ { date, blood_type, predicted_requests,
     *                            confidence_lower, confidence_upper } … ],
     *   "weekly_forecasts":  [ { date, blood_type, predicted_requests } … ],
     *   "zone_risk":         [ { blood_type, avg_daily_need, risk } … ]
     * }
     */
    @GetMapping("/demand")
    public ResponseEntity<Map<String, Object>> getDemandForecast() {
        Map<String, Object> data = loadJson("lr_results.json");
        return ResponseEntity.ok(data);
    }
 
    // ─── 2. Donor Behavior Model Metrics ──────────────────────────────────────
 
    /**
     * Returns KNN model metrics (accuracy, AUC-ROC, CV scores,
     * classification report, class distribution).
     * Strips the potentially-large high_risk_donors list for this endpoint
     * — use /high-risk for that.
     */
    @GetMapping("/donor-behavior")
    public ResponseEntity<Map<String, Object>> getDonorBehavior() {
        Map<String, Object> full = loadJson("knn_results.json");
        if (full.containsKey("error")) {
            return ResponseEntity.ok(full);
        }
        // Return everything except the full donor list (separate endpoint)
        Map<String, Object> summary = new LinkedHashMap<>(full);
        summary.remove("high_risk_donors");
        return ResponseEntity.ok(summary);
    }
 
    // ─── 3. High-Risk Donors ──────────────────────────────────────────────────
 
    /**
     * Returns the top-N donors most at risk of not donating again.
     * Supports optional ?limit=N query parameter (default 20, max 50).
     *
     * Response shape:
     * {
     *   "count": 20,
     *   "high_risk_donors": [ { donor_id, recency_months, frequency,
     *                           blood_type_encoded, churn_risk } … ]
     * }
     */
    @GetMapping("/high-risk")
    public ResponseEntity<Map<String, Object>> getHighRiskDonors(
            @RequestParam(defaultValue = "20") int limit) {
 
        Map<String, Object> full = loadJson("knn_results.json");
        if (full.containsKey("error")) {
            return ResponseEntity.ok(full);
        }
 
        Object rawList = full.get("high_risk_donors");
        List<Map<String, Object>> donors = new ArrayList<>();
        if (rawList instanceof List) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> casted = (List<Map<String, Object>>) rawList;
            int cap = Math.min(Math.min(limit, 50), casted.size());
            donors = casted.subList(0, cap);
        }
 
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("count",             donors.size());
        response.put("model_accuracy",    full.get("accuracy"));
        response.put("model_auc",         full.get("auc_roc"));
        response.put("high_risk_donors",  donors);
        return ResponseEntity.ok(response);
    }
 
    // ─── 4. Zone / Blood-Type Risk ────────────────────────────────────────────
 
    /**
     * Returns the aggregated risk level per blood type from the LR forecast.
     *
     * Response shape:
     * {
     *   "forecast_days": 30,
     *   "zone_risk": [
     *     { "blood_type": "O+", "avg_daily_need": 12.4, "risk": "HIGH" }, …
     *   ]
     * }
     */
    @GetMapping("/zone-risk")
    public ResponseEntity<Map<String, Object>> getZoneRisk() {
        Map<String, Object> full = loadJson("lr_results.json");
        if (full.containsKey("error")) {
            return ResponseEntity.ok(full);
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("forecast_days", full.get("forecast_days"));
        response.put("zone_risk",     full.get("zone_risk"));
        response.put("metrics",       full.get("metrics"));
        return ResponseEntity.ok(response);
    }
 
    // ─── 5. Graph Serving ─────────────────────────────────────────────────────
 
    /**
     * Serves a pre-generated PNG graph by name.
     * Valid names: knn_confusion_matrix, knn_roc_curve,
     *              knn_feature_importance, knn_cv_scores,
     *              lr_actual_vs_predicted, lr_forecast_30d,
     *              lr_residuals, lr_coefficients
     *
     * Example: GET /api/predictions/graph/knn_roc_curve
     */
    @GetMapping(value = "/graph/{name}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getGraph(@PathVariable String name) {
        // Sanitise: allow only alphanumeric + underscore
        if (!name.matches("[a-zA-Z0-9_]+")) {
            return ResponseEntity.badRequest().build();
        }
        Path path = Paths.get(MODELS_DIR, "graphs", name + ".png");
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }
        try {
            byte[] bytes = Files.readAllBytes(path);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(bytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
 
    // ─── 6. Health / Summary ──────────────────────────────────────────────────
 
    /**
     * Quick status endpoint — tells the frontend which models are ready.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
 
        boolean knnReady = Files.exists(Paths.get(MODELS_DIR, "knn_results.json"));
        boolean lrReady  = Files.exists(Paths.get(MODELS_DIR, "lr_results.json"));
 
        status.put("knn_model_ready",      knnReady);
        status.put("lr_model_ready",       lrReady);
        status.put("all_models_ready",     knnReady && lrReady);
        status.put("timestamp",            new Date().toString());
 
        if (knnReady) {
            Map<String, Object> knn = loadJson("knn_results.json");
            status.put("knn_accuracy",  knn.get("accuracy"));
            status.put("knn_auc",       knn.get("auc_roc"));
        }
        if (lrReady) {
            Map<String, Object> lr = loadJson("lr_results.json");
            Object metrics = lr.get("metrics");
            status.put("lr_metrics", metrics);
        }
        return ResponseEntity.ok(status);
    }
}
 