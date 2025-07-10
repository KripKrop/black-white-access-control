import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { PAGES } from '../config';

const RightSidePanel = ({ show, mode, user, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    is_superuser: false
  });
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    if (show) {
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email || '',
          username: user.username || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          is_superuser: user.is_superuser || false
        });
        fetchUserPermissions();
      } else {
        setFormData({
          email: '',
          username: '',
          first_name: '',
          last_name: '',
          is_superuser: false
        });
        initializePermissions();
      }
      setError('');
      setGeneratedPassword('');
    }
  }, [show, mode, user]);

  const fetchUserPermissions = async () => {
    if (!user || user.is_superuser) {
      initializePermissions();
      return;
    }

    try {
      const response = await userAPI.getUserPermissions(user.id);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      initializePermissions();
    }
  };

  const initializePermissions = () => {
    const defaultPermissions = PAGES.map(page => ({
      page: page.name,
      can_view: false,
      can_edit: false,
      can_create: false,
      can_delete: false
    }));
    setPermissions(defaultPermissions);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handlePermissionChange = (pageName, permission, checked) => {
    setPermissions(prev => prev.map(p => {
      if (p.page === pageName) {
        const updated = { ...p, [permission]: checked };
        
        // If removing view permission, remove all other permissions
        if (permission === 'can_view' && !checked) {
          updated.can_edit = false;
          updated.can_create = false;
          updated.can_delete = false;
        }
        // If adding edit/create/delete, automatically add view
        else if ((permission === 'can_edit' || permission === 'can_create' || permission === 'can_delete') && checked) {
          updated.can_view = true;
        }
        
        return updated;
      }
      return p;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'create') {
        // Create new user
        const response = await userAPI.createUser(formData);
        setGeneratedPassword(response.data.password);
        
        // Set permissions for new user if not super admin
        if (!formData.is_superuser) {
          await userAPI.updateUserPermissions(response.data.id, permissions);
        }
      } else {
        // Update existing user
        await userAPI.updateUser(user.id, formData);
        
        // Update permissions if not super admin
        if (!formData.is_superuser) {
          await userAPI.updateUserPermissions(user.id, permissions);
        }
      }
      
      onUserUpdated();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        `Failed to ${mode === 'create' ? 'create' : 'update'} user`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 ${show ? 'd-block' : 'd-none'}`}
        style={{ zIndex: 1040 }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div 
        className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg ${show ? 'translate-x-0' : 'translate-x-100'}`}
        style={{ 
          width: '500px', 
          zIndex: 1050,
          transition: 'transform 0.3s ease-in-out',
          transform: show ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        <div className="h-100 d-flex flex-column">
          {/* Header */}
          <div className="border-bottom p-4">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {mode === 'create' ? 'Add New User' : 'Edit User & Permissions'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                disabled={loading}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow-1 overflow-auto p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {generatedPassword && (
              <div className="alert alert-success" role="alert">
                <h6>User created successfully!</h6>
                <p className="mb-0">
                  <strong>Generated Password:</strong> <code>{generatedPassword}</code>
                </p>
                <small className="text-muted">
                  Please save this password and share it with the user. It won't be shown again.
                </small>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* User Information */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">User Information</h6>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={mode === 'edit'}
                  />
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

                <div className="row">
                  <div className="col-6 mb-3">
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
                  <div className="col-6 mb-3">
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
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_superuser"
                      name="is_superuser"
                      checked={formData.is_superuser}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="is_superuser">
                      Super Administrator
                    </label>
                  </div>
                  <small className="text-muted">
                    Super administrators have full access to all features
                  </small>
                </div>
              </div>

              {/* Permissions */}
              {!formData.is_superuser && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Page Permissions</h6>
                  
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Page</th>
                          <th className="text-center">View</th>
                          <th className="text-center">Edit</th>
                          <th className="text-center">Create</th>
                          <th className="text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PAGES.map(page => {
                          const pagePermission = permissions.find(p => p.page === page.name) || {
                            can_view: false,
                            can_edit: false,
                            can_create: false,
                            can_delete: false
                          };

                          return (
                            <tr key={page.id}>
                              <td className="small">{page.name}</td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={pagePermission.can_view}
                                  onChange={(e) => handlePermissionChange(page.name, 'can_view', e.target.checked)}
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={pagePermission.can_edit}
                                  onChange={(e) => handlePermissionChange(page.name, 'can_edit', e.target.checked)}
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={pagePermission.can_create}
                                  onChange={(e) => handlePermissionChange(page.name, 'can_create', e.target.checked)}
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={pagePermission.can_delete}
                                  onChange={(e) => handlePermissionChange(page.name, 'can_delete', e.target.checked)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-dark"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {mode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    mode === 'create' ? 'Create User' : 'Update User'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RightSidePanel;