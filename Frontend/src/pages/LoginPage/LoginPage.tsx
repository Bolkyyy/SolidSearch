import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/BlackLogo.svg";
import { authApi, LoginCredentials } from "../../api/auth";
import { session } from "../../utils/session";

interface Errors {
  email?: string;
  password?: string;
  server?: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!email) {
      newErrors.email = "Введите Email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Некорректный формат почты";
    }
    if (!password) {
      newErrors.password = "Введите пароль";
    } else if (password.length < 7) {
      newErrors.password = "Пароль должен содержать не менее 7 символов";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const credentials: LoginCredentials = { email, password };
      const userData = await authApi.login(credentials);
      session.save(userData.id, userData.full_name ?? "", rememberMe);
      navigate("/home", { state: { user: userData } });
    } catch (error: any) {
      setErrors({
        server: error.response?.data?.message || "Ошибка авторизации. Проверьте данные.",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="overlay"></div>
        <div className="theme-toggle">
          <div className="toggle-circle"></div>
        </div>

        <img className="logo" src={logo} alt="SolidSearch Logo" />
        <p className="subtitle">
          AI-powered система поиска и аналитики документов
        </p>

        <h2 className="login-title">Вход в систему</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              placeholder="example@company.com"
              className={`input-field ${errors.email ? "input-error" : ""}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Пароль</label>
            <input
              type="password"
              placeholder="*************"
              className={`input-field ${errors.password ? "input-error" : ""}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.server && <div className="server-error">{errors.server}</div>}

          <div className="options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Запомнить меня
            </label>
            <button
              type="button"
              className="forgot-link"
              onClick={() => setShowForgot(true)}
            >
              Забыли пароль?
            </button>
          </div>

          <button type="submit" className="login-btn">
            Войти в систему
          </button>
        </form>

        <hr className="divider" />

        <div className="demo-box">
          <strong>Демо-доступ</strong>
          <p></p>
          <span>Email: demo1@company.ru</span>
          <br />
          <span>Пароль: demo123</span>
        </div>

        <hr className="divider" />
        <p className="footer">© 2026 SolidSearch. Все права защищены.</p>
      </div>

      {showForgot && (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Сброс пароля</h2>
              <button className="modal-close" onClick={() => setShowForgot(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6 }}>
                Самостоятельный сброс пароля недоступен.
              </p>
              <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
                Обратитесь к администратору системы — он сможет сбросить пароль через раздел
                <strong style={{ color: "#e0e0e0" }}> Настройки → Пользователи</strong>.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-create" onClick={() => setShowForgot(false)}>
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
