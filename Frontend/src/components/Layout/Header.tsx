import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import UploadModal from "./UploadModel";
import { useNotifications } from "../../context/NotificationsContext";
import { Notification } from "../../api/notifications";
import { session } from "../../utils/session";

interface UserState {
  user?: { full_name?: string };
}

const categoryIcon = (category: string) => {
  switch (category) {
    case "success":
      return <i className="fa fa-check-circle" />;
    case "warning":
      return <i className="fa fa-exclamation-triangle" />;
    case "system":
      return <i className="fa fa-cog" />;
    default:
      return <i className="fa fa-info-circle" />;
  }
};

const Header = () => {
  const [userName, setUserName] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [remembered, setRemembered] = useState(() => !!localStorage.getItem("userId"));
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [quickSearch, setQuickSearch] = useState("");

  const handleQuickSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && quickSearch.trim()) {
      const userId = Number(session.getUserId() ?? 0);
      navigate("/search/results", {
        state: { query: quickSearch.trim(), userId, filters: {} },
      });
      setQuickSearch("");
    }
  };

  useEffect(() => {
    const state = location.state as UserState;
    const storedName = session.getFullName();
    setUserName(state?.user?.full_name || storedName || "Пользователь");
  }, [location.state]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsDropdownOpen(false);
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isDropdownOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
    };
    if (isProfileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isProfileOpen]);

  const toggleRemember = () => {
    const uid = Number(session.getUserId());
    const name = session.getFullName() ?? "";
    const next = !remembered;
    session.save(uid, name, next);
    setRemembered(next);
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) markAsRead(n.id);
  };

  return (
    <>
      <header className="header">
        <div className="header-top-row">
          <div className="search-wrapper">
            <i className="fa fa-search" />
            <input
              type="text"
              className="search-bar"
              placeholder="Быстрый поиск..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={handleQuickSearch}
            />
          </div>

          <div className="user-section">
            <div className="header-action-icons">
              <div
                className="action-btn green-text"
                onClick={() => setIsUploadOpen(true)}
                title="Загрузить документы"
                style={{ cursor: "pointer" }}
              >
                <i className="fa fa-upload" />
              </div>

              <div className="notification-wrapper" ref={dropdownRef}>
                <div
                  className="action-btn notification-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  title="Уведомления"
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <i className="fa fa-bell" />
                  {unreadCount > 0 && (
                    <span className="notification-badge-header">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="notification-dropdown">
                    <div className="dropdown-header">
                      <h3>Уведомления</h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {unreadCount > 0 && (
                          <span className="dropdown-unread-badge">
                            {unreadCount} новых
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <button
                            className="dropdown-mark-all-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAllAsRead();
                            }}
                          >
                            <i
                              className="fa fa-check-double"
                              style={{ marginRight: 4 }}
                            />
                            Все прочитано
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="dropdown-list">
                      {notifications.length === 0 ? (
                        <div className="dropdown-empty">
                          <span>
                            <i
                              className="fa fa-bell-slash"
                              style={{ fontSize: 32, opacity: 0.4 }}
                            />
                          </span>
                          <p>Нет уведомлений</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`dropdown-item ${!n.is_read ? "unread" : ""}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <div className={`dropdown-item-icon ${n.category}`}>
                              {categoryIcon(n.category)}
                            </div>
                            <div className="dropdown-item-content">
                              <div className="dropdown-item-title">
                                {n.title}
                              </div>
                              <div className="dropdown-item-message">
                                {n.message}
                              </div>
                              <div className="dropdown-item-time">
                                {new Date(n.created_at).toLocaleString(
                                  "ru-RU",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="dropdown-footer">
                      <button
                        className="dropdown-view-all"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        <i className="fa fa-list" style={{ marginRight: 6 }} />
                        Все уведомления
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="vertical-line" />
            <div className="user-profile" ref={profileRef}>
              <div className="user-info" onClick={() => setIsProfileOpen(v => !v)} style={{ cursor: "pointer" }}>
                <div className="user-name">{userName}</div>
                <div className="user-post">Разработчик</div>
              </div>
              <div className="user-avatar" onClick={() => setIsProfileOpen(v => !v)} style={{ cursor: "pointer" }}>
                <i className="fa fa-user-circle" />
              </div>
              {isProfileOpen && (
                <div className="profile-dropdown">
                  <label className="profile-dropdown-item">
                    <input
                      type="checkbox"
                      checked={remembered}
                      onChange={toggleRemember}
                    />
                    Запомнить меня
                  </label>
                </div>
              )}
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
