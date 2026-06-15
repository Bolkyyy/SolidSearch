import { useState, useRef, useCallback, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import { Document, documentsApi } from "../../api/documentsApi";
import { session } from "../../utils/session";

const getUserId = (): number => Number(session.getUserId() || "0");
const getHiddenKey = () => `indexing_hidden_ids_${getUserId()}`;
const getPausedKey = () => `indexing_paused_${getUserId()}`;

type LocalStatus = "pending" | "uploading" | "success" | "error";

interface LocalFile {
  id: string;
  file: File;
  status: LocalStatus;
  error?: string;
}

const ALLOWED =
  /\.(pdf|docx|doc|txt|xlsx|xls|ods|pptx|ppt|rtf|md|markdown|csv|png|jpg|jpeg|tiff|tif|webp)$/i;

const parseServerDate = (s: string): Date => {
  if (!s) return new Date(0);
  let n = s.trim().replace(" ", "T");
  n = n.replace(/(\.\d{3})\d+/, "$1");
  if (!/[Zz]$|[+-]\d{2}:?\d{2}$/.test(n)) n += "Z";
  const d = new Date(n);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

const fmtTime = (s: string): string => {
  const d = parseServerDate(s);
  const msk = new Date(d.getTime() + 6 * 60 * 60 * 1000);
  const hh = String(msk.getUTCHours()).padStart(2, "0");
  const mm = String(msk.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/** Процент готовности на основе extraction_status файла */
const getProgress = (docStatus: string, extractionStatus?: string): number => {
  if (docStatus === "processed") return 100;
  if (docStatus === "extraction_failed") return 0;
  switch (extractionStatus) {
    case "text_extracted":
      return 60;
    case "processed":
      return 95;
    case "empty":
      return 100;
    default:
      return 15;
  }
};

const getStepLabel = (extractionStatus?: string): string => {
  switch (extractionStatus) {
    case "text_extracted":
      return "AI обработка";
    case "processed":
      return "Завершение";
    case "empty":
      return "Текст не найден";
    default:
      return "Извлечение текста";
  }
};

const getStatusClass = (s: string) => {
  if (s === "processing") return "queue-item-processing";
  if (s === "processed") return "queue-item-completed";
  if (s === "extraction_failed") return "queue-item-error";
  return "queue-item-waiting";
};

const getStatusIconColor = (s: string) => {
  if (s === "processing") return "purple";
  if (s === "processed") return "green";
  if (s === "extraction_failed") return "red";
  return "orange";
};

const getStatusText = (s: string) => {
  if (s === "processing") return "Обрабатывается";
  if (s === "processed") return "Проиндексирован";
  if (s === "extraction_failed") return "Ошибка";
  return "В очереди";
};

const getStatusTagClass = (s: string) => {
  if (s === "processing") return "status-text";
  if (s === "processed") return "status-tag green";
  if (s === "extraction_failed") return "status-tag red";
  return "status-tag orange";
};

const loadHiddenIds = (): Set<number> => {
  try {
    const raw = localStorage.getItem(getHiddenKey());
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
};

const saveHiddenIds = (ids: Set<number>) => {
  try {
    localStorage.setItem(getHiddenKey(), JSON.stringify([...ids]));
  } catch {}
};

const IndexingPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(
    () => localStorage.getItem(getPausedKey()) === "true",
  );
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(loadHiddenIds);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPausedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    isPausedRef.current = isPaused;
    localStorage.setItem(getPausedKey(), String(isPaused));
  }, [isPaused]);

  useEffect(() => {
    saveHiddenIds(hiddenIds);
  }, [hiddenIds]);

  const fetchDocuments = useCallback(async () => {
    try {
      const uid = getUserId();
      const data = await documentsApi.getAll(uid || undefined);
      setDocuments(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    pollRef.current = setInterval(() => {
      if (!isPausedRef.current) fetchDocuments();
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchDocuments]);

  const uploadOne = async (localId: string, file: File) => {
    if (isPausedRef.current) return;
    const controller = new AbortController();
    abortControllers.current.set(localId, controller);
    setLocalFiles((p) =>
      p.map((f) =>
        f.id === localId ? { ...f, status: "uploading" as LocalStatus } : f,
      ),
    );
    try {
      const uid = getUserId();
      await documentsApi.upload(file, uid || undefined, controller.signal);
      abortControllers.current.delete(localId);
      setLocalFiles((p) =>
        p.map((f) =>
          f.id === localId ? { ...f, status: "success" as LocalStatus } : f,
        ),
      );
      fetchDocuments();
    } catch (err: any) {
      abortControllers.current.delete(localId);
      if (axios.isCancel(err) || err?.name === "CanceledError") {
        setLocalFiles((p) => p.filter((f) => f.id !== localId));
        return;
      }
      const msg = err?.response?.data?.message || "Ошибка загрузки";
      setLocalFiles((p) =>
        p.map((f) =>
          f.id === localId
            ? { ...f, status: "error" as LocalStatus, error: msg }
            : f,
        ),
      );
    }
  };

  const cancelLocalFile = (localId: string) => {
    const controller = abortControllers.current.get(localId);
    if (controller) {
      controller.abort();
    } else {
      setLocalFiles((p) => p.filter((f) => f.id !== localId));
    }
  };

  const addFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => ALLOWED.test(f.name));
    if (!valid.length) return;
    const batch: LocalFile[] = valid.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      status: "pending" as LocalStatus,
    }));
    setLocalFiles((p) => [...p, ...batch]);
    batch.forEach((lf) => uploadOne(lf.id, lf.file));
  };

  const deleteDoc = async (id: number) => {
    setDeletingIds((p) => new Set([...p, id]));
    try {
      await documentsApi.delete(id);
      setDocuments((p) => p.filter((d) => d.id !== id));
      setHiddenIds((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
    } catch {
      setDeletingIds((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
    }
  };

  const clearCompleted = () => {
    const ids = documents
      .filter((d) => d.status === "processed")
      .map((d) => d.id);
    setHiddenIds((prev) => {
      const next = new Set([...prev, ...ids]);
      saveHiddenIds(next);
      return next;
    });
    setLocalFiles((p) => p.filter((f) => f.status !== "success"));
  };

  const visibleDocs = documents.filter((d) => !hiddenIds.has(d.id));
  const activeLocalFiles = localFiles.filter((f) => f.status !== "success");

  const clearAll = () => {
    const ids = visibleDocs.map((d) => d.id);
    setHiddenIds((prev) => {
      const next = new Set([...prev, ...ids]);
      saveHiddenIds(next);
      return next;
    });
    setLocalFiles([]);
  };

  const inQueue = localFiles.filter(
    (f) => f.status === "pending" || f.status === "uploading",
  ).length;
  const processing = visibleDocs.filter(
    (d) => d.status === "processing",
  ).length;
  const indexed = visibleDocs.filter((d) => d.status === "processed").length;
  const failed = visibleDocs.filter(
    (d) => d.status === "extraction_failed",
  ).length;

  const isEmpty =
    !loading && visibleDocs.length === 0 && activeLocalFiles.length === 0;

  return (
    <Layout>
      <section className="welcome">
        <h1>Управление индексацией</h1>
        <p className="welcome-link">Загрузка и индексация новых документов</p>
      </section>

      <div className="indexing-stats-grid">
        <div className="stat-card-indexing">
          <i className="fa fa-clock card-icon orange" />
          <p>В очереди</p>
          <h2>{inQueue}</h2>
          <span className="trend-up-request">загружается</span>
        </div>
        <div className="stat-card-indexing">
          <i className="fa fa-play-circle card-icon purple" />
          <p>Обрабатывается</p>
          <h2>{processing}</h2>
          <span className="trend-up">активно</span>
        </div>
        <div className="stat-card-indexing">
          <i className="fa fa-check-circle card-icon green" />
          <p>Проиндексировано</p>
          <h2>{indexed}</h2>
          <span className="trend-up-index">завершено</span>
        </div>
        <div className="stat-card-indexing">
          <i className="fa fa-exclamation-circle card-icon red" />
          <p>Ошибки</p>
          <h2>{failed}</h2>
          <span className="trend-down">ошибок</span>
        </div>
      </div>

      <div
        className={`upload-dropzone${isDragging ? " upload-dropzone-active" : ""}`}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.ods,.pptx,.ppt,.rtf,.md,.markdown,.csv,.png,.jpg,.jpeg,.tiff,.tif,.webp"
          className="file-input-hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="upload-icon-circle">
          <i className="fa fa-upload" />
        </div>
        <h3>Загрузите документы для индексации</h3>
        <p>Перетащите файлы сюда или нажмите для выбора</p>
        <div className="upload-buttons">
          <button
            className="btn-upload-file"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Выбрать файлы
          </button>
        </div>
        <span className="upload-hint">
          PDF, DOCX, XLSX, PPTX, TXT, CSV, RTF, MD, PNG, JPG и другие
        </span>
      </div>

      <div className="indexing-queue-container">
        <div className="queue-header">
          <h3>
            Очередь индексации
            {isPaused && (
              <span className="queue-paused-label">— приостановлено</span>
            )}
          </h3>
          <div className="queue-actions">
            <button
              className={`btn-action ${isPaused ? "green" : "orange"}`}
              onClick={() => setIsPaused((p) => !p)}
            >
              <i className={`fa fa-${isPaused ? "play" : "pause"}`} />{" "}
              {isPaused ? "Возобновить" : "Приостановить все"}
            </button>
            <button className="btn-action red" onClick={clearCompleted}>
              <i className="fa fa-times" /> Очистить завершённые
            </button>
            <button className="btn-action red" onClick={clearAll}>
              <i className="fa fa-trash" /> Очистить все
            </button>
          </div>
        </div>

        <div className="queue-list">
          {/* Локальные файлы */}
          {activeLocalFiles.map((lf) => (
            <div
              key={lf.id}
              className={
                lf.status === "error"
                  ? "queue-item-error"
                  : "queue-item-processing"
              }
            >
              <div className="item-main">
                <div
                  className={`item-icon ${lf.status === "error" ? "red" : "purple"}`}
                >
                  {lf.status === "uploading" ? (
                    <i className="fa fa-spinner fa-spin" />
                  ) : lf.status === "error" ? (
                    <i className="fa fa-exclamation-circle" />
                  ) : (
                    <i className="fa fa-clock" />
                  )}
                </div>
                <div className="item-details">
                  <div className="item-title">{lf.file.name}</div>
                  <div className="item-meta">
                    <span
                      className={
                        lf.status === "error" ? "status-tag red" : "status-text"
                      }
                    >
                      {lf.status === "uploading"
                        ? "Загружается..."
                        : lf.status === "error"
                          ? "Ошибка загрузки"
                          : "Ожидание"}
                    </span>
                  </div>
                </div>
                <div className="item-status-right" />
                <button
                  className="iq-delete-btn"
                  title="Отменить"
                  onClick={() => cancelLocalFile(lf.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </div>
              {lf.status === "error" && (
                <div className="error-message-box">
                  <p>{lf.error}</p>
                  <button
                    className="retry-link"
                    onClick={() => uploadOne(lf.id, lf.file)}
                  >
                    Попробовать снова
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Документы из БД */}
          {!loading &&
            visibleDocs.map((doc) => {
              const extractionStatus = doc.files?.[0]?.extraction_status;
              const progress = getProgress(doc.status, extractionStatus);
              const isDeleting = deletingIds.has(doc.id);

              return (
                <div
                  key={doc.id}
                  className={`${getStatusClass(doc.status)}${isDeleting ? " queue-item--deleting" : ""}`}
                >
                  <div className="item-main">
                    <div
                      className={`item-icon ${getStatusIconColor(doc.status)}`}
                    >
                      {doc.status === "processing" && (
                        <i className="fa fa-spinner fa-spin" />
                      )}
                      {doc.status === "processed" && (
                        <i className="fa fa-check-circle" />
                      )}
                      {doc.status === "extraction_failed" && (
                        <i className="fa fa-exclamation-circle" />
                      )}
                    </div>

                    <div className="item-details">
                      <div className="item-title">
                        {doc.title ||
                          doc.files?.[0]?.file_name ||
                          `Документ #${doc.id}`}
                      </div>
                      <div className="item-meta">
                        {doc.document_type && (
                          <span className="item-doc-type">
                            {doc.document_type}
                          </span>
                        )}
                        <span className={getStatusTagClass(doc.status)}>
                          {doc.status === "processing"
                            ? getStepLabel(extractionStatus)
                            : getStatusText(doc.status)}
                        </span>
                      </div>
                    </div>

                    <div className="item-status-right">
                      {doc.status === "processing" ? (
                        <span className="iq-progress-label">{progress}%</span>
                      ) : doc.status === "processed" ? (
                        <>
                          <span className="item-done-label">Готово</span>
                          <span className="time-info">
                            {fmtTime(
                              doc.files?.[0]?.uploaded_at || doc.created_at,
                            )}
                          </span>
                        </>
                      ) : doc.status === "extraction_failed" ? (
                        <span className="item-error-label">Ошибка</span>
                      ) : null}
                    </div>

                    <button
                      className={
                        doc.status === "processing"
                          ? "iq-cancel-btn"
                          : "iq-delete-btn"
                      }
                      title={
                        doc.status === "processing"
                          ? "Отменить индексацию"
                          : "Удалить документ"
                      }
                      disabled={isDeleting}
                      onClick={() => deleteDoc(doc.id)}
                    >
                      {isDeleting ? (
                        <i className="fa fa-spinner fa-spin" />
                      ) : doc.status === "processing" ? (
                        <>
                          <i className="fa fa-times" /> Отменить
                        </>
                      ) : (
                        <i className="fa fa-trash" />
                      )}
                    </button>
                  </div>

                  {doc.status === "processing" && (
                    <div className="progress-container">
                      <div
                        className="progress-bar purple"
                        style={{ width: `${progress}%` }}
                      />
                      <span className="progress-percent purple">100%</span>
                    </div>
                  )}

                  {doc.status === "extraction_failed" && (
                    <div className="error-message-box">
                      <p>Не удалось обработать документ. Попробуйте снова</p>
                    </div>
                  )}
                </div>
              );
            })}

          {loading && (
            <div className="indexing-empty-state">
              <i className="fa fa-spinner fa-spin indexing-state-icon--sm" />
              <p>Загрузка...</p>
            </div>
          )}

          {isEmpty && (
            <div className="indexing-empty-state">
              <i className="fa fa-inbox indexing-state-icon" />
              <p>Нет документов в очереди</p>
              <p className="indexing-empty-hint">
                Загрузите файлы через форму выше
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IndexingPage;
