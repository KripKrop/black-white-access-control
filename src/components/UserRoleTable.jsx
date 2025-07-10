import React, { useState, useEffect } from 'react';
import { PAGES } from '../config';
import { userAPI } from '../services/api';

const UserRoleTable = ({ users, onEditUser, onDeleteUser, onRefresh }) => {
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUserPermissions();
  }, [users]);

  const fetchAllUserPermissions = async () => {
    try {
      setLoading(true);
      const permissionsMap = {};
      
      await Promise.all(
        users.map(async (user) => {
          if (!user.is_superuser) {
            try {
              const response = await userAPI.getUserPermissions(user.id);
              permissionsMap[user.id] = response.data;
            } catch (error) {
              console.error(`Failed to fetch permissions for user ${user.id}:`, error);
              permissionsMap[user.id] = [];
            }
          }
        })
      );
      
      setUserPermissions(permissionsMap);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionDisplay = (userId, pageName) => {
    if (users.find(u => u.id === userId)?.is_superuser) {
      return (
        <span className="badge bg-dark">
          ADMIN
        </span>
      );
    }

    const permissions = userPermissions[userId] || [];
    const pagePermission = permissions.find(p => p.page === pageName);
    
    if (!pagePermission) {
      return (
        <span className="text-muted small">
          No Access
        </span>
      );
    }

    const permissionBadges = [];
    if (pagePermission.can_view) permissionBadges.push('V');
    if (pagePermission.can_edit) permissionBadges.push('E');
    if (pagePermission.can_create) permissionBadges.push('C');
    if (pagePermission.can_delete) permissionBadges.push('D');

    if (permissionBadges.length === 0) {
      return (
        <span className="text-muted small">
          No Access
        </span>
      );
    }

    return (
      <span className="badge bg-secondary">
        {permissionBadges.join('/')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th style={{ minWidth: '200px' }}>User</th>
            {PAGES.map(page => (
              <th key={page.id} className="text-center" style={{ minWidth: '120px' }}>
                <div className="small">{page.name}</div>
              </th>
            ))}
            <th className="text-center" style={{ minWidth: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {user.first_name || user.last_name ? 
                        `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                        user.username
                      }
                      {user.is_superuser && (
                        <span className="badge bg-warning text-dark ms-2 small">
                          Super Admin
                        </span>
                      )}
                    </div>
                    <div className="text-muted small">{user.email}</div>
                  </div>
                </div>
              </td>
              
              {PAGES.map(page => (
                <td key={page.id} className="text-center align-middle">
                  {getPermissionDisplay(user.id, page.name)}
                </td>
              ))}
              
              <td className="text-center align-middle">
                <div className="btn-group" role="group">
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => onEditUser(user)}
                    title="Edit User & Permissions"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  {!user.is_superuser && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onDeleteUser(user.id)}
                      title="Delete User"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserRoleTable;