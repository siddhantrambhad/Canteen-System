import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axios.js';

const CATEGORIES = ['meals', 'snacks', 'drinks'];

// stockCount added — was missing, causing every add to fail
const EMPTY_FORM = { name: '', price: '', category: 'meals', stockCount: '' };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [adding, setAdding] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Per-row stock input values: { [itemId]: string }
  const [stockInputs, setStockInputs] = useState({});
  // Which row's stock update is in-flight
  const [updatingStock, setUpdatingStock] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu/admin/all');
      setItems(res.data);
    } catch {
      setErrorMsg('Failed to load menu. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // ── Add Item Validation ──────────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Item name is required.';
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }
    if (!form.price) {
      errs.price = 'Price is required.';
    } else if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      errs.price = 'Price must be greater than 0.';
    }
    // stockCount validation — was missing before
    if (!form.stockCount) {
      errs.stockCount = 'Stock count is required.';
    } else if (!Number.isInteger(Number(form.stockCount)) || parseInt(form.stockCount) <= 0) {
      errs.stockCount = 'Stock must be a whole number greater than 0.';
    }
    return errs;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    setErrorMsg('');
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setAdding(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/menu', {
        name: form.name.trim(),
        price: parseFloat(parseFloat(form.price).toFixed(2)),
        category: form.category,
        stockCount: parseInt(form.stockCount), // fixed — was not being sent before
      });
      setItems((prev) => [...prev, res.data]);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setSuccessMsg(`"${res.data.name}" added to today's menu (stock: ${res.data.stockCount}).`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to add item. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  // ── Toggle Availability ──────────────────────────────────────────────────
  const toggleAvailability = async (item) => {
    setToggling(item.id);
    setErrorMsg('');
    try {
      const url = item.available
        ? `/menu/unavailable/${item.id}`
        : `/menu/available/${item.id}`;
      const res = await api.put(url);
      setItems((prev) => prev.map((i) => (i.id === item.id ? res.data : i)));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update availability.');
    } finally {
      setToggling(null);
    }
  };

  // ── Update Stock ─────────────────────────────────────────────────────────
  const handleStockInputChange = (itemId, value) => {
    setStockInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleStockUpdate = async (item) => {
    const raw = stockInputs[item.id];
    if (raw === undefined || raw === '') {
      setErrorMsg('Enter a stock count to update.');
      return;
    }
    const count = parseInt(raw);
    if (isNaN(count) || count < 0) {
      setErrorMsg('Stock must be a whole number of 0 or more.');
      return;
    }

    setUpdatingStock(item.id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // PATCH /menu/stock/{id}?count=50
      const res = await api.patch(`/menu/stock/${item.id}?count=${count}`);
      setItems((prev) => prev.map((i) => (i.id === item.id ? res.data : i)));
      // Clear that row's input after success
      setStockInputs((prev) => ({ ...prev, [item.id]: '' }));
      setSuccessMsg(`Stock for "${item.name}" updated to ${count}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update stock.');
    } finally {
      setUpdatingStock(null);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});

  const totalAvailable = items.filter((i) => i.available).length;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">
            {items.length} items today · {totalAvailable} available
          </p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title">Add Item to Today's Menu</h2>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

          <form onSubmit={handleAddItem} noValidate>
            <div className="add-item-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Chicken Biryani"
                  value={form.name}
                  onChange={handleFormChange}
                />
                {formErrors.name && <p className="form-error">{formErrors.name}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="1"
                  step="0.5"
                  className={`form-input ${formErrors.price ? 'input-error' : ''}`}
                  placeholder="80"
                  value={form.price}
                  onChange={handleFormChange}
                />
                {formErrors.price && <p className="form-error">{formErrors.price}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Stock Count</label>
                <input
                  type="number"
                  name="stockCount"
                  min="1"
                  step="1"
                  className={`form-input ${formErrors.stockCount ? 'input-error' : ''}`}
                  placeholder="e.g. 50"
                  value={form.stockCount}
                  onChange={handleFormChange}
                />
                {formErrors.stockCount && <p className="form-error">{formErrors.stockCount}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-input"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group add-btn-group">
                <label className="form-label" style={{ visibility: 'hidden' }}>&nbsp;</label>
                <button
                  type="submit"
                  className="btn btn-accent btn-full"
                  disabled={adding}
                >
                  {adding ? 'Adding...' : '+ Add Item'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading menu...</p>
          </div>
        ) : (
          CATEGORIES.map((cat) => (
            <div key={cat} className="menu-category-section">
              <h2 className="section-title category-title">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className="category-count">{groupedItems[cat].length}</span>
              </h2>

              {groupedItems[cat].length === 0 ? (
                <p className="empty-category">No {cat} added today yet.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Toggle</th>
                        <th>Update Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedItems[cat].map((item) => (
                        <tr
                          key={item.id}
                          className={!item.available ? 'row-unavailable' : ''}
                        >
                          <td className="item-name-cell">{item.name}</td>

                          <td>₹{parseFloat(item.price).toFixed(2)}</td>

                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  item.stockCount === 0
                                    ? '#dc2626'
                                    : item.stockCount <= 5
                                    ? '#d97706'
                                    : '#15803d',
                              }}
                            >
                              {item.stockCount}
                            </span>
                          </td>

                          <td>
                            {item.available ? (
                              <span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                                Available
                              </span>
                            ) : (
                              <span className="badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
                                Hidden
                              </span>
                            )}
                          </td>

                          <td>
                            <button
                              className={`toggle-btn ${item.available ? 'toggle-hide' : 'toggle-show'}`}
                              onClick={() => toggleAvailability(item)}
                              disabled={toggling === item.id}
                            >
                              {toggling === item.id
                                ? '...'
                                : item.available
                                ? 'Hide'
                                : 'Show'}
                            </button>
                          </td>

                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                placeholder={String(item.stockCount)}
                                value={stockInputs[item.id] ?? ''}
                                onChange={(e) => handleStockInputChange(item.id, e.target.value)}
                                style={{
                                  width: '70px',
                                  padding: '0.3rem 0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '0.85rem',
                                }}
                              />
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleStockUpdate(item)}
                                disabled={updatingStock === item.id}
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                {updatingStock === item.id ? '...' : 'Update'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}