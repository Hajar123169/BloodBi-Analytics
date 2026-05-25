package com.bloodbi.controller;

import com.bloodbi.model.Appointment;
import com.bloodbi.model.BloodBankCenter;
import com.bloodbi.model.BloodRequest;
import com.bloodbi.model.Donation;
import com.bloodbi.model.DonorProfile;
import com.bloodbi.model.Enums.AppointmentStatus;
import com.bloodbi.model.Enums.DonationStatus;
import com.bloodbi.model.Enums.RequestStatus;
import com.bloodbi.repository.AppointmentRepository;
import com.bloodbi.repository.BloodBankCenterRepository;
import com.bloodbi.repository.BloodRequestRepository;
import com.bloodbi.repository.DonationRepository;
import com.bloodbi.repository.DonorProfileRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentRepository appointments;
    private final DonorProfileRepository donors;
    private final BloodRequestRepository requests;
    private final BloodBankCenterRepository centers;
    private final DonationRepository donations;

    public AppointmentController(AppointmentRepository appointments,
                                 DonorProfileRepository donors,
                                 BloodRequestRepository requests,
                                 BloodBankCenterRepository centers,
                                 DonationRepository donations) {
        this.appointments = appointments;
        this.donors = donors;
        this.requests = requests;
        this.centers = centers;
        this.donations = donations;
    }

    @GetMapping
    public List<Appointment> all(@RequestParam(required = false) AppointmentStatus status) {
        return status == null
                ? appointments.findAllByOrderByScheduledAtAsc()
                : appointments.findByStatusOrderByScheduledAtAsc(status);
    }

    @GetMapping("/upcoming")
    public List<Appointment> upcoming(@RequestParam(defaultValue = "7") int days) {
        LocalDateTime now = LocalDateTime.now();
        return appointments.findByScheduledAtBetweenOrderByScheduledAtAsc(now, now.plusDays(Math.max(1, days)));
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        Map<String, Long> data = new LinkedHashMap<>();
        data.put("pending", appointments.countByStatus(AppointmentStatus.PENDING));
        data.put("confirmed", appointments.countByStatus(AppointmentStatus.CONFIRMED));
        data.put("done", appointments.countByStatus(AppointmentStatus.DONE));
        data.put("cancelled", appointments.countByStatus(AppointmentStatus.CANCELLED));
        return data;
    }

    @PostMapping
    public Appointment create(@RequestBody Appointment appointment) {
        normalizeRelations(appointment);
        if (appointment.status == null) appointment.status = AppointmentStatus.PENDING;
        if (appointment.scheduledAt == null) appointment.scheduledAt = LocalDateTime.now().plusDays(1);
        if (appointment.center == null && appointment.request != null) appointment.center = appointment.request.center;
        if (appointment.center == null && appointment.donor != null) appointment.center = appointment.donor.preferredCenter;
        if ((appointment.contactPhone == null || appointment.contactPhone.isBlank()) && appointment.donor != null) {
            appointment.contactPhone = appointment.donor.phone;
        }
        return appointments.save(appointment);
    }

    @PostMapping("/from-match")
    public Appointment createFromMatch(@RequestParam Long requestId,
                                       @RequestParam Long donorId,
                                       @RequestParam(required = false) String scheduledAt) {
        BloodRequest request = requests.findById(requestId).orElseThrow();
        DonorProfile donor = donors.findById(donorId).orElseThrow();

        Appointment appointment = new Appointment();
        appointment.request = request;
        appointment.donor = donor;
        appointment.center = request.center != null ? request.center : donor.preferredCenter;
        appointment.status = AppointmentStatus.PENDING;
        appointment.scheduledAt = scheduledAt == null || scheduledAt.isBlank()
                ? LocalDateTime.now().plusDays(1)
                : LocalDateTime.parse(scheduledAt);
        appointment.contactPhone = donor.phone;
        appointment.notes = "Rendez-vous cree depuis le Smart Matching";
        return appointments.save(appointment);
    }

    @PatchMapping("/{id}/confirm")
    public Appointment confirm(@PathVariable Long id) {
        Appointment appointment = appointments.findById(id).orElseThrow();
        appointment.status = AppointmentStatus.CONFIRMED;
        appointment.confirmedAt = LocalDateTime.now();
        return appointments.save(appointment);
    }

    @PatchMapping("/{id}/cancel")
    public Appointment cancel(@PathVariable Long id) {
        Appointment appointment = appointments.findById(id).orElseThrow();
        appointment.status = AppointmentStatus.CANCELLED;
        appointment.cancelledAt = LocalDateTime.now();
        return appointments.save(appointment);
    }

    @PatchMapping("/{id}/complete")
    public Appointment complete(@PathVariable Long id) {
        Appointment appointment = appointments.findById(id).orElseThrow();
        appointment.status = AppointmentStatus.DONE;
        appointment.completedAt = LocalDateTime.now();
        appointments.save(appointment);

        Donation donation = new Donation();
        donation.donor = appointment.donor;
        donation.request = appointment.request;
        donation.center = appointment.center;
        donation.status = DonationStatus.FULFILLED;
        donation.scheduledAt = appointment.scheduledAt;
        donation.donatedAt = LocalDateTime.now();
        donation.notes = "Donation creee automatiquement apres validation du rendez-vous";
        if (appointment.center != null) {
            donation.latitude = appointment.center.latitude;
            donation.longitude = appointment.center.longitude;
        } else if (appointment.request != null) {
            donation.latitude = appointment.request.latitude;
            donation.longitude = appointment.request.longitude;
        } else if (appointment.donor != null) {
            donation.latitude = appointment.donor.latitude;
            donation.longitude = appointment.donor.longitude;
        }
        donations.save(donation);

        if (appointment.donor != null) {
            DonorProfile donor = appointment.donor;
            donor.lastDonationDate = LocalDate.now();
            donor.totalDonations = donor.totalDonations == null ? 1 : donor.totalDonations + 1;
            donor.available = false;
            donors.save(donor);
        }

        if (appointment.request != null && appointment.request.status == RequestStatus.PENDING) {
            BloodRequest request = appointment.request;
            request.status = RequestStatus.FULFILLED;
            request.fulfilledAt = LocalDateTime.now();
            requests.save(request);
        }

        return appointments.findById(id).orElse(appointment);
    }

    @PutMapping("/{id}")
    public Appointment update(@PathVariable Long id, @RequestBody Appointment appointment) {
        Appointment existing = appointments.findById(id).orElseThrow();
        
        // Mettre à jour le donneur
        if (appointment.donor != null && appointment.donor.id != null) {
            existing.donor = donors.findById(appointment.donor.id).orElse(existing.donor);
        }
        
        // Mettre à jour la demande
        if (appointment.request != null && appointment.request.id != null) {
            existing.request = requests.findById(appointment.request.id).orElse(existing.request);
        }
        
        // Mettre à jour le centre
        if (appointment.center != null && appointment.center.id != null) {
            existing.center = centers.findById(appointment.center.id).orElse(existing.center);
        }
        
        // Mettre à jour la date et l'heure
        if (appointment.scheduledAt != null) {
            existing.scheduledAt = appointment.scheduledAt;
        }
        
        // Mettre à jour le statut et les dates associées
        if (appointment.status != null) {
            AppointmentStatus oldStatus = existing.status;
            existing.status = appointment.status;
            
            // Si le statut change vers CONFIRMED et que la date n'existe pas
            if (appointment.status == AppointmentStatus.CONFIRMED && existing.confirmedAt == null) {
                existing.confirmedAt = LocalDateTime.now();
            }
            
            // Si le statut change vers CANCELLED et que la date n'existe pas
            if (appointment.status == AppointmentStatus.CANCELLED && existing.cancelledAt == null) {
                existing.cancelledAt = LocalDateTime.now();
            }
            
            // Si le statut change vers DONE et que la date n'existe pas
            if (appointment.status == AppointmentStatus.DONE && existing.completedAt == null) {
                existing.completedAt = LocalDateTime.now();
            }
            
            // Si on revient à PENDING, réinitialiser les dates de confirmation/annulation
            if (appointment.status == AppointmentStatus.PENDING) {
                existing.confirmedAt = null;
                existing.cancelledAt = null;
            }
        }
        
        // Mettre à jour les notes
        if (appointment.notes != null) {
            existing.notes = appointment.notes;
        }
        
        // Mettre à jour le téléphone de contact
        if (appointment.contactPhone != null && !appointment.contactPhone.isBlank()) {
            existing.contactPhone = appointment.contactPhone;
        } else if (existing.donor != null && existing.donor.phone != null) {
            existing.contactPhone = existing.donor.phone;
        }
        
        return appointments.save(existing);
    }

    private void normalizeRelations(Appointment appointment) {
        if (appointment.donor != null && appointment.donor.id != null) {
            appointment.donor = donors.findById(appointment.donor.id).orElseThrow();
        }
        if (appointment.request != null && appointment.request.id != null) {
            appointment.request = requests.findById(appointment.request.id).orElseThrow();
        }
        if (appointment.center != null && appointment.center.id != null) {
            appointment.center = centers.findById(appointment.center.id).orElseThrow();
        }
    }
}