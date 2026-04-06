package com.example.order_service.repository;
//package com.canteen.orderservice.repository;

import com.example.order_service.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

// No custom methods — orderId filtering is done in OrderService with findAll() + for loop
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}