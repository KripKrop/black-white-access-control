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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Sensia Systems</h1>
            <p className="text-muted-foreground text-lg">Welcome back, {user?.email}</p>
          </div>
          <Button
            onClick={handleCreateUser}
            size="lg"
            className="gap-2 w-fit"
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

        {/* Statistics Cards - Force single row layout */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <Card className="flex-1 group hover:shadow-xl transition-all duration-300 border hover:border-primary/30 bg-card">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors border border-primary/10">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-3 text-foreground">{users.length}</h3>
                <p className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Total Users</p>
              </CardContent>
            </Card>
            
            <Card className="flex-1 group hover:shadow-xl transition-all duration-300 border hover:border-primary/30 bg-card">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors border border-primary/10">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-3 text-foreground">{users.filter(u => u.is_superuser).length}</h3>
                <p className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Super Admins</p>
              </CardContent>
            </Card>
            
            <Card className="flex-1 group hover:shadow-xl transition-all duration-300 border hover:border-primary/30 bg-card">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors border border-primary/10">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-3 text-foreground">{users.filter(u => !u.is_superuser).length}</h3>
                <p className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Regular Users</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* User Role Table */}
        <Card className="shadow-sm">
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
        </Card>

        {/* Right Side Panel */}
        <RightSidePanel
          show={showPanel}
          mode={panelMode}
          user={selectedUser}
          onClose={handleClosePanel}
          onUserUpdated={handleUserUpdated}
        />
      </div>
    </div>
  );
};

export default Dashboard;