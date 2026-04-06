import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axios.js';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          api.get('/orders'),
          api.get('/menu/admin/all'),
        ]);
        setOrders(ordersRes.data);
        setMenuItems(menuRes.data);
      } catch {
        // show partial data if one fails
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + parseFloat(o.totalAmount || 0),
    0
  );
  const placedCount = orders.filter((o) => o.status === 'PLACED').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const pickedUpCount = orders.filter((o) => o.status === 'PICKED_UP').length;
  const availableItems = menuItems.filter((i) => i.available).length;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">{today}</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Alert banners */}
            {placedCount > 0 && (
              <div className="alert alert-warning">
                ⚠️ <strong>{placedCount} order{placedCount !== 1 ? 's' : ''} waiting</strong> to be prepared.{' '}
                <Link to="/admin/orders" className="alert-link">
                  Go to Orders →
                </Link>
              </div>
            )}
            {readyCount > 0 && (
              <div className="alert alert-success">
                🔔 <strong>{readyCount} order{readyCount !== 1 ? 's' : ''} ready</strong> and waiting for pickup.
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-label">Total Orders</div>
                <div className="stat-value">{orders.length}</div>
                <div className="stat-sub">Today</div>
              </div>
              <div className="stat-card stat-green">
                <div className="stat-label">Revenue</div>
                <div className="stat-value">₹{totalRevenue.toFixed(0)}</div>
                <div className="stat-sub">Today</div>
              </div>
              <div className="stat-card stat-orange">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{placedCount}</div>
                <div className="stat-sub">To be prepared</div>
              </div>
              <div className="stat-card stat-teal">
                <div className="stat-label">Ready</div>
                <div className="stat-value">{readyCount}</div>
                <div className="stat-sub">Awaiting pickup</div>
              </div>
            </div>

            {/* Order status breakdown */}
            <div className="section-card">
              <h2 className="section-title">Order Breakdown</h2>
              <div className="breakdown-row">
                <div className="breakdown-item">
                  <span className="badge badge-placed">PLACED</span>
                  <span className="breakdown-count">{placedCount}</span>
                </div>
                <div className="breakdown-sep">→</div>
                <div className="breakdown-item">
                  <span className="badge badge-ready">READY</span>
                  <span className="breakdown-count">{readyCount}</span>
                </div>
                <div className="breakdown-sep">→</div>
                <div className="breakdown-item">
                  <span className="badge badge-pickedup">PICKED UP</span>
                  <span className="breakdown-count">{pickedUpCount}</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <h2 className="section-title" style={{ marginTop: '1.75rem' }}>
              Quick Actions
            </h2>
            <div className="quick-actions">
              <Link to="/admin/orders" className="action-card">
                <div className="action-icon">📋</div>
                <div className="action-title">Manage Orders</div>
                <div className="action-desc">
                  {placedCount} pending · {readyCount} ready · {pickedUpCount} done
                </div>
              </Link>
              <Link to="/admin/menu" className="action-card">
                <div className="action-icon">🍜</div>
                <div className="action-title">Menu Management</div>
                <div className="action-desc">
                  {availableItems} available · {menuItems.length - availableItems} hidden
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
