import { useEffect } from "react";

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const ErrorModal = ({
  isOpen,
  title = "Произошла ошибка",
  message,
  onClose,
}: ErrorModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
      >
        <div className="confirm-icon-wrap error-modal-icon">
          <i className="fa fa-times-circle" />
        </div>

        <h3 className="confirm-title" id="error-modal-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button className="confirm-btn confirm-btn-default" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
