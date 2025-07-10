import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { tokenManager, userAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  permissions: [],
  isAuthenticated: false,
  loading: true
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        permissions: action.payload.permissions || [],
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'UPDATE_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  let inactivityTimer = null;

  // Auto-logout after 1 hour of inactivity
  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (state.isAuthenticated) {
      inactivityTimer = setTimeout(() => {
        logout();
      }, 60 * 60 * 1000); // 1 hour
    }
  };

  // Token refresh every 15 minutes
  useEffect(() => {
    let refreshInterval;
    if (state.isAuthenticated) {
      refreshInterval = setInterval(async () => {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/'}token/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken })
            });
            
            if (response.ok) {
              const { access } = await response.json();
              const tokens = tokenManager.getTokens();
              tokenManager.setTokens({ ...tokens, access });
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
          }
        }
      }, 15 * 60 * 1000); // 15 minutes
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [state.isAuthenticated]);

  // Activity listeners
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const resetTimer = () => resetInactivityTimer();
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [state.isAuthenticated]);

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const tokens = tokenManager.getTokens();
      if (tokens?.access) {
        try {
          // Verify token by making a test API call
          const response = await userAPI.getUsers();
          // If we get here, token is valid
          // We need to decode the JWT to get user info
          const payload = JSON.parse(atob(tokens.access.split('.')[1]));
          
          const user = {
            id: payload.user_id,
            email: payload.email || payload.username, // Fallback to username if no email in JWT
            is_superuser: payload.is_superuser || false
          };

          let permissions = [];
          if (!user.is_superuser) {
            try {
              const permResponse = await userAPI.getUserPermissions(user.id);
              permissions = permResponse.data;
            } catch (error) {
              console.error('Failed to fetch permissions:', error);
            }
          }

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, permissions }
          });
        } catch (error) {
          tokenManager.clearTokens();
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (tokens, userData) => {
    console.log('AuthContext login called with userData:', userData); // Debug log
    tokenManager.setTokens(tokens);
    
    let permissions = [];
    if (!userData.is_superuser) {
      try {
        const response = await userAPI.getUserPermissions(userData.id);
        permissions = response.data;
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    } else {
      console.log('User is superuser, skipping permission fetch'); // Debug log
    }

    console.log('Dispatching LOGIN_SUCCESS with:', { user: userData, permissions }); // Debug log
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: userData, permissions }
    });
  };

  const logout = () => {
    tokenManager.clearTokens();
    if (inactivityTimer) clearTimeout(inactivityTimer);
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  };

  const updateProfile = (profileData) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
  };

  const updatePermissions = (permissions) => {
    dispatch({ type: 'UPDATE_PERMISSIONS', payload: permissions });
  };

  const hasPermission = (pageName, permission) => {
    if (state.user?.is_superuser) return true;
    
    const pagePermissions = state.permissions.find(p => p.page === pageName);
    if (!pagePermissions) return false;
    
    switch (permission) {
      case 'view': return pagePermissions.can_view;
      case 'edit': return pagePermissions.can_edit;
      case 'create': return pagePermissions.can_create;
      case 'delete': return pagePermissions.can_delete;
      default: return false;
    }
  };

  const getAccessiblePages = () => {
    if (state.user?.is_superuser) {
      return import('../config').then(config => config.PAGES);
    }
    
    return import('../config').then(config => 
      config.PAGES.filter(page => hasPermission(page.name, 'view'))
    );
  };

  const value = {
    ...state,
    login,
    logout,
    updateProfile,
    updatePermissions,
    hasPermission,
    getAccessiblePages
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};