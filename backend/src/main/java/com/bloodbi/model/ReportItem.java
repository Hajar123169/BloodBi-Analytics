package com.bloodbi.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "report_items")
public class ReportItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String reportType;
    public String centerName;
    public String city;
    public String status;
    public String priority;
    public String findings;
    public LocalDate reportDate;
}
