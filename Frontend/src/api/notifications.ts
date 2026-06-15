import axios from 'axios';

const BASE = 'http://localhost:3001/notifications';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  category: 'info' | 'success' | 'warning' | 'system';
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export const notificationsApi = {
  getAll: (userId: number): Promise<Notification[]> =>
    axios.get(BASE, { params: { userId } }).then((r) => r.data),

  markAsRead: (id: number, userId: number): Promise<void> =>
    axios.patch(`${BASE}/${id}/read`, null, { params: { userId } }).then(() => {}),

  markAllAsRead: (userId: number): Promise<void> =>
    axios.patch(`${BASE}/read-all`, null, { params: { userId } }).then(() => {}),

  remove: (id: number, userId: number): Promise<void> =>
    axios.delete(`${BASE}/${id}`, { params: { userId } }).then(() => {}),

  clearAll: (userId: number): Promise<void> =>
    axios.delete(`${BASE}/clear-all`, { params: { userId } }).then(() => {}),
};
