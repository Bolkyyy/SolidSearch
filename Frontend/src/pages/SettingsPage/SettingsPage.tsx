import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { aiApi, type AiSettings } from "../../api/AI_api";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);

  // --- AI Settings state ---
  const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [formProvider, setFormProvider] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formIsActive, setFormIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "integrations") fetchSettings();
  }, [activeTab]);

  async function fetchSettings() {
    setLoadingSettings(true);
    try {
      const data = await aiApi.getAiSettings();
      if (data?.length > 0) setAiSettings(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSettings(false);
    }
  }

  function openModal(mode: "add" | "edit") {
    setSaveError(null);
    if (mode === "edit" && aiSettings) {
      setFormProvider(aiSettings.provider_code || "");
      setFormModel(aiSettings.model_name || "");
      setFormApiKey("");
      setFormIsActive(aiSettings.is_active || false);
    } else {
      setFormProvider("");
      setFormModel("");
      setFormApiKey("");
      setFormIsActive(false);
    }
    setModalMode(mode);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const dto = {
        provider_code: formProvider,
        model_name: formModel,
        is_active: formIsActive,
        ...(formApiKey ? { api_key: formApiKey } : {}),
      };

      if (modalMode === "add") {
        await aiApi.createAiSettings(dto);
      } else {
        await aiApi.saveAiSettings(dto);
      }

      await fetchSettings();
      setModalMode(null);
    } catch (e: any) {
      setSaveError(e.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }
  // --- конец AI Settings ---

  return (
    <Layout>
      <section className="welcome">
        <h1>Настройки</h1>
        <p className="welcome-link">
          Управление пользователями, источниками и конфигурацией системы
        </p>
      </section>
      <div className="settings-container">
        <div className="settings-card-panel">
          <div className="settings-tabs-nav">
            {[
              { id: "users", icon: "fa-users", label: "Пользователи и роли" },
              { id: "sources", icon: "fa-database", label: "Источники" },
              { id: "rules", icon: "fa-cog", label: "Правила индексации" },
              { id: "integrations", icon: "fa-plug", label: "Интеграции" },
              { id: "interface", icon: "fa-desktop", label: "Интерфейс" },
            ].map((tab) => (
              <div
                key={tab.id}
                className={`settings-tab-link ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`fa ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-divider-settings" />

          {activeTab === "users" && (
            <div className="settings-view-fade">
              <div className="view-header-row">
                <h2>Управление пользователями</h2>
                <button className="create-collection-btn">
                  + Создать пользователя
                </button>
              </div>
              <table className="users-data-table">
                <thead>
                  <tr>
                    <th style={{ width: "25%" }}>Имя</th>
                    <th style={{ width: "25%" }}>Email</th>
                    <th style={{ width: "20%" }}>Роль</th>
                    <th style={{ width: "15%" }}>Статус</th>
                    <th style={{ width: "15%" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Иван Петров</td>
                    <td className="text-muted">ivan@company.ru</td>
                    <td>Администратор</td>
                    <td>
                      <span className="badge-status success">Активен</span>
                    </td>
                    <td className="table-actions">
                      <i className="fa fa-edit"></i>
                      <i className="fa fa-trash-alt"></i>
                    </td>
                  </tr>
                  <tr>
                    <td>Мария Сидорова</td>
                    <td className="text-muted">maria@company.ru</td>
                    <td>Пользователь</td>
                    <td>
                      <span className="badge-status success">Активен</span>
                    </td>
                    <td className="table-actions">
                      <i className="fa fa-edit"></i>
                      <i className="fa fa-trash-alt"></i>
                    </td>
                  </tr>
                  <tr>
                    <td>Ольга Иванова</td>
                    <td className="text-muted">olga@company.ru</td>
                    <td>Читатель</td>
                    <td>
                      <span className="badge-status danger">Неактивен</span>
                    </td>
                    <td className="table-actions">
                      <i className="fa fa-edit"></i>
                      <i className="fa fa-trash-alt"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "sources" && (
            <div className="settings-view-fade">
              <div className="view-header-row">
                <h2>Источники данных</h2>
                <button className="create-collection-btn">
                  + Добавить источник
                </button>
              </div>
              <div className="source-data-card">
                <div className="source-card-body">
                  <div className="source-title-row">
                    <h3>Основной архив</h3>
                    <span className="badge-status success">Подключен</span>
                    <div className="redact-delete-buttons">
                      <button className="redact-collection-btn">
                        Редактировать
                      </button>
                      <button className="delete-collection-btn">Удалить</button>
                    </div>
                  </div>
                  <p className="source-meta">Тип: Локальное хранилище</p>
                  <p className="source-path">
                    Путь: <code>/mnt/archive</code>
                  </p>
                </div>
              </div>
              <div className="source-data-card">
                <div className="source-card-body">
                  <div className="source-title-row">
                    <h3>Сетевое хранилище</h3>
                    <span className="badge-status danger">Ошибка</span>
                    <div className="redact-delete-buttons">
                      <button className="redact-collection-btn">
                        Редактировать
                      </button>
                      <button className="delete-collection-btn">Удалить</button>
                    </div>
                  </div>
                  <p className="source-meta">Тип: SMB</p>
                  <p className="source-path">
                    Путь: <code>\\server\docs</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="settings-view-fade">
              <h2>Правила индексации</h2>
              <div className="indexing-block">
                <label className="block-title">Размер чанка (токены)</label>
                <div className="input-group-custom">
                  <input type="text" className="dark-field-input" placeholder="512" />
                  <p className="field-hint">Оптимальный размер: 512-1024 токенов</p>
                </div>
              </div>
              <div className="indexing-block">
                <label className="block-title">Overlap между чанками (токены)</label>
                <div className="input-group-custom">
                  <input type="text" className="dark-field-input" placeholder="128" />
                  <p className="field-hint">Рекомендуется: 10-20% от размера чанка</p>
                </div>
              </div>
              <button className="create-collection-btn">
                <i className="fa fa-save"></i> Сохранить настройки
              </button>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className={`settings-view-fade ${modalMode ? "blur-content" : ""}`}>
              <div className="view-header-row">
                <h2>Интеграции</h2>
                <button className="add-model-btn-y" onClick={() => openModal("add")}>
                  Добавить модель
                </button>
              </div>

              {loadingSettings ? (
                <p style={{ color: "#888" }}>Загрузка...</p>
              ) : aiSettings ? (
                <div className="integrations-grid-layout">
                  <div className="integration-card-large">
                    <div className="integration-card-header">
                      <h3>{aiSettings.provider_code}</h3>
                    </div>
                    <p className="integration-card-desc">
                      Модель: <strong>{aiSettings.model_name}</strong>
                    </p>
                    <div className="integration-card-actions">
                      <span className={aiSettings.is_active ? "badge-status-success" : "badge-status-danger"}>
                        {aiSettings.is_active ? "Подключено" : "Неактивно"}
                      </span>
                      <button className="redact-btn-y" onClick={() => openModal("edit")}>
                        Редактировать
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: "#888" }}>Настройки не найдены</p>
              )}
            </div>
          )}

          {activeTab === "interface" && (
            <div className="settings-view-fade">
              <h2>Интерфейс</h2>
              <div className="interface-block">
                <label className="block-title">Тема</label>
                <div className="ui-toggle active">
                  <div className="ui-toggle-thumb"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalMode && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "add"
                  ? "Добавление новой модели"
                  : "Настройка конфигурации модели"}
              </h2>
              <button className="modal-close" onClick={() => setModalMode(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="input-group-custom" style={{ marginBottom: "16px" }}>
                <label className="block-title">Код провайдера</label>
                <input
                  type="text"
                  className="dark-field-input"
                  placeholder="Deepseek"
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                />
              </div>

              <div className="input-group-custom" style={{ marginBottom: "16px" }}>
                <label className="block-title">Название модели</label>
                <input
                  type="text"
                  className="dark-field-input"
                  placeholder="Введите название"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                />
              </div>

              <div className="input-group-custom" style={{ marginBottom: "16px" }}>
                <label className="block-title">Api ключ</label>
                <input
                  type="password"
                  className="dark-field-input"
                  placeholder={modalMode === "edit" ? "Оставьте пустым, чтобы не менять" : "sk-..."}
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                />
              </div>

              <div className="input-group-custom">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    className={`ui-toggle ${formIsActive ? "active" : ""}`}
                    onClick={() => setFormIsActive(!formIsActive)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="ui-toggle-thumb"></div>
                  </div>
                  <span style={{ color: "#888", fontSize: "12px" }}>
                    Активировать сразу
                  </span>
                </div>
              </div>

              {saveError && (
                <p style={{ color: "red", marginTop: "12px", fontSize: "13px" }}>
                  {saveError}
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="save-settings-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Сохранение..."
                  : modalMode === "add"
                  ? "Добавить модель"
                  : "Сохранить изменения"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SettingsPage;