package com.example.menu_service.service;

import com.example.menu_service.dto.MenuItemDTO;
import com.example.menu_service.dto.StockDeductRequest;
import com.example.menu_service.model.MenuItem;
import com.example.menu_service.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class MenuService {

    @Autowired
    private MenuRepository menuRepository;

    public MenuItem addMenuItem(MenuItemDTO dto) {

    	if (dto.getStockCount() == null || dto.getStockCount() <= 0) {
    	    throw new RuntimeException("Stock count must be greater than 0.");
    	}

        LocalDate today = LocalDate.now();
        List<MenuItem> all = menuRepository.findAll();

        for (MenuItem existing : all) {
            if (existing.getName().equals(dto.getName())
                    && existing.getMenuDate() != null
                    && existing.getMenuDate().equals(today)) {
                return existing;  // already exists for today — return it
            }
        }

        MenuItem item = new MenuItem();
        item.setName(dto.getName());
        item.setPrice(dto.getPrice());
        item.setCategory(dto.getCategory());
        item.setMenuDate(today);
        item.setStockCount(dto.getStockCount());
        // available = true is set by @PrePersist

        return menuRepository.save(item);
    }

    // ADMIN — update stock count for an existing item
    // If new stock > 0 and item was unavailable due to stock running out, mark it available again
    public MenuItem updateStock(Long id, int newStock) {
        if (newStock < 0) {
            throw new RuntimeException("Stock count cannot be negative.");
        }

        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));

        item.setStockCount(newStock);

        // Auto-manage availability based on stock
        if (newStock == 0) {
            item.setAvailable(false);
        } else {
            item.setAvailable(true);
        }

        return menuRepository.save(item);
    }

    // INTERNAL — called by order-service after payment is confirmed
    // Deducts quantity from stockCount; auto-marks unavailable if stock hits 0
    // Stock check is also done here as a safety net (order-service checks first too)
    public void deductStock(StockDeductRequest request) {
        MenuItem item = menuRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + request.getMenuItemId()));

        int remaining = item.getStockCount() - request.getQuantity();

        if (remaining < 0) {
            throw new RuntimeException(
                "Insufficient stock for '" + item.getName() + "'. " +
                "Available: " + item.getStockCount() + ", Requested: " + request.getQuantity()
            );
        }

        item.setStockCount(remaining);

        if (remaining == 0) {
            item.setAvailable(false);
        }

        menuRepository.save(item);
    }

    // USER — today's available items only (stockCount > 0)
    public List<MenuItem> getTodayMenu() {
        List<MenuItem> all = menuRepository.findAll();
        List<MenuItem> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (MenuItem item : all) {
            if (item.getMenuDate() != null
                    && item.getMenuDate().equals(today)
                    && item.isAvailable()
                    && item.getStockCount() > 0) {
                result.add(item);
            }
        }

        return result;
    }

    // ADMIN — today's items including unavailable/out-of-stock ones
    public List<MenuItem> getAllTodayMenu() {
        List<MenuItem> all = menuRepository.findAll();
        List<MenuItem> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (MenuItem item : all) {
            if (item.getMenuDate() != null
                    && item.getMenuDate().equals(today)) {
                result.add(item);
            }
        }

        return result;
    }

    public List<MenuItem> getAllMenuItems() {
        return menuRepository.findAll();
    }

    public List<MenuItem> getMenuByCategory(String category) {
        List<MenuItem> all = menuRepository.findAll();
        List<MenuItem> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (MenuItem item : all) {
            if (item.getMenuDate() != null
                    && item.getMenuDate().equals(today)
                    && item.isAvailable()
                    && item.getStockCount() > 0
                    && item.getCategory().equals(category)) {
                result.add(item);
            }
        }

        return result;
    }

    public MenuItem getMenuItem(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
    }

    public MenuItem markAvailable(Long id) {
        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
        if (item.getStockCount() == 0) {
            throw new RuntimeException(
                "Cannot mark '" + item.getName() + "' as available — stock is 0. Update stock first."
            );
        }
        item.setAvailable(true);
        return menuRepository.save(item);
    }

    public MenuItem markUnavailable(Long id) {
        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
        item.setAvailable(false);
        return menuRepository.save(item);
    }

    // ADMIN — search items by name (partial, case-insensitive) across all dates
    public List<MenuItem> searchByName(String name) {
        if (name == null || name.isBlank()) {
            return new ArrayList<>();
        }
        return menuRepository.searchByName(name.trim());
    }
}
