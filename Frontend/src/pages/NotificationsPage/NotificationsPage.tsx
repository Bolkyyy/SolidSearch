import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { useNotifications } from '../../context/NotificationsContext';
import { Notification } from '../../api/notifications';

const categoryIcon = (category: string) => {
  switch (category) {
    case 'success': return <i className="fa fa-check-circle" />;
    case 'warning': return <i className="fa fa-exclamation-triangle" />;
    case 'system':  return <i className="fa fa-cog" />;
    default:        return <i className="fa fa-info-circle" />;
  }
};

const relativeTime = (dateStr: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU');
};

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const handleClick = (n: Notification) => {
    if (!n.is_read) markAsRead(n.id);
  };

  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (deleteTargetId !== null) removeNotification(deleteTargetId);
    setDeleteTargetId(null);
  };

  const confirmClearAll = () => {
    clearAll();
    setClearAllOpen(false);
  };

  const deleteTarget = notifications.find((n) => n.id === deleteTargetId);

  return (
    <Layout>
      <div className="notifications-page">
        <div className="notifications-header">
          <div className="notifications-title">
            <h1>Уведомления</h1>
            <p>История всех событий и оповещений системы</p>
          </div>
          <div className="notifications-actions">
            {notifications.length > 0 && (
              <>
                <button className="clear-all-btn" onClick={() => setClearAllOpen(true)}>
                  <i className="fa fa-trash" style={{ marginRight: 6 }} />
                  Очистить все
                </button>
                {unreadCount > 0 && (
                  <button className="mark-all-read-btn" onClick={markAllAsRead}>
                    <i className="fa fa-check-double" style={{ marginRight: 6 }} />
                    Отметить все прочитанными
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="empty-notifications">
              <div className="empty-icon"><i className="fa fa-spinner fa-spin" /></div>
              <h3>Загрузка...</h3>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-icon"><i className="fa fa-bell-slash" /></div>
              <h3>Нет уведомлений</h3>
              <p>Когда появятся новые уведомления, они будут отображаться здесь</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                onClick={() => handleClick(n)}
              >
                <div className="notification-icon">
                  <div className={`category-icon ${n.category}`}>
                    {categoryIcon(n.category)}
                  </div>
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    <h3>{n.title}</h3>
                    <span className="notification-time">{relativeTime(n.created_at)}</span>
                  </div>
                  <p className="notification-message">{n.message}</p>
                </div>
                <button
                  className="delete-notification-btn"
                  onClick={(e) => handleDeleteClick(n.id, e)}
                >
                  <i className="fa fa-times" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Удалить уведомление"
        message={deleteTarget ? `Удалить "${deleteTarget.title}"?` : ''}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      <ConfirmModal
        isOpen={clearAllOpen}
        title="Очистить все уведомления"
        message="Все уведомления будут удалены без возможности восстановления."
        confirmText="Очистить всё"
        cancelText="Отмена"
        variant="danger"
        onConfirm={confirmClearAll}
        onCancel={() => setClearAllOpen(false)}
      />
    </Layout>
  );
};

export default NotificationsPage;
