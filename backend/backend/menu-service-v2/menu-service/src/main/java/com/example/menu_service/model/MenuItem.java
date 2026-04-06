package com.example.menu_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private BigDecimal price;

    private String category;   // meals, snacks, drinks

    @Column(name = "menu_date")
    private LocalDate menuDate;

    private boolean available;

    // Number of portions available — admin sets this when adding item
    // Decremented by order-service after payment is confirmed
    // When stockCount reaches 0, available is automatically set to false
    @Column(name = "stock_count", nullable = false)
    private Integer stockCount;

    @PrePersist
    public void prePersist() {
        this.available = true;
    }

    public MenuItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDate getMenuDate() { return menuDate; }
    public void setMenuDate(LocalDate menuDate) { this.menuDate = menuDate; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public Integer getStockCount() { return stockCount; }
    public void setStockCount(Integer stockCount) { this.stockCount = stockCount; }
}
