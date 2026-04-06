package com.example.payment_service.dto;

import java.math.BigDecimal;

// Returned by GET /payments/summary — ADMIN only
// Shows total count and total revenue for today
public class DaySummary {

    private int totalPayments;
    private BigDecimal totalRevenue;

    public DaySummary(int totalPayments, BigDecimal totalRevenue) {
        this.totalPayments = totalPayments;
        this.totalRevenue  = totalRevenue;
    }

    public int getTotalPayments() { return totalPayments; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
}
