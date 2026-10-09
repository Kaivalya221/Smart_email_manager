import axios from 'axios';

const API_BASE = '';  // Uses Vite proxy in dev, same origin in prod

export const api = {
  async getAuthStatus(user) {
    const res = await axios.get(`${API_BASE}/auth/status`, { params: { user } });
    return res.data;
  },

  async fetchEmails(user) {
    const res = await axios.get(`${API_BASE}/emails`, { params: { user } });
    return res.data;
  },

  getGoogleAuthUrl() {
    return `${API_BASE}/auth/google`;
  }
};

export function getStoredUser() {
  return localStorage.getItem('mailmind_user');
}

export function setStoredUser(user) {
  if (user) localStorage.setItem('mailmind_user', user);
  else localStorage.removeItem('mailmind_user');
}
