import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/images/BlackLogo.svg";

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src={logo} className="logo-img" alt="logo" />
        <span className="logo-text">AI-поиск по документам</span>
      </div>

      <Link
        to="/home"
        className={`nav-link ${path === "/home" ? "active" : ""}`}
      >
        <div>
          <i className="fa fa-home" /> Главная
        </div>
      </Link>
      <Link
        to="/search"
        className={`nav-link ${path === "/search" ? "active" : ""}`}
      >
        <div>
          <i className="fa fa-search" /> Поиск
        </div>
      </Link>
      <Link
        to="/archive"
        className={`nav-link ${path === "/archive" ? "active" : ""}`}
      >
        <div>
          <i className="fa fa-folder-open" /> Архив документов
        </div>
      </Link>
      <Link
        to="/history"
        className={`nav-link ${path === "/history" ? "active" : ""}`}
      >
        <div>
          <i className="fa fa-history" /> История запросов
        </div>
      </Link>
      <Link
        to="/analytics"
        className={`nav-link ${path === "/analytics" ? "active" : ""}`}
      >
        <div>
          <i className="fa fa-line-chart" /> Аналитика
        </div>
      </Link>
      <Link
        to="/indexing"
        className={`nav-link ${path === "/indexing" ? "active" : ""}`}
      >
        <div>
          <i className="fa fa-database" /> Индексация
        </div>
      </Link>

      <div className="sidebar-divider" />
      <Link
        to="/settings"
        className={`nav-link ${path === "/settings" ? "active" : ""}`}
      >
        <div>
          <i className="fa fa-cog" /> Настройки
        </div>
      </Link>

      <div className="logout">
        <Link to="/login" className="exit">
          <i className="fa fa-sign-out" /> Выход
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
