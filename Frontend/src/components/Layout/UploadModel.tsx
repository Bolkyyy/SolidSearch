import { useState, useRef, useCallback } from "react";
import axios from "axios";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FileStatus = "pending" | "uploading" | "success" | "error";

interface UploadFile {
  file: File;
  status: FileStatus;
  error?: string;
}

const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) =>
      f.name.match(/\.(pdf|docx|txt|xlsx)$/i)
    );
    const mapped: UploadFile[] = arr.map((f) => ({ file: f, status: "pending" }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadAll = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", files[i].file);

        const uploadRes = await axios.post("http://localhost:3001/documents/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const documentId = uploadRes.data?.document?.id;

        if (documentId) {
          await axios.post(`http://localhost:3001/documents/${documentId}/extract-text`);
        }

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "success" } : f))
        );
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "Ошибка при загрузке файла";
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: message } : f
          )
        );
      }
    }
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  const getExt = (name: string) => name.split(".").pop()?.toUpperCase() ?? "FILE";

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  const extColor: Record<string, string> = {
    PDF: "#ef4444",
    DOCX: "#3b82f6",
    TXT: "#a0a0a0",
    XLSX: "#10b981",
  };

  const hasAnyPending = files.some((f) => f.status === "pending");
  const allDone =
    files.length > 0 &&
    files.every((f) => f.status === "success" || f.status === "error");
  const successCount = files.filter((f) => f.status === "success").length;

  if (!isOpen) return null;

  return (
    <div className="um-overlay" onClick={handleClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="um-header">
          <div className="um-title">
            <i className="fa fa-upload" />
            <span>Загрузка документов</span>
          </div>
          <button className="um-close" onClick={handleClose}>
            <i className="fa fa-times" />
          </button>
        </div>

        {/* Dropzone */}
        <div
          className={`um-dropzone${isDragging ? " um-dragging" : ""}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.xlsx"
            className="hidden-input"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <div className="um-dropzone-icon">
            <i className="fa fa-cloud-upload" />
          </div>
          <p className="um-dropzone-text">
            Перетащите файлы сюда или <span className="um-link">нажмите для выбора</span>
          </p>
          <p className="um-dropzone-hint">PDF, DOCX, TXT, XLSX</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="um-file-list">
            {files.map((uf, idx) => {
              const ext = getExt(uf.file.name);
              return (
                <div key={idx} className={`um-file-item um-file-${uf.status}`}>
                  <div
                    className="um-file-ext"
                    style={{ background: extColor[ext] ?? "#555" }}
                  >
                    {ext}
                  </div>
                  <div className="um-file-info">
                    <div className="um-file-name">{uf.file.name}</div>
                    <div className="um-file-size">{formatSize(uf.file.size)}</div>
                    {uf.status === "error" && (
                      <div className="um-file-err">{uf.error}</div>
                    )}
                  </div>
                  <div className="um-file-action">
                    {uf.status === "pending" && (
                      <button className="um-remove-btn" onClick={() => removeFile(idx)}>
                        <i className="fa fa-times" />
                      </button>
                    )}
                    {uf.status === "uploading" && (
                      <i className="fa fa-spinner fa-spin um-spin" />
                    )}
                    {uf.status === "success" && (
                      <i className="fa fa-check-circle um-icon-success" />
                    )}
                    {uf.status === "error" && (
                      <i className="fa fa-exclamation-circle um-icon-error" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Success banner */}
        {allDone && successCount > 0 && (
          <div className="um-success-banner">
            <i className="fa fa-check-circle" />
            <span>
              {successCount} {successCount === 1 ? "файл загружен" : "файла загружено"} и добавлен в очередь индексации
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="um-footer">
          <button className="um-btn-cancel" onClick={handleClose}>
            {allDone ? "Закрыть" : "Отмена"}
          </button>
          {hasAnyPending && (
            <button className="um-btn-submit" onClick={uploadAll}>
              <i className="fa fa-upload" />
              Загрузить {files.filter((f) => f.status === "pending").length} файл(а)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default UploadModal;