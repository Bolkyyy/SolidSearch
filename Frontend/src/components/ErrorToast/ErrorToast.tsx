import { useEffect, useState } from "react";

interface Props {
  message: string;
  onClose: () => void;
  duration?: number;
}

const ErrorToast = ({ message, onClose, duration = 6000 }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  return (
    <div className={`error-toast ${visible ? "error-toast-visible" : ""}`}>
      <div className="error-toast-icon">
        <i className="fa fa-exclamation-triangle" />
      </div>
      <div className="error-toast-body">
        <span className="error-toast-title">Ошибка подключения</span>
        <span className="error-toast-msg">{message}</span>
      </div>
      <button className="error-toast-close" onClick={() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }}>
        <i className="fa fa-times" />
      </button>
    </div>
  );
};

export default ErrorToast;
