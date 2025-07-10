import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI, authAPI } from '../services/api';
import { PAGES } from '../config';

const Profile = () => {
  const { user, updateProfile, permissions } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: ''
  });
  const [passwordData, setPasswordData] = useState({
    email: user?.email || '',
    code: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await profileAPI.updateProfile(formData);
      updateProfile(response.data);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setPasswordLoading(true);
    setError('');

    try {
      await authAPI.requestReset(passwordData.email);
      setOtpSent(true);
      setSuccess('OTP sent to your email address');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    setError('');

    try {
      await authAPI.verifyReset(passwordData.email, passwordData.code, passwordData.new_password);
      setSuccess('Password reset successfully');
      setShowPasswordReset(false);
      setOtpSent(false);
      setPasswordData({
        email: user?.email || '',
        code: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      setError('Invalid OTP or failed to reset password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getPermissionBadge = (pageName) => {
    if (user?.is_superuser) {
      return <span className="badge bg-dark">Full Access</span>;
    }

    const pagePermission = permissions.find(p => p.page === pageName);
    if (!pagePermission || !pagePermission.can_view) {
      return <span className="badge bg-secondary">No Access</span>;
    }

    const permissionList = [];
    if (pagePermission.can_view) permissionList.push('View');
    if (pagePermission.can_edit) permissionList.push('Edit');
    if (pagePermission.can_create) permissionList.push('Create');
    if (pagePermission.can_delete) permissionList.push('Delete');

    return (
      <span className="badge bg-success">
        {permissionList.join(', ')}
      </span>
    );
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h4 className="mb-0">Profile Settings</h4>
            </div>
            <div className="card-body">
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

              {/* Profile Information */}
              <div className="mb-5">
                <h5 className="fw-bold mb-3">Personal Information</h5>
                
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="first_name" className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="last_name" className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={user?.email || ''}
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </form>
              </div>

              {/* Password Reset */}
              <div className="mb-5">
                <h5 className="fw-bold mb-3">Password Reset</h5>
                
                {!showPasswordReset ? (
                  <button
                    className="btn btn-outline-dark"
                    onClick={() => setShowPasswordReset(true)}
                  >
                    Reset Password
                  </button>
                ) : (
                  <div className="border rounded p-3">
                    {!otpSent ? (
                      <div>
                        <p className="mb-3">Click the button below to receive an OTP for password reset.</p>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-dark"
                            onClick={handleRequestOTP}
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Sending OTP...
                              </>
                            ) : (
                              'Send OTP'
                            )}
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPasswordReset(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordReset}>
                        <div className="mb-3">
                          <label htmlFor="code" className="form-label">OTP Code</label>
                          <input
                            type="text"
                            className="form-control"
                            id="code"
                            name="code"
                            value={passwordData.code}
                            onChange={handlePasswordChange}
                            required
                            maxLength="6"
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="new_password" className="form-label">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="new_password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            required
                            minLength="8"
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirm_password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            required
                            minLength="8"
                          />
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            type="submit"
                            className="btn btn-dark"
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Resetting...
                              </>
                            ) : (
                              'Reset Password'
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setShowPasswordReset(false);
                              setOtpSent(false);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* User Permissions */}
              <div>
                <h5 className="fw-bold mb-3">Your Permissions</h5>
                {user?.is_superuser ? (
                  <div className="alert alert-info">
                    <strong>Super Administrator:</strong> You have full access to all features and pages.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Page</th>
                          <th>Permissions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PAGES.map(page => (
                          <tr key={page.id}>
                            <td>{page.name}</td>
                            <td>{getPermissionBadge(page.name)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;