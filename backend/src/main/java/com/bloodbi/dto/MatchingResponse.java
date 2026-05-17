package com.bloodbi.dto;

import com.bloodbi.model.BloodRequest;
import com.bloodbi.model.Enums.BloodType;
import java.util.List;

public record MatchingResponse(
        BloodRequest request,
        BloodType searchedBloodType,
        String searchedCity,
        List<BloodType> compatibleBloodTypes,
        List<DonorMatchResult> matches
) {}
