import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axios.js';

const STATUS_FILTERS = ['ALL', 'PLACED', 'READY', 'PICKED_UP'];
const STATUS_LABELS = { PLACED: 'Placed', READY: 'Ready', PICKED_UP: 'Picked Up' };
const STATUS_BADGE = {
  PLACED: 'badge-placed',
  READY: 'badge-ready',
  PICKED_UP: 'badge-pickedup',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [orderItemsMap, setOrderItemsMap] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  // 'today' — default, shows only today's orders (kitchen management view)
  // 'all'   — shows every order ever (for reference / history)
  const [viewMode, setViewMode] = useState('today');

  // useCallback so the interval can call the latest version
  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      // Use /orders/today for default kitchen view, /orders for full history
      const url = viewMode === 'today' ? '/orders/today' : '/orders';
      const res = await api.get(url);
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
      setLastUpdated(new Date());
    } catch {
      // silent on polling
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    // Reset filter and expanded row when switching modes
    setFilter('ALL');
    setExpandedId(null);

    fetchOrders(true);

    // Only auto-poll in today mode — no point polling the full history
    if (viewMode === 'today') {
      const interval = setInterval(() => fetchOrders(false), 20000);
      return () => clearInterval(interval);
    }
  }, [fetchOrders, viewMode]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/status?status=${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? res.data : o))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!orderItemsMap[orderId]) {
      try {
        const res = await api.get(`/orders/${orderId}/items`);
        setOrderItemsMap((prev) => ({ ...prev, [orderId]: res.data }));
      } catch {
        setOrderItemsMap((prev) => ({ ...prev, [orderId]: [] }));
      }
    }
  };

  const filtered =
    filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  const countByStatus = (s) => orders.filter((o) => o.status === s).length;

  const formatTime = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

  // For "All" mode we show the date too so the admin knows which day an order is from
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    if (isToday) return `Today ${formatTime(dateStr)}`;
    return (
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
      ' ' +
      formatTime(dateStr)
    );
  };

  return (
    <>
      <Navbar />
      <div className="page-container">

        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              {viewMode === 'today' ? "Today's Orders" : 'All Orders'}
            </h1>
            <p className="page-subtitle">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
              {viewMode === 'today' ? ' · auto-refreshes every 20s' : ''}
            </p>
          </div>
          <div className="poll-info">
            {lastUpdated && viewMode === 'today' && (
              <span>Updated {formatTime(lastUpdated)}</span>
            )}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => fetchOrders(false)}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            className={`btn btn-sm ${viewMode === 'today' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('today')}
          >
            📅 Today
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('all')}
          >
            📋 All Orders
          </button>
        </div>

        <div className="filter-bar">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`tab-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
              <span className="tab-count">
                {s === 'ALL' ? orders.length : countByStatus(s)}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card">
            No orders{' '}
            {filter !== 'ALL'
              ? `with status "${STATUS_LABELS[filter]}"`
              : viewMode === 'today'
              ? 'today'
              : 'found'}.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>{viewMode === 'today' ? 'Time' : 'Date & Time'}</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className={order.status === 'PLACED' ? 'row-pending' : ''}
                    >
                      <td className="order-num-cell">{order.orderNumber}</td>
                      <td>
                        {viewMode === 'today'
                          ? formatTime(order.createdAt)
                          : formatDateTime(order.createdAt)}
                      </td>
                      <td className="amount-cell">
                        ₹{parseFloat(order.totalAmount).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[order.status] || 'badge-placed'}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td>
                        {order.status === 'PLACED' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateStatus(order.id, 'READY')}
                            disabled={updating === order.id}
                          >
                            {updating === order.id ? '...' : '✓ Mark Ready'}
                          </button>
                        )}
                        {order.status === 'READY' && (
                          <button
                            className="btn btn-gray btn-sm"
                            onClick={() => updateStatus(order.id, 'PICKED_UP')}
                            disabled={updating === order.id}
                          >
                            {updating === order.id ? '...' : 'Picked Up ✓'}
                          </button>
                        )}
                        {order.status === 'PICKED_UP' && (
                          <span className="done-text">Done ✓</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => toggleExpand(order.id)}
                        >
                          {expandedId === order.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {expandedId === order.id && (
                      <tr key={`${order.id}-exp`} className="expanded-row">
                        <td colSpan="6">
                          {!orderItemsMap[order.id] ? (
                            <span className="loading-text">Loading...</span>
                          ) : orderItemsMap[order.id].length === 0 ? (
                            <span className="loading-text">No items.</span>
                          ) : (
                            <ul className="order-items-list inline-items">
                              {orderItemsMap[order.id].map((oi) => (
                                <li key={oi.id} className="order-item-row">
                                  <span>
                                    <strong>{oi.itemName}</strong> × {oi.quantity}
                                    {oi.note && (
                                      <em className="item-note"> — "{oi.note}"</em>
                                    )}
                                  </span>
                                  <span>
                                    ₹{(parseFloat(oi.price) * oi.quantity).toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}