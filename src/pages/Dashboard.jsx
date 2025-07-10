import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserRoleTable from '../components/UserRoleTable';
import RightSidePanel from '../components/RightSidePanel';
import { userAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Shield, User, Plus } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Sensia Systems</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.email}</p>
        </div>
        <Button
          onClick={handleCreateUser}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Add New User
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="flex justify-center mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{users.length}</h3>
              <p className="text-muted-foreground font-medium">Total Users</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{users.filter(u => u.is_superuser).length}</h3>
              <p className="text-muted-foreground font-medium">Super Admins</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{users.filter(u => !u.is_superuser).length}</h3>
              <p className="text-muted-foreground font-medium">Regular Users</p>
            </CardContent>
          </Card>
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