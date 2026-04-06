package com.example.order_service.service;

import com.example.order_service.dto.ConfirmPaymentRequest;
import com.example.order_service.dto.OrderItemRequest;
import com.example.order_service.dto.PlaceOrderRequest;
import com.example.order_service.dto.PlaceOrderResponse;
import com.example.order_service.model.Order;
import com.example.order_service.model.OrderItem;
import com.example.order_service.repository.OrderItemRepository;
import com.example.order_service.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Value("${internal.secret}")
    private String internalSecret;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    @Qualifier("restTemplate")
    private RestTemplate restTemplate;

    @Value("${menu-service.url}")
    private String menuServiceUrl;

    @Value("${payment-service.url}")
    private String paymentServiceUrl;

    // Step 1: Validate items + stock, save order as PENDING_PAYMENT,
    //         create Razorpay order, return checkout details to frontend.
    // Stock is NOT deducted here — only after payment is confirmed.
    @Transactional
    public PlaceOrderResponse placeOrder(Long userId, PlaceOrderRequest request) {

        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setStatus("PENDING_PAYMENT");

        Order savedOrder = orderRepository.save(order);
        savedOrder.setOrderNumber("ORD-" + (1000 + savedOrder.getId()));
        orderRepository.save(savedOrder);

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {

            Map menuItem = restTemplate.getForObject(
                menuServiceUrl + "/menu/" + itemRequest.getMenuItemId(),
                Map.class
            );

            if (menuItem == null) {
                throw new RuntimeException("Menu item not found: " + itemRequest.getMenuItemId());
            }

            Boolean available = (Boolean) menuItem.get("available");
            if (available == null || !available) {
                throw new RuntimeException("Menu item is not available: " + menuItem.get("name"));
            }

            // Stock check — reject the entire order if any item doesn't have enough stock
            Integer stockCount = (Integer) menuItem.get("stockCount");
            if (stockCount == null || stockCount < itemRequest.getQuantity()) {
                throw new RuntimeException(
                    "Insufficient stock for '" + menuItem.get("name") + "'. " +
                    "Available: " + (stockCount == null ? 0 : stockCount) +
                    ", Requested: " + itemRequest.getQuantity()
                );
            }

            String itemName = (String) menuItem.get("name");
            BigDecimal price = new BigDecimal(menuItem.get("price").toString());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(savedOrder.getId());
            orderItem.setItemName(itemName);
            orderItem.setPrice(price);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setNote(itemRequest.getNote());
            // Store menuItemId in orderItem so we can deduct stock later on confirmPayment
            orderItem.setMenuItemId(itemRequest.getMenuItemId());
            orderItemRepository.save(orderItem);

            total = total.add(price.multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }

        savedOrder.setTotalAmount(total);
        orderRepository.save(savedOrder);

        // Create Razorpay order via payment-service
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalSecret);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String createUrl = paymentServiceUrl + "/payments/create-order"
                + "?orderId=" + savedOrder.getId()
                + "&amount=" + total;

        Map razorpayOrder = restTemplate.postForObject(createUrl, entity, Map.class);

        if (razorpayOrder == null) {
            throw new RuntimeException("Failed to create Razorpay order for: " + savedOrder.getOrderNumber());
        }

        String razorpayOrderId = (String) razorpayOrder.get("razorpayOrderId");
        String currency = (String) razorpayOrder.get("currency");

        return new PlaceOrderResponse(savedOrder, razorpayOrderId, total, currency, razorpayKeyId);
    }

    // Step 2: Called after user completes Razorpay payment.
    // Records payment in payment-service, deducts stock in menu-service,
    // then marks order as PLACED.
    @Transactional
    public Order confirmPayment(ConfirmPaymentRequest confirmRequest) {

        Order order = orderRepository.findById(confirmRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + confirmRequest.getOrderId()));

        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            throw new RuntimeException("Order is not awaiting payment: " + order.getOrderNumber());
        }

        // Record payment in payment-service
        HttpHeaders payHeaders = new HttpHeaders();
        payHeaders.set("Content-Type", "application/json");
        payHeaders.set("X-Internal-Secret", internalSecret);

        Map<String, Object> paymentBody = new HashMap<>();
        paymentBody.put("orderId", confirmRequest.getOrderId());
        paymentBody.put("amount", confirmRequest.getAmount());
        paymentBody.put("razorpayOrderId", confirmRequest.getRazorpayOrderId());
        paymentBody.put("razorpayPaymentId", confirmRequest.getRazorpayPaymentId());
        paymentBody.put("razorpaySignature", confirmRequest.getRazorpaySignature());

        HttpEntity<Map<String, Object>> paymentEntity = new HttpEntity<>(paymentBody, payHeaders);

        Map paymentResult = restTemplate.postForObject(
            paymentServiceUrl + "/payments",
            paymentEntity,
            Map.class
        );

        if (paymentResult == null || !"SUCCESS".equals(paymentResult.get("status"))) {
            throw new RuntimeException("Payment recording failed for order: " + order.getOrderNumber());
        }

        // Deduct stock in menu-service for each ordered item
        List<OrderItem> items = getOrderItems(order.getId());
        HttpHeaders stockHeaders = new HttpHeaders();
        stockHeaders.set("X-Internal-Secret", internalSecret);
        stockHeaders.setContentType(MediaType.APPLICATION_JSON);

        for (OrderItem item : items) {
            if (item.getMenuItemId() == null) continue;

            Map<String, Object> deductBody = new HashMap<>();
            deductBody.put("menuItemId", item.getMenuItemId());
            deductBody.put("quantity", item.getQuantity());

            HttpEntity<Map<String, Object>> deductEntity = new HttpEntity<>(deductBody, stockHeaders);

            restTemplate.postForObject(
                menuServiceUrl + "/menu/internal/deduct-stock",
                deductEntity,
                Void.class
            );
        }

        // All done — move order to PLACED
        order.setStatus("PLACED");
        return orderRepository.save(order);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        List<OrderItem> allItems = orderItemRepository.findAll();
        List<OrderItem> result = new ArrayList<>();

        for (OrderItem item : allItems) {
            if (item.getOrderId().equals(orderId)) {
                result.add(item);
            }
        }

        return result;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByStatus(String status) {
        if (status == null || status.isBlank()) {
            return new ArrayList<>();
        }
        return orderRepository.findByStatusIgnoreCase(status.trim());
    }

    public List<Order> getOrdersToday() {
        LocalDate today = LocalDate.now();
        return orderRepository.findByCreatedAtDate(today);
    }

    public List<Order> getOrdersByStatusToday(String status) {
        if (status == null || status.isBlank()) {
            return new ArrayList<>();
        }
        LocalDate today = LocalDate.now();
        return orderRepository.findByStatusAndCreatedAtDate(status.trim().toUpperCase(), today);
    }

    public Order updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}
