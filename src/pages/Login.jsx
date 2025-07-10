import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData.email, formData.password);
      const { access, refresh } = response.data;
      
      // Decode JWT to get user info
      const payload = JSON.parse(atob(access.split('.')[1]));
      console.log('JWT payload:', payload); // Debug log
      console.log('API response data:', response.data); // Debug log
      
      const userData = {
        id: payload.user_id,
        email: payload.email,
        is_superuser: response.data.is_superuser || false,
        username: response.data.username || payload.username || formData.email.split('@')[0],
        first_name: response.data.first_name || payload.first_name || '',
        last_name: response.data.last_name || payload.last_name || ''
      };

      console.log('User data being passed to login:', userData); // Debug log

      await login({ access, refresh }, userData);
      
      // Redirect based on role
      console.log('Redirecting user - is_superuser:', userData.is_superuser); // Debug log
      if (userData.is_superuser) {
        navigate('/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      setError(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold">Super Admin Dashboard</h1>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-dark"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <Link to="/reset-password" className="text-decoration-none">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;