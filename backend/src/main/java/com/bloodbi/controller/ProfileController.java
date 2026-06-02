package com.bloodbi.controller;

import com.bloodbi.model.AppUser;
import com.bloodbi.model.DonorProfile;
import com.bloodbi.repository.AppUserRepository;
import com.bloodbi.repository.DonorProfileRepository;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final DonorProfileRepository donors;
    private final AppUserRepository users;

    public ProfileController(
            DonorProfileRepository donors,
            AppUserRepository users
    ) {
        this.donors = donors;
        this.users = users;
    }

    @GetMapping
    public DonorProfile profile(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization
    ) {

        if (
                authorization != null &&
                authorization.startsWith("Bearer demo-token-")
        ) {

            String idText =
                    authorization.replace(
                            "Bearer demo-token-",
                            ""
                    );

            Long userId =
                    Long.parseLong(idText);

            AppUser user =
                    users.findById(userId)
                            .orElseThrow();

            return donors.findByEmail(user.email)
                    .orElse(null);
        }

        return null;
    }

    @PutMapping("/{id}")
    public DonorProfile update(
            @PathVariable Long id,
            @RequestBody DonorProfile updated
    ) {

        DonorProfile donor =
                donors.findById(id)
                        .orElseThrow();

        donor.fullName =
                updated.fullName;

        donor.phone =
                updated.phone;

        donor.city =
                updated.city;

        donor.address =
                updated.address;

        donor.available =
                updated.available;

        return donors.save(donor);
    }
}