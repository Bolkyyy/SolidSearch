import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UploadModal from "./UploadModel";

interface UserState {
  user?: {
    full_name?: string;
  };
}

const Header = () => {
  const [userName, setUserName] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as UserState;
    const stateUser = state?.user?.full_name;
    const storedName = localStorage.getItem("userFullName");
    setUserName(stateUser || storedName || "Пользователь");
  }, [location.state]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !searchQuery.trim()) return;
    const userId = localStorage.getItem("userId");
    navigate("/search/results", {
      state: { query: searchQuery.trim(), userId: Number(userId) },
    });
    setSearchQuery("");
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className="user-section">
            <div className="header-action-icons">
              <div
                className="action-btn green-text cursor-pointer"
                onClick={() => setIsUploadOpen(true)}
                title="Загрузить документы"
              >
                <i className="fa fa-upload" />
              </div>
              <div className="action-btn">
                <i className="fa fa-bell" />
              </div>
            </div>
            <div className="vertical-line" />
            <div className="user-profile">
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-post">Разработчик</div>
              </div>
              <div className="user-avatar">
                <i className="fa fa-user-circle" />
              </div>
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
