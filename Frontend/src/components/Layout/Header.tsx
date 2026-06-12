import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import UploadModal from './UploadModel';

interface UserState {
  user?: {
    full_name?: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category?: 'info' | 'success' | 'warning' | 'system';
  link?: string;
}

const Header = () => {
  const [userName, setUserName] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = location.state as UserState;
    const stateUser = state?.user?.full_name;
    const storedName = localStorage.getItem('userFullName');
    setUserName(stateUser || storedName || 'Пользователь');
  }, [location.state]);

  // Загрузка уведомлений
  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(parsed);
          const count = parsed.filter((n: any) => !n.isRead).length;
          setUnreadCount(count);
        } catch (e) {
          console.error('Ошибка загрузки', e);
        }
      } else {
        // Демо-уведомления
        const demoNotifications: Notification[] = [
          {
            id: '1',
            title: 'Индексация завершена',
            message: 'Архив 2024 успешно проиндексирован',
            timestamp: '5 мин назад',
            isRead: false,
            category: 'success',
            link: '/collections',
          },
          {
            id: '2',
            title: 'Новый договор',
            message: 'Добавлен документ "Договор_подряда.pdf"',
            timestamp: '1 час назад',
            isRead: false,
            category: 'info',
          },
          {
            id: '3',
            title: 'Системное обновление',
            message: 'Обновление запланировано на 12 мая',
            timestamp: '3 часа назад',
            isRead: true,
            category: 'system',
          },
          {
            id: '4',
            title: 'Смета проанализирована',
            message: 'Найдены несоответствия в смете',
            timestamp: 'вчера',
            isRead: false,
            category: 'warning',
          },
        ];
        setNotifications(demoNotifications);
        localStorage.setItem('notifications', JSON.stringify(demoNotifications));
        setUnreadCount(3);
      }
    };
    
    loadNotifications();
    
    window.addEventListener('storage', loadNotifications);
    return () => window.removeEventListener('storage', loadNotifications);
  }, []);

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    const newUnreadCount = updated.filter(n => !n.isRead).length;
    setUnreadCount(newUnreadCount);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsDropdownOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleViewAll = () => {
    setIsDropdownOpen(false);
    navigate('/notifications');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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

  return (
    <>
      <header className="header">
        <div className="header-top-row">
          <div className="search-wrapper">
            <i className="fa fa-search" />
            <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
          </div>

          <div className="user-section">
            <div className="header-action-icons">
              <div
                className="action-btn green-text"
                onClick={() => setIsUploadOpen(true)}
                title="Загрузить документы"
                style={{ cursor: 'pointer' }}
              >
                <i className="fa fa-upload" />
              </div>
              
              {/* КНОПКА УВЕДОМЛЕНИЙ С ДРОПДАУНОМ */}
              <div className="notification-wrapper" ref={dropdownRef}>
                <div 
                  className="action-btn notification-btn"
                  onClick={toggleDropdown}
                  title="Уведомления"
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <i className="fa fa-bell" />
                  {unreadCount > 0 && (
                    <span className="notification-badge-header">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </div>
                
                {/* ВЫПАДАЮЩЕЕ ОКНО */}
                {isDropdownOpen && (
                  <div className="notification-dropdown">
                    <div className="dropdown-header">
                      <h3>Уведомления</h3>
                      {unreadCount > 0 && <span className="dropdown-unread-badge">{unreadCount} новых</span>}
                    </div>
                    
                    <div className="dropdown-list">
                      {notifications.length === 0 ? (
                        <div className="dropdown-empty">
                          <span>🔔</span>
                          <p>Нет уведомлений</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`dropdown-item ${!notification.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className={`dropdown-item-icon ${getCategoryClass(notification.category)}`}>
                              {getCategoryIcon(notification.category)}
                            </div>
                            <div className="dropdown-item-content">
                              <div className="dropdown-item-title">{notification.title}</div>
                              <div className="dropdown-item-message">{notification.message}</div>
                              <div className="dropdown-item-time">{notification.timestamp}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="dropdown-footer">
                      <button className="dropdown-view-all" onClick={handleViewAll}>
                        Все уведомления →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="vertical-line" />
            <div className="user-profile">
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-post">Разработчик</div>
              </div>
              <div className="user-avatar"><i className="fa fa-user-circle" /></div>
            </div>
          </div>
        </div>
        <div className="header-bottom-line" />
      </header>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
};

export default Header;