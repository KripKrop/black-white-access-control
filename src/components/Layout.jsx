import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PAGES } from '../config';

const Layout = ({ children }) => {
  const { user, logout, getAccessiblePages } = useAuth();
  const [accessiblePages, setAccessiblePages] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug log to check user state
  console.log('Layout - current user:', user);

  useEffect(() => {
    const fetchPages = async () => {
      const pages = await getAccessiblePages();
      setAccessiblePages(pages);
    };
    fetchPages();
  }, [getAccessiblePages]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-vh-100 bg-white">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to={user?.is_superuser ? "/dashboard" : "/profile"}>
            Super Admin Dashboard
          </Link>

          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              {user?.is_superuser && (
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActivePage('/dashboard') ? 'active' : ''}`} 
                    to="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActivePage('/profile') ? 'active' : ''}`} 
                  to="/profile"
                >
                  Profile
                </Link>
              </li>

              {/* Accessible Pages */}
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  Pages
                </a>
                <ul className="dropdown-menu">
                  {accessiblePages.map(page => (
                    <li key={page.id}>
                      <Link 
                        className={`dropdown-item ${isActivePage(page.path) ? 'active' : ''}`} 
                        to={page.path}
                      >
                        {page.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  {user?.email}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;