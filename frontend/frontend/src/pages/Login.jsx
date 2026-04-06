// import { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import api from '../api/axios.js';

// export default function Login() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [errors, setErrors] = useState({});
//   const [apiError, setApiError] = useState('');
//   const [successMsg, setSuccessMsg] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // Show success message from register redirect
//     if (location.state?.message) {
//       setSuccessMsg(location.state.message);
//     }
//     // Redirect if already logged in
//     const token = sessionStorage.getItem('token');
//     const role = sessionStorage.getItem('role');
//     if (token && role) {
//       navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
//     }
//   }, []);

//   const validate = () => {
//     const errs = {};
//     if (!form.email.trim()) {
//       errs.email = 'Email is required.';
//     } else if (!/\S+@\S+\.\S+/.test(form.email)) {
//       errs.email = 'Enter a valid email address.';
//     }
//     if (!form.password) {
//       errs.password = 'Password is required.';
//     }
//     return errs;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
//     setApiError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errs = validate();
//     if (Object.keys(errs).length > 0) {
//       setErrors(errs);
//       return;
//     }

//     setLoading(true);
//     setApiError('');

//     try {
//       const res = await api.post('/auth/login', {
//         email: form.email.trim(),
//         password: form.password,
//       });
//       const { token, userId, email, name, role } = res.data;
//       sessionStorage.setItem('token', token);
//       sessionStorage.setItem('userId', String(userId));
//       sessionStorage.setItem('email', email);
//       sessionStorage.setItem('name', name);
//       sessionStorage.setItem('role', role);
//       navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
//     } catch (err) {
//       setApiError(
//         err.response?.data?.error || 'Login failed. Please check your credentials.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <div className="auth-logo">🍽️</div>
//         <h1 className="auth-title">Welcome back</h1>
//         <p className="auth-subtitle">Sign in to your canteen account</p>

//         {successMsg && <div className="alert alert-success">{successMsg}</div>}
//         {apiError && <div className="alert alert-error">{apiError}</div>}

//         <form onSubmit={handleSubmit} noValidate>
//           <div className="form-group">
//             <label className="form-label" htmlFor="email">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               name="email"
//               className={`form-input ${errors.email ? 'input-error' : ''}`}
//               placeholder="you@company.com"
//               value={form.email}
//               onChange={handleChange}
//               autoComplete="email"
//             />
//             {errors.email && <p className="form-error">{errors.email}</p>}
//           </div>

//           <div className="form-group">
//             <label className="form-label" htmlFor="password">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               name="password"
//               className={`form-input ${errors.password ? 'input-error' : ''}`}
//               placeholder="Your password"
//               value={form.password}
//               onChange={handleChange}
//               autoComplete="current-password"
//             />
//             {errors.password && <p className="form-error">{errors.password}</p>}
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary btn-full btn-lg"
//             disabled={loading}
//           >
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>

//         <div className="auth-link">
//           Don't have an account?{' '}
//           <Link to="/register">Register here</Link>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
    }

    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    if (token && role) {
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      errs.password = 'Password is required.';
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
      const res = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });
      const { token, userId, email, name, role } = res.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userId', String(userId));
      sessionStorage.setItem('email', email);
      sessionStorage.setItem('name', name);
      sessionStorage.setItem('role', role);
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setApiError(
        err.response?.data?.error || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-side-panel">
          <div className="auth-side-badge">Smart Canteen Ordering</div>
          <h2 className="auth-side-title">Skip the queue. Order faster.</h2>
          <p className="auth-side-text">
            A modern canteen ordering experience for employees and admins with
            live menu updates, order tracking, and smooth pickup flow.
          </p>

          <div className="auth-side-points">
            <div className="auth-point">⚡ Quick ordering</div>
            <div className="auth-point">📦 Real-time order status</div>
            <div className="auth-point">🧾 Seamless admin control</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-logo-wrap">
            <div className="auth-logo">🍽️</div>
          </div>

          <div className="auth-chip">Welcome Back</div>
          <h1 className="auth-title">Sign in to continue</h1>
          <p className="auth-subtitle">Access your canteen dashboard in seconds</p>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {apiError && <div className="alert alert-error">{apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
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
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>New here?</span>
          </div>

          <div className="auth-link">
            Don&apos;t have an account?{' '}
            <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}