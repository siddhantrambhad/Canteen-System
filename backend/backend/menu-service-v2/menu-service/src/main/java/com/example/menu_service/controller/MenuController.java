package com.example.menu_service.controller;

import com.example.menu_service.dto.MenuItemDTO;
import com.example.menu_service.dto.StockDeductRequest;
import com.example.menu_service.model.MenuItem;
import com.example.menu_service.service.MenuService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @Value("${internal.secret}")
    private String internalSecret;

    // ADMIN — add new item for today (stockCount required in body)
    @PostMapping
    public MenuItem addMenu(@RequestBody MenuItemDTO dto,
                            HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }

        return menuService.addMenuItem(dto);
    }

    // ADMIN — update stock count for an item (can increase or correct stock)
    // PATCH /menu/stock/{id}?count=50
    @PatchMapping("/stock/{id}")
    public MenuItem updateStock(@PathVariable Long id,
                                @RequestParam int count,
                                HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }

        return menuService.updateStock(id, count);
    }

    // INTERNAL — called by order-service after payment is confirmed
    // Deducts stock for each ordered item
    // Protected by X-Internal-Secret header — not accessible by users/admin directly
    @PostMapping("/internal/deduct-stock")
    public void deductStock(@RequestBody StockDeductRequest request,
                             HttpServletRequest httpRequest) {

        String secret = httpRequest.getHeader("X-Internal-Secret");
        if (!internalSecret.equals(secret)) {
            throw new RuntimeException("Unauthorized internal call.");
        }

        menuService.deductStock(request);
    }

    // USER — today's available menu with stock count visible
    @GetMapping("/today")
    public List<MenuItem> getTodayMenu() {
        return menuService.getTodayMenu();
    }

    // ADMIN — today's menu including unavailable/out-of-stock items
    @GetMapping("/admin/all")
    public List<MenuItem> getAllTodayMenu(HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }

        return menuService.getAllTodayMenu();
    }

    // ADMIN — full history across all dates
    @GetMapping("/admin/history")
    public List<MenuItem> getAllMenuHistory(HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }

        return menuService.getAllMenuItems();
    }

    // ADMIN — search items by name (partial match, case-insensitive, across all dates)
    @GetMapping("/admin/search")
    public List<MenuItem> searchByName(@RequestParam String name,
                                        HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }

        return menuService.searchByName(name);
    }

    // USER — filter today's available items by category
    @GetMapping("/category/{category}")
    public List<MenuItem> getMenuByCategory(@PathVariable String category) {
        return menuService.getMenuByCategory(category);
    }

    // INTERNAL — used by order-service to get item details (open, no auth needed)
    @GetMapping("/{id}")
    public MenuItem getItem(@PathVariable Long id) {
        return menuService.getMenuItem(id);
    }

    // ADMIN — mark item available (only allowed if stock > 0)
    @PutMapping("/available/{id}")
    public MenuItem markAvailable(@PathVariable Long id,
                                   HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }

        return menuService.markAvailable(id);
    }

    // ADMIN — mark item unavailable
    @PutMapping("/unavailable/{id}")
    public MenuItem markUnavailable(@PathVariable Long id,
                                     HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. ADMIN only.");
        }

        return menuService.markUnavailable(id);
    }
}
