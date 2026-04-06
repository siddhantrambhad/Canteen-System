package com.example.order_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id")
    private Long orderId;           // plain Long — no @ManyToOne

    // Reference to the original menu item in menu-service
    // Used by order-service to deduct stock after payment is confirmed
    @Column(name = "menu_item_id")
    private Long menuItemId;

    @Column(name = "item_name")
    private String itemName;        // SNAPSHOT of name at time of order

    private BigDecimal price;       // SNAPSHOT of price at time of order

    private int quantity;

    private String note;            // per-item instruction e.g. "less curry"

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
