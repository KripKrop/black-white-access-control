import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: verify OTP
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.requestReset(formData.email);
      setSuccess('OTP sent to your email address');
      setStep(2);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.verifyReset(formData.email, formData.code, formData.new_password);
      setSuccess('Password reset successfully. You can now login with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Invalid OTP or failed to reset password. Please try again.'
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
                  <h1 className="h3 fw-bold">Reset Password</h1>
                  <p className="text-muted">
                    {step === 1 ? 
                      'Enter your email to receive OTP' : 
                      'Enter OTP and new password'
                    }
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}

                {step === 1 ? (
                  <form onSubmit={handleRequestOTP}>
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
                        autoFocus
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
                            Sending OTP...
                          </>
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="mb-3">
                      <label htmlFor="code" className="form-label">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        autoFocus
                        maxLength="6"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="new_password" className="form-label">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="new_password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        required
                        minLength="8"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirm_password" className="form-label">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                        minLength="8"
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
                            Resetting Password...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </button>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => {
                          setStep(1);
                          setError('');
                          setSuccess('');
                        }}
                      >
                        Back to email step
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-center mt-3">
                  <Link to="/login" className="text-decoration-none">
                    Back to Login
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

export default ResetPassword;