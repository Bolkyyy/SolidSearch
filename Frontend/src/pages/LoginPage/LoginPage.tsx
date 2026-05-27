import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/BlackLogo.svg";
import { authApi, LoginCredentials } from "../../api/auth";

interface Errors {
  email?: string;
  password?: string;
  server?: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
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

      if (userData?.full_name) {
        localStorage.setItem("userFullName", userData.full_name);
      }

      localStorage.setItem("userId", String(userData.id));

      console.log("userId сохранён:", userData.id);
      
      navigate("/home", { state: { user: userData } });
    } catch (error: any) {
      console.error("Ошибка при логине:", error);
      setErrors({
        server:
          error.response?.data?.message ||
          "Ошибка авторизации. Проверьте данные.",
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
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
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
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {errors.server && <div className="server-error">{errors.server}</div>}

          <div className="options">
            <label className="checkbox-label">
              <input type="checkbox" /> Запомнить меня
            </label>
            <a href="#" className="forgot-link">
              Забыли пароль?
            </a>
          </div>

          <button type="submit" className="login-btn">
            Войти в систему
          </button>
        </form>

        <hr className="divider" />

        <div className="demo-box">
          <strong>Демо-доступ</strong>
          <p></p>
          <span>Email: 1@mail.ru</span>
          <br />
          <span>Пароль: 1234567</span>
        </div>

        <hr className="divider" />
        <p className="footer">© 2026 SolidSearch. Все права защищены.</p>
      </div>
    </div>
  );
};

export default LoginPage;
