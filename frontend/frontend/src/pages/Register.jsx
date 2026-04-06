import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Name is required.';
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!form.company.trim()) {
      errs.company = 'Company name is required.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        company: form.company.trim(),
      });
      navigate('/login', {
        state: { message: 'Registration successful! Please sign in.' },
      });
    } catch (err) {
      setApiError(
        err.response?.data?.error || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-side-panel">
          <div className="auth-side-badge">Employee Food Ordering</div>
          <h2 className="auth-side-title">Create your canteen account.</h2>
          <p className="auth-side-text">
            Join the platform to explore today&apos;s menu, place orders faster,
            and track pickup status in a smooth and modern experience.
          </p>

          <div className="auth-side-points">
            <div className="auth-point">🍱 Order meals with ease</div>
            <div className="auth-point">🏢 Register using company details</div>
            <div className="auth-point">📍 Track order readiness live</div>
          </div>
        </div>

        <div className="auth-card" style={{ maxWidth: 460, width: '100%' }}>
          <div className="auth-logo-wrap">
            <div className="auth-logo">🍽️</div>
          </div>

          <div className="auth-chip">Create Account</div>
          <h1 className="auth-title">Get started</h1>
          <p className="auth-subtitle">
            Register to access the canteen ordering system
          </p>

          {apiError && <div className="alert alert-error">{apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="Alice Sharma"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="alice@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="company">
                Company
              </label>
              <input
                id="company"
                type="text"
                name="company"
                className={`form-input ${errors.company ? 'input-error' : ''}`}
                placeholder="TechCorp"
                value={form.company}
                onChange={handleChange}
              />
              {errors.company && <p className="form-error">{errors.company}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already registered?</span>
          </div>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}