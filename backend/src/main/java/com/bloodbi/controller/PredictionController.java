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
 * Exposes endpoints that serve results pre-computed by the Python
 * KNN and Linear Regression pipelines.
 *
 * Endpoints:
 *   GET /api/predictions/demand
 *   GET /api/predictions/donor-behavior
 *   GET /api/predictions/high-risk
 *   GET /api/predictions/zone-risk
 *   GET /api/predictions/graph/{name}
 *   GET /api/predictions/status
 */
@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001"
})
public class PredictionController {

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Dynamic path to the models folder.
     *
     * If backend is launched from:
     *   bloodbi-analytics/backend
     *
     * This method returns:
     *   bloodbi-analytics/models
     */
    private Path getModelsDir() {
        Path backendDir =
                Paths.get(
                        System.getProperty("user.dir")
                );

        return backendDir
                .getParent()
                .resolve("models")
                .toAbsolutePath()
                .normalize();
    }

    /**
     * Loads a JSON result file from the models directory.
     */
    private Map<String, Object> loadJson(
            String filename
    ) {

        Path path =
                getModelsDir()
                        .resolve(filename);

        if (!Files.exists(path)) {

            Map<String, Object> err =
                    new LinkedHashMap<>();

            err.put(
                    "error",
                    "Model results not found"
            );

            err.put(
                    "detail",
                    "Run the Python pipelines first from the project root: "
                            + "python backend/src/python/knn_donor_prediction.py "
                            + "and python backend/src/python/linear_regression_demand.py"
            );

            err.put(
                    "missing",
                    path.toString()
            );

            err.put(
                    "models_dir",
                    getModelsDir().toString()
            );

            return err;
        }

        try {

            JsonNode node =
                    mapper.readTree(
                            path.toFile()
                    );

            @SuppressWarnings("unchecked")
            Map<String, Object> result =
                    mapper.convertValue(
                            node,
                            Map.class
                    );

            return result;

        } catch (IOException e) {

            Map<String, Object> err =
                    new LinkedHashMap<>();

            err.put(
                    "error",
                    "Failed to parse results JSON"
            );

            err.put(
                    "detail",
                    e.getMessage()
            );

            err.put(
                    "file",
                    path.toString()
            );

            return err;
        }
    }

    /**
     * GET /api/predictions/demand
     *
     * Returns the full Linear Regression demand forecast payload.
     */
    @GetMapping("/demand")
    public ResponseEntity<Map<String, Object>> getDemandForecast() {

        Map<String, Object> data =
                loadJson("lr_results.json");

        return ResponseEntity.ok(data);
    }

    /**
     * GET /api/predictions/donor-behavior
     *
     * Returns KNN model metrics.
     */
    @GetMapping("/donor-behavior")
    public ResponseEntity<Map<String, Object>> getDonorBehavior() {

        Map<String, Object> full =
                loadJson("knn_results.json");

        if (full.containsKey("error")) {
            return ResponseEntity.ok(full);
        }

        Map<String, Object> summary =
                new LinkedHashMap<>(full);

        summary.remove("high_risk_donors");

        return ResponseEntity.ok(summary);
    }

    /**
     * GET /api/predictions/high-risk?limit=20
     *
     * Returns top high-risk donors.
     */
    @GetMapping("/high-risk")
    public ResponseEntity<Map<String, Object>> getHighRiskDonors(
            @RequestParam(defaultValue = "20") int limit
    ) {

        Map<String, Object> full =
                loadJson("knn_results.json");

        if (full.containsKey("error")) {
            return ResponseEntity.ok(full);
        }

        Object rawList =
                full.get("high_risk_donors");

        List<Map<String, Object>> donors =
                new ArrayList<>();

        if (rawList instanceof List<?>) {

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> casted =
                    (List<Map<String, Object>>) rawList;

            int safeLimit =
                    Math.max(
                            1,
                            Math.min(limit, 50)
                    );

            int cap =
                    Math.min(
                            safeLimit,
                            casted.size()
                    );

            donors =
                    casted.subList(
                            0,
                            cap
                    );
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "count",
                donors.size()
        );

        response.put(
                "model_accuracy",
                full.get("accuracy")
        );

        response.put(
                "model_auc",
                full.get("auc_roc")
        );

        response.put(
                "high_risk_donors",
                donors
        );

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/predictions/zone-risk
     *
     * Returns risk level per blood type.
     */
    @GetMapping("/zone-risk")
    public ResponseEntity<Map<String, Object>> getZoneRisk() {

        Map<String, Object> full =
                loadJson("lr_results.json");

        if (full.containsKey("error")) {
            return ResponseEntity.ok(full);
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "forecast_days",
                full.get("forecast_days")
        );

        response.put(
                "zone_risk",
                full.get("zone_risk")
        );

        response.put(
                "metrics",
                full.get("metrics")
        );

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/predictions/graph/{name}
     *
     * Serves pre-generated PNG graphs.
     *
     * Examples:
     *   /api/predictions/graph/knn_confusion_matrix
     *   /api/predictions/graph/knn_roc_curve
     *   /api/predictions/graph/knn_feature_importance
     *   /api/predictions/graph/knn_cv_scores
     *   /api/predictions/graph/lr_actual_vs_predicted
     *   /api/predictions/graph/lr_forecast_30d
     *   /api/predictions/graph/lr_residuals
     *   /api/predictions/graph/lr_coefficients
     */
    @GetMapping(
            value = "/graph/{name}",
            produces = MediaType.IMAGE_PNG_VALUE
    )
    public ResponseEntity<byte[]> getGraph(
            @PathVariable String name
    ) {

        if (!name.matches("[a-zA-Z0-9_]+")) {
            return ResponseEntity
                    .badRequest()
                    .build();
        }

        Path path =
                getModelsDir()
                        .resolve("graphs")
                        .resolve(name + ".png");

        if (!Files.exists(path)) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        try {

            byte[] bytes =
                    Files.readAllBytes(path);

            return ResponseEntity
                    .ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(bytes);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    /**
     * GET /api/predictions/status
     *
     * Checks which AI files are ready.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {

        Path modelsDir =
                getModelsDir();

        boolean knnReady =
                Files.exists(
                        modelsDir.resolve("knn_results.json")
                );

        boolean lrReady =
                Files.exists(
                        modelsDir.resolve("lr_results.json")
                );

        boolean graphsReady =
                Files.exists(
                        modelsDir.resolve("graphs")
                );

        Map<String, Object> status =
                new LinkedHashMap<>();

        status.put(
                "models_dir",
                modelsDir.toString()
        );

        status.put(
                "knn_model_ready",
                knnReady
        );

        status.put(
                "lr_model_ready",
                lrReady
        );

        status.put(
                "graphs_ready",
                graphsReady
        );

        status.put(
                "all_models_ready",
                knnReady && lrReady
        );

        status.put(
                "timestamp",
                new Date().toString()
        );

        if (knnReady) {

            Map<String, Object> knn =
                    loadJson("knn_results.json");

            status.put(
                    "knn_accuracy",
                    knn.get("accuracy")
            );

            status.put(
                    "knn_auc",
                    knn.get("auc_roc")
            );
        }

        if (lrReady) {

            Map<String, Object> lr =
                    loadJson("lr_results.json");

            status.put(
                    "lr_metrics",
                    lr.get("metrics")
            );
        }

        return ResponseEntity.ok(status);
    }
}