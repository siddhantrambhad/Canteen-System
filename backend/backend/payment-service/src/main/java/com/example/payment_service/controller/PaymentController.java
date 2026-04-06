package com.example.payment_service.controller;

import com.example.payment_service.dto.DaySummary;
import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.model.Payment;
import com.example.payment_service.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.payment_service.dto.RazorpayOrderResponse;
import java.math.BigDecimal;
@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Called internally by order-service — no JWT on this call
    // JwtInterceptor whitelists POST /payments so it passes through without a token
    // No role check needed here — only order-service ever calls this
   
    @PostMapping("/create-order")
    public RazorpayOrderResponse createRazorpayOrder(@RequestParam Long orderId,
                                                      @RequestParam BigDecimal amount) throws Exception {
        return paymentService.createRazorpayOrder(orderId, amount);
    }
    
    @PostMapping
    public Payment processPayment(@RequestBody PaymentRequest request) {
        return paymentService.processPayment(request);
    }

    // Called by client with JWT — get payment details for a specific order
    // Any authenticated user can call this (USER or ADMIN)
    @GetMapping("/order/{orderId}")
    public Payment getPayment(@PathVariable Long orderId) {
        return paymentService.getPaymentByOrderId(orderId);
    }

    // ADMIN only — today's total payment count and revenue
    @GetMapping("/summary")
    public DaySummary getDaySummary(HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }

        return paymentService.getDaySummary();
    }
}
