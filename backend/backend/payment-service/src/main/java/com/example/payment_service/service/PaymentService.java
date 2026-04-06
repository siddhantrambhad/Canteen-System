//package com.example.payment_service.service;
//
//import com.example.payment_service.dto.DaySummary;
//import com.example.payment_service.dto.PaymentRequest;
//import com.example.payment_service.dto.RazorpayOrderResponse;
//import com.example.payment_service.model.Payment;
//import com.example.payment_service.repository.PaymentRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.ArrayList;
//import java.util.List;
//import com.razorpay.RazorpayClient;
//import org.json.JSONObject;
//@Service
//public class PaymentService {
//
//	@Autowired
//	private RazorpayClient razorpayClient;
//	
//    @Autowired
//    private PaymentRepository paymentRepository;
//
//    // Called by order-service internally after saving order items
//    // Always marks payment as SUCCESS — real payment gateway would go here
//    
//    // Add this new method:
//    	public RazorpayOrderResponse createRazorpayOrder(Long orderId, BigDecimal amount) throws Exception {
//    	    JSONObject orderRequest = new JSONObject();
//    	    orderRequest.put("amount", amount.multiply(new BigDecimal(100)).intValue()); // paise
//    	    orderRequest.put("currency", "INR");
//    	    orderRequest.put("receipt", "ORD-" + orderId);
//
//    	    com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
//
//    	    return new RazorpayOrderResponse(
//    	        razorpayOrder.get("id"),
//    	        amount,
//    	        razorpayOrder.get("currency"),
//    	        razorpayOrder.get("status")
//    	    );
//    	}
//    
//    	public Payment processPayment(PaymentRequest request) {
//    	    Payment payment = new Payment();
//    	    payment.setOrderId(request.getOrderId());
//    	    payment.setAmount(request.getAmount());
//    	    payment.setRazorpayOrderId(request.getRazorpayOrderId());
//    	    payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
//    	    payment.setRazorpaySignature(request.getRazorpaySignature());
//    	    payment.setStatus("SUCCESS");
//    	    return paymentRepository.save(payment);
//    	}
//
//
//    // Called by client with JWT — returns payment record for a given order
//    public Payment getPaymentByOrderId(Long orderId) {
//        // No custom repository query — filter with a for loop
//        List<Payment> all = paymentRepository.findAll();
//        for (Payment payment : all) {
//            if (payment.getOrderId().equals(orderId)) {
//                return payment;
//            }
//        }
//        throw new RuntimeException("Payment not found for order: " + orderId);
//    }
//
//    // ADMIN — today's payment count and total revenue
//    public DaySummary getDaySummary() {
//
//        List<Payment> allPayments    = paymentRepository.findAll();
//        List<Payment> todayPayments  = new ArrayList<>();
//        LocalDate today              = LocalDate.now();
//
//        for (Payment payment : allPayments) {
//            boolean isToday   = payment.getPaymentTime().toLocalDate().equals(today);
//            boolean isSuccess = "SUCCESS".equals(payment.getStatus());
//
//            if (isToday && isSuccess) {
//                todayPayments.add(payment);
//            }
//        }
//
//        BigDecimal totalRevenue = BigDecimal.ZERO;
//        for (Payment payment : todayPayments) {
//            totalRevenue = totalRevenue.add(payment.getAmount());
//        }
//
//        return new DaySummary(todayPayments.size(), totalRevenue);
//    }
//}

// --------------------------------------------------------------------------------------


package com.example.payment_service.service;

import com.example.payment_service.dto.DaySummary;
import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.RazorpayOrderResponse;
import com.example.payment_service.model.Payment;
import com.example.payment_service.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.razorpay.RazorpayClient;
import org.json.JSONObject;

@Service
public class PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private PaymentRepository paymentRepository;

    public RazorpayOrderResponse createRazorpayOrder(Long orderId, BigDecimal amount) throws Exception {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount.multiply(new BigDecimal(100)).intValue()); // paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "ORD-" + orderId);

        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        return new RazorpayOrderResponse(
            razorpayOrder.get("id"),
            amount,
            razorpayOrder.get("currency"),
            razorpayOrder.get("status")
        );
    }

//    public Payment processPayment(PaymentRequest request) {
//        Payment payment = new Payment();
//        payment.setOrderId(request.getOrderId());
//        payment.setAmount(request.getAmount());
//        payment.setRazorpayOrderId(request.getRazorpayOrderId());
//        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
//        payment.setRazorpaySignature(request.getRazorpaySignature());
//        payment.setPaymentTime(LocalDateTime.now());
//        payment.setStatus("SUCCESS");
//        return paymentRepository.save(payment);
//    }
    
    public Payment processPayment(PaymentRequest request) {
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setRazorpayOrderId(request.getRazorpayOrderId());
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setPaymentTime(java.time.LocalDateTime.now());
        payment.setStatus("SUCCESS");
        return paymentRepository.save(payment);
    }

    public Payment getPaymentByOrderId(Long orderId) {
        List<Payment> all = paymentRepository.findAll();
        for (Payment payment : all) {
            if (payment.getOrderId().equals(orderId)) {
                return payment;
            }
        }
        throw new RuntimeException("Payment not found for order: " + orderId);
    }

    public DaySummary getDaySummary() {
        List<Payment> allPayments = paymentRepository.findAll();
        List<Payment> todayPayments = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Payment payment : allPayments) {
            boolean isToday = payment.getPaymentTime().toLocalDate().equals(today);
            boolean isSuccess = "SUCCESS".equals(payment.getStatus());

            if (isToday && isSuccess) {
                todayPayments.add(payment);
            }
        }

        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (Payment payment : todayPayments) {
            totalRevenue = totalRevenue.add(payment.getAmount());
        }

        return new DaySummary(todayPayments.size(), totalRevenue);
    }
}
