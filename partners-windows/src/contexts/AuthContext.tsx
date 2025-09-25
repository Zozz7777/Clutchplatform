import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginForm, PartnerIdForm, DeviceRegistrationForm } from '../types';
import { useTranslation } from 'react-i18next';

interface AuthContextType extends AuthState {
  login: (form: LoginForm) => Promise<{ success: boolean; error?: string }>;
  validatePartnerId: (form: PartnerIdForm) => Promise<{ success: boolean; error?: string; data?: any }>;
  registerDevice: (form: DeviceRegistrationForm) => Promise<{ success: boolean; error?: string; data?: any }>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; partnerId: string; deviceId: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_ERROR'; payload: string };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  partnerId: null,
  deviceId: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        partnerId: action.payload.partnerId,
        deviceId: action.payload.deviceId,
      };
    case 'LOGOUT':
      return initialState;
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_ERROR':
      return { ...state };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useTranslation();

  // Load saved auth state on app start
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await window.electronAPI.dbQuery('SELECT value FROM settings WHERE key = ?', ['auth_token']);
        const partnerId = await window.electronAPI.dbQuery('SELECT value FROM settings WHERE key = ?', ['partner_id']);
        const deviceId = await window.electronAPI.dbQuery('SELECT value FROM settings WHERE key = ?', ['device_id']);
        
        if (token.length > 0 && partnerId.length > 0 && deviceId.length > 0) {
          // Verify token is still valid
          const response = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/partners/auth/refresh-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token[0].value}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            // Get user info from local database
            const userResult = await window.electronAPI.dbQuery('SELECT * FROM users WHERE partner_id = ? LIMIT 1', [partnerId[0].value]);
            
            if (userResult.length > 0) {
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: userResult[0],
                  token: result.data.token,
                  partnerId: partnerId[0].value,
                  deviceId: deviceId[0].value
                }
              });
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load auth state:', error);
        }
      }
    };

    loadAuthState();
  }, []);

  const validatePartnerId = async (form: PartnerIdForm): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/partners/validate-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || t('errors.validationError') };
      }
    } catch (error) {
      return { success: false, error: t('errors.networkError') };
    } finally {
      setIsLoading(false);
    }
  };

  const registerDevice = async (form: DeviceRegistrationForm): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/partners/${form.partnerId}/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (result.success) {
        // Save device info to local database
        await window.electronAPI.dbExec(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['device_id', form.deviceId]
        );
        await window.electronAPI.dbExec(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['partner_id', form.partnerId]
        );

        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || t('errors.operationFailed') };
      }
    } catch (error) {
      return { success: false, error: t('errors.networkError') };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (form: LoginForm): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/partners/auth/partner-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          deviceId: state.deviceId
        })
      });

      const result = await response.json();

      if (result.success) {
        const { partner, token } = result.data;
        
        // Save auth info to local database
        await window.electronAPI.dbExec(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['auth_token', token]
        );
        await window.electronAPI.dbExec(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['partner_id', partner.partnerId]
        );

        // Create or update user in local database
        await window.electronAPI.dbExec(
          `INSERT OR REPLACE INTO users (
            partner_id, username, email, role, permissions, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            partner.partnerId,
            partner.email,
            partner.email,
            'owner',
            JSON.stringify(['view_orders', 'manage_orders', 'view_payments', 'manage_payments', 'view_settings', 'manage_settings', 'view_dashboard', 'manage_dashboard', 'view_invoices', 'manage_invoices', 'view_analytics', 'manage_analytics']),
            1
          ]
        );

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: {
              id: 1,
              partner_id: partner.partnerId,
              username: partner.email,
              email: partner.email,
              role: 'owner',
              permissions: ['view_orders', 'manage_orders', 'view_payments', 'manage_payments', 'view_settings', 'manage_settings', 'view_dashboard', 'manage_dashboard', 'view_invoices', 'manage_invoices', 'view_analytics', 'manage_analytics'],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            token,
            partnerId: partner.partnerId,
            deviceId: state.deviceId || ''
          }
        });

        return { success: true };
      } else {
        return { success: false, error: result.message || t('errors.authenticationError') };
      }
    } catch (error) {
      return { success: false, error: t('errors.networkError') };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear auth info from local database
      await window.electronAPI.dbExec('DELETE FROM settings WHERE key IN (?, ?)', ['auth_token', 'device_id']);
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
    }
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value: AuthContextType = {
    ...state,
    login,
    validatePartnerId,
    registerDevice,
    logout,
    updateUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
