# BloodBI Analytics: An open-source decision-support platform for blood donation data analysis

## Code metadata

| Field | Value |
|---|---|
| Current code version | v1.0.0 |
| Code repository | To be added after GitHub publication |
| Legal code license | MIT |
| Code versioning system | Git |
| Software code languages | Java, JavaScript, SQL |
| Frameworks | Spring Boot, React, React Native Expo, MySQL |
| Operating systems | Windows, Linux, macOS |

## 1. Motivation and significance

Blood is a vital, non-substitutable and perishable medical resource. Blood donation systems require good coordination between donors, patients, hospitals and blood bank centers. BloodBI Analytics addresses this need by combining operational management with BI dashboards for decision-making.

## 2. Software description

BloodBI Analytics contains three main parts:

1. A React web dashboard for decision-makers.
2. A Spring Boot and MySQL backend exposing REST APIs.
3. A React Native Expo mobile application inspired by LifeDrop for donors and patients.

Main modules include donors, blood requests, blood stock, donation centers, reports and critical alerts.

## 3. Illustrative examples

Example scenario: a hospital creates an urgent O- request. The backend stores the request, the dashboard marks it as critical, and the mobile application allows nearby compatible donors to view and respond to the need.

## 4. Impact

The platform supports better visibility of blood stocks, faster detection of shortage situations and improved coordination between centers and donors.

## 5. Conclusions

BloodBI Analytics adapts a healthcare BI architecture to the blood donation domain and provides a reusable open-source foundation for blood transfusion analytics.
