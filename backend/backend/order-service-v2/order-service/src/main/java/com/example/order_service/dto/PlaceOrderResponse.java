package com.example.order_service.dto;

import com.example.order_service.model.Order;
import java.math.BigDecimal;

// Returned to frontend after placing an order
// Frontend uses razorpayOrderId + razorpayKeyId to open Razorpay checkout widget
// After user pays, frontend calls POST /orders/confirm-payment with the payment details
public class PlaceOrderResponse {

    private Order order;
    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private String razorpayKeyId;   // frontend needs this to open the widget

    public PlaceOrderResponse() {}

    public PlaceOrderResponse(Order order, String razorpayOrderId, BigDecimal amount,
                               String currency, String razorpayKeyId) {
        this.order = order;
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = currency;
        this.razorpayKeyId = razorpayKeyId;
    }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getRazorpayKeyId() { return razorpayKeyId; }
    public void setRazorpayKeyId(String razorpayKeyId) { this.razorpayKeyId = razorpayKeyId; }
}
