import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axios.js';

const STATUS_CONFIG = {
  PLACED: { label: 'Placed', badgeClass: 'badge-placed', icon: '⏳' },
  READY: { label: 'Ready for Pickup!', badgeClass: 'badge-ready', icon: '🔔' },
  PICKED_UP: { label: 'Picked Up', badgeClass: 'badge-pickedup', icon: '✅' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [orderItemsMap, setOrderItemsMap] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const userId = localStorage.getItem('userId');

  const fetchOrders = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get(`/orders/user/${userId}`);
      // Sort newest first
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
      setLastUpdated(new Date());
    } catch {
      // Silent on polling errors — don't disrupt user
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
    // Poll every 30 seconds for status updates
    const interval = setInterval(() => fetchOrders(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);

    // Fetch items only once per order
    if (!orderItemsMap[orderId]) {
      try {
        const res = await api.get(`/orders/${orderId}/items`);
        setOrderItemsMap((prev) => ({ ...prev, [orderId]: res.data }));
      } catch {
        setOrderItemsMap((prev) => ({ ...prev, [orderId]: [] }));
      }
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    return isToday
      ? `Today at ${formatTime(dateStr)}`
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
          ' at ' +
          formatTime(dateStr);
  };

  const readyOrders = orders.filter((o) => o.status === 'READY');

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Track your order status — auto-refreshes every 30s</p>
          </div>
          <div className="poll-info">
            {lastUpdated && (
              <span>Last updated: {formatTime(lastUpdated)}</span>
            )}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => fetchOrders(false)}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Ready orders banner */}
        {readyOrders.length > 0 && (
          <div className="ready-banner">
            🔔 <strong>{readyOrders.length} order{readyOrders.length > 1 ? 's are' : ' is'} READY</strong> — please head to the canteen to pick up!
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-state card">
            <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍽️</p>
            <p>No orders yet. Go place one!</p>
            <a href="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              View Menu
            </a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || {
                label: order.status,
                badgeClass: 'badge-placed',
                icon: '•',
              };
              const isReady = order.status === 'READY';
              const items = orderItemsMap[order.id];

              return (
                <div
                  key={order.id}
                  className={`order-card ${isReady ? 'order-card-ready' : ''}`}
                >
                  <div
                    className="order-card-header"
                    onClick={() => toggleExpand(order.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleExpand(order.id)}
                  >
                    <div className="order-header-left">
                      <span className="order-num">{order.orderNumber}</span>
                      <span className="order-time">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="order-header-right">
                      <span className="order-amount">
                        ₹{parseFloat(order.totalAmount).toFixed(2)}
                      </span>
                      <span className={`badge ${cfg.badgeClass}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="expand-icon">
                        {expandedId === order.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {expandedId === order.id && (
                    <div className="order-card-body">
                      {isReady && (
                        <div className="alert alert-success">
                          🔔 Your order is ready! Please head to the canteen to collect it.
                        </div>
                      )}

                      {!items ? (
                        <p className="loading-text">Loading items...</p>
                      ) : items.length === 0 ? (
                        <p className="loading-text">No items found.</p>
                      ) : (
                        <ul className="order-items-list">
                          {items.map((oi) => (
                            <li key={oi.id} className="order-item-row">
                              <div className="order-item-left">
                                <span className="order-item-name">
                                  {oi.itemName}
                                </span>
                                {oi.note && (
                                  <span className="order-item-note">
                                    "{oi.note}"
                                  </span>
                                )}
                              </div>
                              <span className="order-item-right">
                                {oi.quantity} × ₹{parseFloat(oi.price).toFixed(2)} ={' '}
                                <strong>
                                  ₹{(parseFloat(oi.price) * oi.quantity).toFixed(2)}
                                </strong>
                              </span>
                            </li>
                          ))}
                          <li className="order-item-row order-total-row">
                            <span>Total</span>
                            <strong>
                              ₹{parseFloat(order.totalAmount).toFixed(2)}
                            </strong>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
