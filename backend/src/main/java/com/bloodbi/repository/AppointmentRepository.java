
package com.bloodbi.repository;

import com.bloodbi.model.Appointment;
import com.bloodbi.model.Enums.AppointmentStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findAllByOrderByScheduledAtAsc();

    List<Appointment> findByStatusOrderByScheduledAtAsc(AppointmentStatus status);

    List<Appointment> findByScheduledAtBetweenOrderByScheduledAtAsc(
            LocalDateTime start,
            LocalDateTime end
    );

    long countByStatus(AppointmentStatus status);
}