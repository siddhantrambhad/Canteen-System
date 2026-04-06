package com.example.order_service.dto;

import java.math.BigDecimal;

// Sent by frontend to POST /orders/confirm-payment after user completes Razorpay checkout
// razorpayPaymentId and razorpaySignature are provided by Razorpay JS widget after success
public class ConfirmPaymentRequest {

    private Long orderId;
    private BigDecimal amount;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
}
