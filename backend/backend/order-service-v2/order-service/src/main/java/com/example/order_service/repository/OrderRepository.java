package com.example.order_service.repository;

import com.example.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByStatusIgnoreCase(String status);

    // All orders where createdAt falls on a given date (JPQL DATE function)
    @Query("SELECT o FROM Order o WHERE FUNCTION('DATE', o.createdAt) = :date")
    List<Order> findByCreatedAtDate(@Param("date") LocalDate date);

    // Orders filtered by both status and date
    @Query("SELECT o FROM Order o WHERE UPPER(o.status) = :status AND FUNCTION('DATE', o.createdAt) = :date")
    List<Order> findByStatusAndCreatedAtDate(@Param("status") String status, @Param("date") LocalDate date);
}
