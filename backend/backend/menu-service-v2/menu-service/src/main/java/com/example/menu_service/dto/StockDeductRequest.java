package com.example.menu_service.dto;

// Sent by order-service to menu-service after payment is confirmed
// menu-service deducts the quantity from stockCount for each item
public class StockDeductRequest {

    private Long menuItemId;
    private int quantity;

    public StockDeductRequest() {}

    public Long getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
