import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axios.js';

const CATEGORIES = ['all', 'meals', 'snacks', 'drinks'];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function UserDashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenu();
    loadRazorpayScript();
  
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMenu();
      }
    }, 5000);
  
    return () => clearInterval(interval);
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menu/today');
      setMenuItems(res.data);
    } catch {
      setError('Failed to load menu. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const addToCart = (item) => {
    setError('');

    if (item.stockCount <= 0) {
      setError('Selected quantity not available.');
      return;
    }

    setCart((prev) => ({
      ...prev,
      [item.id]: prev[item.id]
        ? prev[item.id].quantity + 1 > item.stockCount
          ? prev[item.id]
          : { ...prev[item.id], quantity: prev[item.id].quantity + 1 }
        : { item, quantity: 1, note: '' },
    }));
  };

  const updateQty = (itemId, delta) => {
    setError('');

    setCart((prev) => {
      const entry = prev[itemId];
      if (!entry) return prev;

      const newQty = entry.quantity + delta;

      if (newQty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }

      if (newQty > entry.item.stockCount) {
        setError('Selected quantity not available.');
        return prev;
      }

      return { ...prev, [itemId]: { ...entry, quantity: newQty } };
    });
  };

  const updateNote = (itemId, note) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], note },
    }));
  };

  const cartEntries = Object.values(cart);
  const cartTotal = cartEntries.reduce(
    (sum, { item, quantity }) => sum + parseFloat(item.price) * quantity,
    0
  );
  const cartCount = cartEntries.reduce((sum, { quantity }) => sum + quantity, 0);

  const placeOrder = async () => {
    if (cartEntries.length === 0) return;

    setOrdering(true);
    setError('');

    for (const { item, quantity } of cartEntries) {
      if (quantity > item.stockCount) {
        setError('Selected quantity not available.');
        setOrdering(false);
        return;
      }
    }

    let orderData;
    try {
      const items = cartEntries.map(({ item, quantity, note }) => ({
        menuItemId: item.id,
        quantity,
        note: note || '',
      }));

      const res = await api.post('/orders', { items });
      orderData = res.data;
    } catch (err) {
      const backendError = err.response?.data?.error || '';
      if (backendError.toLowerCase().includes('stock')) {
        setError('Selected quantity not available.');
        fetchMenu();
      } else {
        setError(backendError || 'Failed to place order. Please try again.');
      }
      setOrdering(false);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Could not load payment gateway. Check your internet connection.');
      setOrdering(false);
      return;
    }

    const options = {
      key: orderData.razorpayKeyId,
      amount: Math.round(parseFloat(orderData.amount) * 100),
      currency: orderData.currency || 'INR',
      name: 'Canteen',
      description: `Order ${orderData.order.orderNumber}`,
      order_id: orderData.razorpayOrderId,

      handler: async (razorpayResponse) => {
        try {
          await api.post('/orders/confirm-payment', {
            orderId: orderData.order.id,
            amount: orderData.amount,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpaySignature: razorpayResponse.razorpay_signature,
          });

          setOrderSuccess({
            orderId: orderData.order.id,
            orderNumber: orderData.order.orderNumber,
            totalAmount: orderData.amount,
          });

          setCart({});
          fetchMenu();
        } catch {
          setError('Payment received but failed to confirm. Please contact the canteen.');
        }
        setOrdering(false);
      },

      prefill: {
        name: localStorage.getItem('name') || '',
        email: localStorage.getItem('email') || '',
      },

      theme: {
        color: '#2563eb',
      },

      modal: {
        ondismiss: () => {
          setError('Payment cancelled. Your order was created but not confirmed. You can retry.');
          setOrdering(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (response) => {
      setError(
        `Payment failed: ${response.error?.description || 'Unknown error'}. Please try again.`
      );
      setOrdering(false);
    });

    rzp.open();
  };

  if (orderSuccess) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="success-screen">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Order Confirmed!</h2>
            <p className="success-sub">Payment successful. Your order is being prepared.</p>

            <div className="order-number-box">
              <div className="order-number-value">{orderSuccess.orderNumber}</div>
              <div className="order-number-label">Your Order Number</div>
              <span className="badge badge-placed" style={{ marginTop: '0.5rem' }}>
                PLACED
              </span>
            </div>

            <p className="success-note">
              Check <strong>My Orders</strong> for real-time status. Head to the
              canteen when status shows <strong className="text-success">READY</strong>.
            </p>

            <div className="success-actions">
              <a href="/my-orders" className="btn btn-primary">
                View My Orders
              </a>
              <button
                className="btn btn-outline"
                onClick={() => setOrderSuccess(null)}
              >
                Order More
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Today's Menu</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="user-layout">
          <div className="menu-section">
            <div className="category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'all'
                    ? 'All Items'
                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading menu...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '2rem' }}>🍽️</p>
                <p>No items available in this category right now.</p>
              </div>
            ) : (
              <div className="menu-grid">
                {filteredItems.map((item) => (
                  <div key={item.id} className="menu-item-card">
                    <div className="item-top">
                      <span className="item-category-tag">{item.category}</span>
                    </div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">₹{parseFloat(item.price).toFixed(2)}</div>

                    <div className="item-actions">
                      {cart[item.id] ? (
                        <div className="qty-controls">
                          <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>
                            −
                          </button>
                          <span className="qty-value">{cart[item.id].quantity}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-accent btn-sm"
                          onClick={() => addToCart(item)}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-panel">
            <div className="cart-header">
              <span>🛒 Cart</span>
              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="cart-body">
              {cartEntries.length === 0 ? (
                <div className="cart-empty">
                  <p>Your cart is empty.</p>
                  <p>Add items from the menu to get started.</p>
                </div>
              ) : (
                cartEntries.map(({ item, quantity, note }) => (
                  <div key={item.id} className="cart-entry">
                    <div className="cart-entry-main">
                      <div className="cart-entry-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-subtotal">
                          ₹{(parseFloat(item.price) * quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>
                          −
                        </button>
                        <span className="qty-value">{quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      className="note-input"
                      type="text"
                      placeholder="Special instruction (optional)"
                      value={note}
                      onChange={(e) => updateNote(item.id, e.target.value)}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Total</span>
                <span className="cart-total-amount">₹{cartTotal.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-accent btn-full btn-lg"
                onClick={placeOrder}
                disabled={cartEntries.length === 0 || ordering}
              >
                {ordering ? 'Opening Payment...' : `Pay ₹${cartTotal.toFixed(2)}`}
              </button>
              <p className="cart-pay-note">Secured by Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}