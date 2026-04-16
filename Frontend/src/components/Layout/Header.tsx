import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface UserState {
  user?: {
    full_name?: string;
  };
}

const Header = () => {
  const [userName, setUserName] = useState('');
  const location = useLocation();

  useEffect(() => {
    const state = location.state as UserState;
    const stateUser = state?.user?.full_name;
    const storedName = localStorage.getItem('userFullName');
    setUserName(stateUser || storedName || 'Пользователь');
  }, [location.state]);

  return (
    <header className="header">
      <div className="header-top-row">
        <div className="search-wrapper">
          <i className="fa fa-search" />
          <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
        </div>

        <div className="user-section">
          <div className="header-action-icons">
            <div className="action-btn green-text"><i className="fa fa-upload" /></div>
            <div className="action-btn"><i className="fa fa-bell" /></div>
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
  );
};

export default Header;