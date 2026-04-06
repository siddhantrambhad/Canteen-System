package com.example.payment_service.dto;
import java.math.BigDecimal;

// Returned to order-service after creating a Razorpay order
// order-service passes razorpayOrderId back to the frontend to open checkout widget
public class RazorpayOrderResponse {

    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private String status;

    public RazorpayOrderResponse() {}

    public RazorpayOrderResponse(String razorpayOrderId, BigDecimal amount,
                                  String currency, String status) {
        this.razorpayOrderId = razorpayOrderId;
        this.amount          = amount;
        this.currency        = currency;
        this.status          = status;
    }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
