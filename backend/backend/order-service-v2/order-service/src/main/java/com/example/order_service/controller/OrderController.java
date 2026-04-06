package com.example.order_service.controller;

import com.example.order_service.dto.ConfirmPaymentRequest;
import com.example.order_service.dto.PlaceOrderRequest;
import com.example.order_service.dto.PlaceOrderResponse;
import com.example.order_service.model.Order;
import com.example.order_service.model.OrderItem;
import com.example.order_service.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // USER — place order: validates items, creates Razorpay order, returns checkout details
    // Response contains razorpayOrderId + razorpayKeyId for frontend to open payment widget
    @PostMapping
    public PlaceOrderResponse placeOrder(@RequestBody PlaceOrderRequest body,
                                          HttpServletRequest request) {

        String role   = (String) request.getAttribute("role");
        Long   userId = (Long)   request.getAttribute("userId");

        if (!"USER".equals(role)) {
            throw new RuntimeException("Access denied.");
        }

        return orderService.placeOrder(userId, body);
    }

    // USER — confirm payment after completing Razorpay checkout
    // Frontend sends razorpayPaymentId + razorpaySignature received from Razorpay widget
    // Order moves from PENDING_PAYMENT → PLACED on success
    @PostMapping("/confirm-payment")
    public Order confirmPayment(@RequestBody ConfirmPaymentRequest confirmRequest,
                                 HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"USER".equals(role)) {
            throw new RuntimeException("Access denied.");
        }

        return orderService.confirmPayment(confirmRequest);
    }

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/{id}/items")
    public List<OrderItem> getOrderItems(@PathVariable Long id) {
        return orderService.getOrderItems(id);
    }

    // ADMIN — all orders across all dates
    @GetMapping
    public List<Order> getAllOrders(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }
        return orderService.getAllOrders();
    }

    // ADMIN — all orders placed today (any status)
    @GetMapping("/today")
    public List<Order> getOrdersToday(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }
        return orderService.getOrdersToday();
    }

    // ADMIN — filter by status across all dates
    @GetMapping("/status/{status}")
    public List<Order> getOrdersByStatus(@PathVariable String status,
                                          HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }
        return orderService.getOrdersByStatus(status);
    }

    // ADMIN — filter by status for today only
    @GetMapping("/today/status/{status}")
    public List<Order> getOrdersByStatusToday(@PathVariable String status,
                                               HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }
        return orderService.getOrdersByStatusToday(status);
    }

    // ADMIN — update order status (PLACED → PREPARING → READY → PICKED)
    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id,
                               @RequestParam String status,
                               HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }
        return orderService.updateOrderStatus(id, status);
    }

    // USER or ADMIN — get orders for a specific user
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable Long userId,
                                         HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied.");
        }

        return orderService.getOrdersByUserId(userId);
    }
}
