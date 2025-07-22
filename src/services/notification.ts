import { Notification } from '@/types/notification';

import { toast } from 'react-hot-toast';

export const notificationService = {
  // Simulated notifications with specific messages
  getNotifications: (type: string): Notification[] => {
    switch (type) {
      case 'Transaksi':
        // Return empty array when count is 0
        return [];
      case 'Pesan':
        return [];
      case 'Star':
        return [];
      case 'Calendar':
        return [];
      default:
        return [];
    }
  },

  showNotification: (type: string, count: number) => {
    if (count > 0) {
      toast('Ada notifikasi yang menanti', { icon: '🔔' });
      return;
    }

    const notifications = notificationService.getNotifications(type);

    if (notifications.length === 0) {
      toast('Tidak ada notifikasi terbaru', { icon: '📭' });
    } else {
      notifications.forEach((notification) => {
        switch (notification.type) {
          case 'success':
            toast.success(notification.message);
            break;
          case 'error':
            toast.error(notification.message);
            break;
          case 'info':
            toast(notification.message, { icon: '📨' });
            break;
        }
      });
    }
  }
};
