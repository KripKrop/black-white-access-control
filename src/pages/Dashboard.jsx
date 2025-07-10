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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Sensia Systems</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          onClick={handleCreateUser}
        >
          <i className="bi bi-plus-circle"></i>
          Add New User
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-foreground">{users.length}</h3>
            </div>
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
              <i className="bi bi-people text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Super Admins</p>
              <h3 className="text-2xl font-bold text-foreground">{users.filter(u => u.is_superuser).length}</h3>
            </div>
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
              <i className="bi bi-shield-check text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Regular Users</p>
              <h3 className="text-2xl font-bold text-foreground">{users.filter(u => !u.is_superuser).length}</h3>
            </div>
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
              <i className="bi bi-person text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* User Role Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h5 className="text-lg font-semibold text-foreground">User Permissions & Management</h5>
        </div>
        <div className="p-0">
          <UserRoleTable
            users={users}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onRefresh={fetchUsers}
          />
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