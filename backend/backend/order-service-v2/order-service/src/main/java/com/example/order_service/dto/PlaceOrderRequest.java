package com.example.order_service.dto;

import java.util.List;

// userId is no longer sent by client
// It is taken from the JWT token by the interceptor — more secure
// Client cannot pretend to be someone else by sending a different userId
public class PlaceOrderRequest {

    private List<OrderItemRequest> items;

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}