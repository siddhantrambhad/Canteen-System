package com.example.menu_service.dto;

import java.math.BigDecimal;

// Admin sends this when adding a new menu item
// Date is NOT included — always set to today by the service
public class MenuItemDTO {

    private String name;
    private BigDecimal price;
    private String category;
    private Integer stockCount;   // how many portions are available today

    public MenuItemDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getStockCount() { return stockCount; }
    public void setStockCount(Integer stockCount) { this.stockCount = stockCount; }
}
