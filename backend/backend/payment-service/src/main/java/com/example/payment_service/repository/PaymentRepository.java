package com.example.payment_service.repository;

import com.example.payment_service.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // No custom queries — filtering done in service layer
}
