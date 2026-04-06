package com.example.menu_service.repository;

import com.example.menu_service.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuRepository extends JpaRepository<MenuItem, Long> {

    // ADMIN — search menu items by name (case-insensitive, partial match, across all dates)
    @Query("SELECT m FROM MenuItem m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<MenuItem> searchByName(@Param("name") String name);
}
