import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category?: 'info' | 'success' | 'warning' | 'system';
  link?: string;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Индексация завершена',
      message: 'Все документы из папки "Архив 2024" успешно проиндексированы. Доступно для поиска.',
      timestamp: '5 минут назад',
      isRead: false,
      category: 'success',
      link: '/collections',
    },
    {
      id: '2',
      title: 'Новый договор на ремонт',
      message: 'Добавлен документ "Договор_подряда_ремонт_ИТ.pdf". Требуется подтверждение.',
      timestamp: '1 час назад',
      isRead: false,
      category: 'info',
    },
    {
      id: '3',
      title: 'Системное обновление',
      message: 'AI-поиск будет временно недоступен 12 мая с 02:00 до 03:00 (МСК).',
      timestamp: '3 часа назад',
      isRead: true,
      category: 'system',
    },
    {
      id: '4',
      title: 'Смета_ремонт.pdf проанализирована',
      message: 'Найдены несоответствия в пунктах 3.2 и 5.1. Рекомендуем сверить с оригиналом.',
      timestamp: 'вчера в 14:23',
      isRead: false,
      category: 'warning',
    },
    {
      id: '5',
      title: 'Популярный запрос: "Договоры на ремонт"',
      message: 'Этот запрос набрал +32% за последние сутки. Добавлено 7 релевантных документов.',
      timestamp: 'вчера в 09:15',
      isRead: true,
      category: 'info',
    },
    {
      id: '6',
      title: 'Мария Сидорова открыла документ',
      message: 'Она получила доступ к "Смета_ремонт.pdf" по вашей ссылке.',
      timestamp: '2 дня назад',
      isRead: true,
      category: 'info',
    },
    {
      id: '7',
      title: 'Завершена выгрузка аналитики',
      message: 'Отчёт "Аналитика поиска за апрель" готов к скачиванию в формате CSV.',
      timestamp: '2 дня назад',
      isRead: false,
      category: 'success',
    },
    {
      id: '8',
      title: 'Ошибка индексации',
      message: 'Файл "счет_фактура_большой.tiff" не проиндексирован. Требуется повторная загрузка.',
      timestamp: '3 дня назад',
      isRead: true,
      category: 'warning',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    if (window.confirm('Вы уверены, что хотите удалить все уведомления?')) {
      setNotifications([]);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'system': return '⚙';
      default: return '📄';
    }
  };

  const getCategoryClass = (category?: string) => {
    switch (category) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'system': return 'system';
      default: return 'info';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-title">
          <h1>Уведомления</h1>
          <p>История всех событий и оповещений системы</p>
        </div>
        <div className="notifications-actions">
          {notifications.length > 0 && (
            <>
              <button className="clear-all-btn" onClick={clearAllNotifications}>
                🗑️ Очистить все
              </button>
              {unreadCount > 0 && (
                <button className="mark-all-read-btn" onClick={markAllAsRead}>
                  ✓ Отметить все прочитанными
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="notifications-stats">
        <div className="stat-card">
          <div className="stat-value">{notifications.length}</div>
          <div className="stat-label">Всего уведомлений</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{unreadCount}</div>
          <div className="stat-label">Непрочитанных</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {notifications.filter((n) => n.category === 'warning').length}
          </div>
          <div className="stat-label">Требуют внимания</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {notifications.filter((n) => n.category === 'success').length}
          </div>
          <div className="stat-label">Завершено успешно</div>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <h3>Нет уведомлений</h3>
            <p>Когда появятся новые уведомления, они будут отображаться здесь</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                <div className={`category-icon ${getCategoryClass(notification.category)}`}>
                  {getCategoryIcon(notification.category)}
                </div>
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  <h3>{notification.title}</h3>
                  <span className="notification-time">{notification.timestamp}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
                {notification.link && (
                  <div className="notification-link">
                    📎 Открыть связанный документ →
                  </div>
                )}
              </div>
              <button
                className="delete-notification-btn"
                onClick={(e) => deleteNotification(notification.id, e)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;