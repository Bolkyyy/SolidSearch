import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className={`confirm-icon-wrap confirm-icon-${variant}`}>
          {variant === "danger" ? (
            <i className="fa fa-exclamation-triangle" />
          ) : (
            <i className="fa fa-question-circle" />
          )}
        </div>

        <h3 className="confirm-title" id="confirm-title">
          {title}
        </h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button
            className="confirm-btn confirm-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-btn confirm-btn-${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <i
                  className="fa fa-spinner fa-spin"
                  style={{ marginRight: "6px" }}
                />
                Выполняется...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
