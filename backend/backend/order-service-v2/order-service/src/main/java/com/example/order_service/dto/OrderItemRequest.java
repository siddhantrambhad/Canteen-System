package com.example.order_service.dto;

//package com.canteen.orderservice.dto;

//One item line inside PlaceOrderRequest
public class OrderItemRequest {

 private Long menuItemId;
 private int quantity;
 private String note;

 public Long getMenuItemId() { return menuItemId; }
 public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }

 public int getQuantity() { return quantity; }
 public void setQuantity(int quantity) { this.quantity = quantity; }

 public String getNote() { return note; }
 public void setNote(String note) { this.note = note; }
}