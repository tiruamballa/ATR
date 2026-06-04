const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create separate functions and configurations instead of circular modules
let localAccessToken = '';

export const setLocalToken = (token) => {
  localAccessToken = token;
};

export const getLocalToken = () => {
  return localAccessToken;
};

// Create a function that returns header details
export const getAuthHeaders = () => {
  const token = getLocalToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Standard Fetch Wrapper helper for simpler networking
export const apiRequest = async (endpoint, options = {}) => {
  let cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  // Automatically append /api if it is missing
  if (!cleanBaseUrl.toLowerCase().endsWith('/api')) {
    cleanBaseUrl = `${cleanBaseUrl}/api`;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBaseUrl}${cleanEndpoint}`;
  
  // Set headers
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    // Ensure cookies (refresh token) are included in cross-site requests
    credentials: options.credentials || 'include',
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  let response = await fetch(url, config);

  // If unauthorized, attempt to refresh the token once
  if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    try {
      const refreshResponse = await fetch(`${cleanBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setLocalToken(refreshData.accessToken);
        
        // Re-attempt request with new token
        headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
        config.headers = headers;
        response = await fetch(url, config);
      } else {
        // Refresh token failed/expired
        setLocalToken('');
      }
    } catch (err) {
      console.error('Silent refresh token error:', err);
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};
