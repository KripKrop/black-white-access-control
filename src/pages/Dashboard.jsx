import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserRoleTable from '../components/UserRoleTable';
import RightSidePanel from '../components/RightSidePanel';
import { userAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setPanelMode('create');
    setSelectedUser(null);
    setShowPanel(true);
  };

  const handleEditUser = (user) => {
    setPanelMode('edit');
    setSelectedUser(user);
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    setShowPanel(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 fw-bold">Super Admin Dashboard</h1>
              <p className="text-muted">Welcome back, {user?.email}</p>
            </div>
            <button
              className="btn btn-dark"
              onClick={handleCreateUser}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add New User
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1">Total Users</p>
                      <h4 className="mb-0">{users.length}</h4>
                    </div>
                    <div className="bg-dark text-white rounded p-3">
                      <i className="bi bi-people fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1">Super Admins</p>
                      <h4 className="mb-0">{users.filter(u => u.is_superuser).length}</h4>
                    </div>
                    <div className="bg-dark text-white rounded p-3">
                      <i className="bi bi-shield-check fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1">Regular Users</p>
                      <h4 className="mb-0">{users.filter(u => !u.is_superuser).length}</h4>
                    </div>
                    <div className="bg-dark text-white rounded p-3">
                      <i className="bi bi-person fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1">Active Sessions</p>
                      <h4 className="mb-0">{users.filter(u => u.last_login).length}</h4>
                    </div>
                    <div className="bg-dark text-white rounded p-3">
                      <i className="bi bi-activity fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Role Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">User Permissions & Management</h5>
            </div>
            <div className="card-body p-0">
              <UserRoleTable
                users={users}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onRefresh={fetchUsers}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Panel */}
      <RightSidePanel
        show={showPanel}
        mode={panelMode}
        user={selectedUser}
        onClose={handleClosePanel}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default Dashboard;