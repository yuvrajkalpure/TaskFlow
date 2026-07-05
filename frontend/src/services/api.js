const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return handleResponse(res);
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  resetPasswordOTP: async (email, otp, newPassword) => {
    const res = await fetch(`${API_URL}/auth/reset-password-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    return handleResponse(res);
  },

  logout: async () => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};

export const taskAPI = {
  getTasks: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.order) queryParams.append('order', filters.order);

    const res = await fetch(`${API_URL}/tasks?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  updateTask: async (id, taskData) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};

export const userAPI = {
  updateProfilePhoto: async (profilePhoto) => {
    const res = await fetch(`${API_URL}/users/profile/photo`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ profilePhoto })
    });
    return handleResponse(res);
  },

  updateTheme: async (theme) => {
    const res = await fetch(`${API_URL}/users/profile/theme`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ theme })
    });
    return handleResponse(res);
  },

  resetPassword: async (oldPassword, newPassword) => {
    const res = await fetch(`${API_URL}/users/profile/reset-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    });
    return handleResponse(res);
  },

  getSessions: async () => {
    const res = await fetch(`${API_URL}/users/profile/sessions`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  revokeSession: async (sessionId) => {
    const res = await fetch(`${API_URL}/users/profile/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  deactivateAccount: async () => {
    const res = await fetch(`${API_URL}/users/profile/deactivate`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  adminGetUsers: async () => {
    const res = await fetch(`${API_URL}/users/admin/list`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  adminToggleDeactivate: async (userId, isDeleted) => {
    const res = await fetch(`${API_URL}/users/admin/deactivate/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isDeleted })
    });
    return handleResponse(res);
  }
};

export const feedbackAPI = {
  submitFeedback: async (rating, comment) => {
    const res = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment })
    });
    return handleResponse(res);
  },

  getFeedbackList: async () => {
    const res = await fetch(`${API_URL}/feedback`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
