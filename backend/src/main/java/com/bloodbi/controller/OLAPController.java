// backend/src/main/java/com/bloodbi/controller/OLAPController.java
package com.bloodbi.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/olap")
@CrossOrigin(origins = "http://localhost:3000")
public class OLAPController {

    private final JdbcTemplate jdbcTemplate;

    public OLAPController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/by-city")
    public List<Map<String, Object>> getOlapByCity() {
        return jdbcTemplate.queryForList("SELECT * FROM view_olap_by_city");
    }

    @GetMapping("/by-blood-type")
    public List<Map<String, Object>> getOlapByBloodType() {
        return jdbcTemplate.queryForList("SELECT * FROM view_olap_by_blood_type");
    }

    @GetMapping("/by-center")
    public List<Map<String, Object>> getOlapByCenter() {
        return jdbcTemplate.queryForList("SELECT * FROM view_olap_by_center");
    }

    @GetMapping("/by-period")
    public List<Map<String, Object>> getOlapByPeriod() {
        return jdbcTemplate.queryForList("SELECT * FROM view_olap_by_period");
    }
}
