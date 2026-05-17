package com.bloodbi.dto;

import com.bloodbi.model.DonorProfile;
import java.util.List;

public record DonorMatchResult(
        DonorProfile donor,
        int score,
        Double distanceKm,
        boolean sameCity,
        boolean exactBloodType,
        boolean eligibleByDonationDelay,
        List<String> reasons,
        String recommendation
) {}

