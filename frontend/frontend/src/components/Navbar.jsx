// import { Link, useNavigate, useLocation } from 'react-router-dom';

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const role = sessionStorage.getItem('role');
//   const name = sessionStorage.getItem('name');

//   const logout = () => {
//     sessionStorage.clear();
//     navigate('/login');
//   };

//   const isActive = (path) =>
//     location.pathname === path ? 'nav-link active' : 'nav-link';

//   return (
//     <nav className="navbar">
//       <div className="navbar-brand">
//         🍽️ <span>Canteen</span>
//       </div>

//       <div className="navbar-right">
//         <div className="navbar-nav">
//           {role === 'USER' && (
//             <>
//               <Link to="/dashboard" className={isActive('/dashboard')}>
//                 Today's Menu
//               </Link>
//               <Link to="/my-orders" className={isActive('/my-orders')}>
//                 My Orders
//               </Link>
//             </>
//           )}
//           {role === 'ADMIN' && (
//             <>
//               <Link to="/admin" className={isActive('/admin')}>
//                 Dashboard
//               </Link>
//               <Link to="/admin/orders" className={isActive('/admin/orders')}>
//                 Orders
//               </Link>
//               <Link to="/admin/menu" className={isActive('/admin/menu')}>
//                 Menu
//               </Link>
//             </>
//           )}
//         </div>

//         <div className="nav-user">
//           <span className="nav-username">Hi, {name || 'User'}</span>
//           <span className="nav-role-badge">{role}</span>
//           <button className="btn-logout" onClick={logout}>
//             Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// }


import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = sessionStorage.getItem('role');
  const name = sessionStorage.getItem('name');

  const logout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  const isActive = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-brand-wrap">
        <div className="navbar-brand-icon">🍽️</div>
        <div className="navbar-brand">
          <span>Canteen</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-nav">
          {role === 'USER' && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                Today&apos;s Menu
              </Link>
              <Link to="/my-orders" className={isActive('/my-orders')}>
                My Orders
              </Link>
            </>
          )}
          {role === 'ADMIN' && (
            <>
              <Link to="/admin" className={isActive('/admin')}>
                Dashboard
              </Link>
              <Link to="/admin/orders" className={isActive('/admin/orders')}>
                Orders
              </Link>
              <Link to="/admin/menu" className={isActive('/admin/menu')}>
                Menu
              </Link>
            </>
          )}
        </div>

        <div className="nav-user">
          <div className="nav-user-avatar">
            {(name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="nav-user-meta">
            <span className="nav-username">Hi, {name || 'User'}</span>
            <span className="nav-role-badge">{role}</span>
          </div>
          <button className="btn-logout" onClick={openChatbot} style={{ background: '#2c5282', color: 'white', marginRight: '8px' }}>
            Chat
          </button>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}