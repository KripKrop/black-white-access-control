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
    <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'hsl(var(--foreground))',
              margin: '0 0 8px 0'
            }}>
              Sensia Systems
            </h1>
            <p style={{ 
              color: 'hsl(var(--muted-foreground))', 
              fontSize: '1.1rem',
              margin: '0'
            }}>
              Welcome back, {user?.email}
            </p>
          </div>
          <Button
            onClick={handleCreateUser}
            size="lg"
            className="gap-2"
            style={{ flexShrink: 0 }}
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

        {/* Statistics Cards - Forced Horizontal Layout */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            <Card style={{ 
              flex: '1 1 300px',
              minWidth: '300px',
              transition: 'all 0.3s ease',
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))'
            }} 
            className="group hover:shadow-xl hover:border-primary/30">
              <CardContent style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: 'hsl(var(--primary) / 0.05)',
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 24px auto',
                  border: '1px solid hsl(var(--primary) / 0.1)',
                  transition: 'background-color 0.3s ease'
                }}>
                  <Users style={{ width: '40px', height: '40px', color: 'hsl(var(--primary))' }} />
                </div>
                <h3 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  margin: '0 0 12px 0',
                  color: 'hsl(var(--foreground))'
                }}>
                  {users.length}
                </h3>
                <p style={{ 
                  color: 'hsl(var(--muted-foreground))', 
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0'
                }}>
                  Total Users
                </p>
              </CardContent>
            </Card>
            
            <Card style={{ 
              flex: '1 1 300px',
              minWidth: '300px',
              transition: 'all 0.3s ease',
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))'
            }} 
            className="group hover:shadow-xl hover:border-primary/30">
              <CardContent style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: 'hsl(var(--primary) / 0.05)',
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 24px auto',
                  border: '1px solid hsl(var(--primary) / 0.1)',
                  transition: 'background-color 0.3s ease'
                }}>
                  <Shield style={{ width: '40px', height: '40px', color: 'hsl(var(--primary))' }} />
                </div>
                <h3 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  margin: '0 0 12px 0',
                  color: 'hsl(var(--foreground))'
                }}>
                  {users.filter(u => u.is_superuser).length}
                </h3>
                <p style={{ 
                  color: 'hsl(var(--muted-foreground))', 
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0'
                }}>
                  Super Admins
                </p>
              </CardContent>
            </Card>
            
            <Card style={{ 
              flex: '1 1 300px',
              minWidth: '300px',
              transition: 'all 0.3s ease',
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))'
            }} 
            className="group hover:shadow-xl hover:border-primary/30">
              <CardContent style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: 'hsl(var(--primary) / 0.05)',
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 24px auto',
                  border: '1px solid hsl(var(--primary) / 0.1)',
                  transition: 'background-color 0.3s ease'
                }}>
                  <User style={{ width: '40px', height: '40px', color: 'hsl(var(--primary))' }} />
                </div>
                <h3 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  margin: '0 0 12px 0',
                  color: 'hsl(var(--foreground))'
                }}>
                  {users.filter(u => !u.is_superuser).length}
                </h3>
                <p style={{ 
                  color: 'hsl(var(--muted-foreground))', 
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0'
                }}>
                  Regular Users
                </p>
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