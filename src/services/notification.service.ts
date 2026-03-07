import api from '@/lib/api';

export interface AppNotification {
  id: string;
  type: 'DUEL_INVITE' | 'RANK_DROP' | 'GENERAL';
  title: string;
  message: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    const response = await api.get('/notifications');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
};
