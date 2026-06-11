import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import UploadModal from './UploadModel';

interface UserState {
  user?: {
    full_name?: string;
  };
}

const Header = () => {
  const [userName, setUserName] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as UserState;
    const stateUser = state?.user?.full_name;
    const storedName = localStorage.getItem('userFullName');
    setUserName(stateUser || storedName || 'Пользователь');
  }, [location.state]);

  // Загрузка количества непрочитанных уведомлений
  useEffect(() => {
    const loadUnreadCount = () => {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        try {
          const notifications = JSON.parse(saved);
          const count = notifications.filter((n: any) => !n.isRead).length;
          setUnreadCount(count);
        } catch (e) {
          console.error('Ошибка загрузки', e);
        }
      } else {
        setUnreadCount(4);
      }
    };
    
    loadUnreadCount();
    
    // Слушаем изменения в localStorage
    window.addEventListener('storage', loadUnreadCount);
    return () => window.removeEventListener('storage', loadUnreadCount);
  }, []);

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
              
              {/* КНОПКА УВЕДОМЛЕНИЙ */}
              <div 
                className="action-btn notification-btn"
                onClick={() => navigate('/notifications')}
                title="Уведомления"
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <i className="fa fa-bell" />
                {unreadCount > 0 && (
                  <span className="notification-badge-header">{unreadCount > 99 ? '99+' : unreadCount}</span>
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