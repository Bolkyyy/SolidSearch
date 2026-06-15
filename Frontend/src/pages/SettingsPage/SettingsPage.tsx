import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { aiApi, type AiSettings } from "../../api/AI_api";
import { User, usersApi } from "@/api/Users";
import { documentsApi } from "@/api/documentsApi";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);

  const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [formProvider, setFormProvider] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formIsActive, setFormIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [indexingConfig, setIndexingConfig] = useState({
    chunkSize: 6000,
    chunkMaxTokens: 1500,
    maxStoredChars: 300000,
    maxAiChars: 60000,
  });
  const [indexingSaving, setIndexingSaving] = useState(false);
  const [indexingSaveOk, setIndexingSaveOk] = useState(false);

  const [users, setUsers] = useState<User[] | null>(null);
  const [isVisibleModalCreateUser, setVisibleModalCreateUser] = useState(false);
  const [modalUserFullName, setModalUserFullName] = useState("");
  const [modalUserEmail, setModalUserEmail] = useState("");
  const [modalUserStatus, setModalUserStatus] = useState("");
  const [modalUserRole, setModalUserRole] = useState("");
  const [modalUserPassword, setModalUserPassword] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isVisibleModalEditUser, setVisibleModalEditUser] = useState(false);
  const [modalUserEditFullName, setModalUserEditFullName] = useState("");
  const [modalUserEditEmail, setModalUserEditEmail] = useState("");
  const [modalUserEditStatus, setModalUserEditStatus] = useState("");
  const [modalUserEditRole, setModalUserEditRole] = useState("");
  const [modalUserEditPassword, setModalUserEditPassword] = useState("");
  const [modalUserEditId, setModalUserEditId] = useState(0);

  async function handleCreateUser() {
    try {
      await usersApi.createUser({
        full_name: modalUserFullName,
        email: modalUserEmail,
        password: modalUserPassword,
        status: modalUserStatus,
        role: modalUserRole,
      });
      setVisibleModalCreateUser(false);
    } catch {}
  }

  function handleDeleteUser(userId: number, userName: string) {
    setDeleteTargetId(userId);
    setDeleteTargetName(userName);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (deleteTargetId === null) return;
    setDeleteLoading(true);
    try {
      await usersApi.deleteUser(deleteTargetId);
      await fetchUsers();
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetName("");
    }
  }

  async function handleEditUser(user: User) {
    setModalUserEditId(user.id);
    setModalUserEditFullName(user.full_name);
    setModalUserEditEmail(user.email);
    setModalUserEditStatus(user.status);
    setModalUserEditRole(user.role.code);
    setModalUserEditPassword("");
    setVisibleModalEditUser(true);
  }

  async function handleUpdateUser() {
    try {
      await usersApi.updateUser(modalUserEditId, {
        full_name: modalUserEditFullName,
        email: modalUserEditEmail,
        password: modalUserEditPassword,
        status: modalUserEditStatus,
        role: modalUserEditRole,
      });
      setVisibleModalEditUser(false);
      await fetchUsers();
    } catch {}
  }

  useEffect(() => {
    if (activeTab === "integrations") fetchSettings();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "rules") fetchIndexingConfig();
  }, [activeTab]);

  async function fetchIndexingConfig() {
    try {
      const config = await documentsApi.getIndexingConfig();
      setIndexingConfig(config);
    } catch {}
  }

  async function saveIndexingConfig() {
    setIndexingSaving(true);
    setIndexingSaveOk(false);
    try {
      const saved = await documentsApi.updateIndexingConfig(indexingConfig);
      setIndexingConfig(saved);
      setIndexingSaveOk(true);
      setTimeout(() => setIndexingSaveOk(false), 2500);
    } catch {
    } finally {
      setIndexingSaving(false);
    }
  }

  async function fetchUsers() {
    try {
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  }

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

  return (
    <>
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
                  <button
                    className="create-collection-btn"
                    onClick={() => setVisibleModalCreateUser(true)}
                  >
                    + Создать пользователя
                  </button>
                </div>
                <table className="users-data-table">
                  <thead>
                    <tr>
                      <th className="users-col-name">Имя</th>
                      <th className="users-col-email">Email</th>
                      <th className="users-col-role">Роль</th>
                      <th className="users-col-status">Статус</th>
                      <th className="users-col-actions">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users &&
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.full_name}</td>
                          <td className="text-muted">{user.email}</td>
                          <td>{user.role.name}</td>
                          <td>
                            <span
                              className={`badge-status ${user.status == "active" ? "success" : "danger"}`}
                            >
                              {user.status == "active"
                                ? "Активен"
                                : "Неактивен"}
                            </span>
                          </td>
                          <td className="table-actions">
                            <i
                              className="fa fa-edit"
                              onClick={() => handleEditUser(user)}
                            ></i>
                            <i
                              className="fa fa-trash-alt"
                              onClick={() =>
                                handleDeleteUser(user.id, user.full_name)
                              }
                            ></i>
                          </td>
                        </tr>
                      ))}
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
                        <button className="delete-collection-btn">
                          Удалить
                        </button>
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
                        <button className="delete-collection-btn">
                          Удалить
                        </button>
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
                  <label className="block-title">Размер чанка (символы)</label>
                  <div className="input-group-custom">
                    <input
                      type="number"
                      className="dark-field-input"
                      value={indexingConfig.chunkSize}
                      min={500}
                      onChange={(e) =>
                        setIndexingConfig((c) => ({
                          ...c,
                          chunkSize: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="field-hint">
                      Текст документа нарезается на части этого размера.{" "}
                      <span
                        style={{ fontSize: 10, color: "#555", marginLeft: 4 }}
                      >
                        по умолчанию: 6000
                      </span>
                    </p>
                  </div>
                </div>

                <div className="indexing-block">
                  <label className="block-title">
                    Макс. токенов ответа GPT на чанк
                  </label>
                  <div className="input-group-custom">
                    <input
                      type="number"
                      className="dark-field-input"
                      value={indexingConfig.chunkMaxTokens}
                      min={100}
                      onChange={(e) =>
                        setIndexingConfig((c) => ({
                          ...c,
                          chunkMaxTokens: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="field-hint">
                      Лимит токенов при форматировании каждого чанка.{" "}
                      <span
                        style={{ fontSize: 10, color: "#555", marginLeft: 4 }}
                      >
                        по умолчанию: 1500
                      </span>
                    </p>
                  </div>
                </div>

                <div className="indexing-block">
                  <label className="block-title">
                    Макс. символов хранения текста
                  </label>
                  <div className="input-group-custom">
                    <input
                      type="number"
                      className="dark-field-input"
                      value={indexingConfig.maxStoredChars}
                      min={10000}
                      onChange={(e) =>
                        setIndexingConfig((c) => ({
                          ...c,
                          maxStoredChars: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="field-hint">
                      Максимальный объём сохраняемого текста документа.{" "}
                      <span
                        style={{ fontSize: 10, color: "#555", marginLeft: 4 }}
                      >
                        по умолчанию: 300 000
                      </span>
                    </p>
                  </div>
                </div>

                <div className="indexing-block">
                  <label className="block-title">
                    Макс. символов для AI-обработки
                  </label>
                  <div className="input-group-custom">
                    <input
                      type="number"
                      className="dark-field-input"
                      value={indexingConfig.maxAiChars}
                      min={5000}
                      onChange={(e) =>
                        setIndexingConfig((c) => ({
                          ...c,
                          maxAiChars: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="field-hint">
                      Объём текста, передаваемого в AI для нормализации.{" "}
                      <span
                        style={{ fontSize: 10, color: "#555", marginLeft: 4 }}
                      >
                        по умолчанию: 60 000
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  <button
                    className="create-collection-btn"
                    onClick={saveIndexingConfig}
                    disabled={indexingSaving}
                  >
                    <i className="fa fa-save"></i>{" "}
                    {indexingSaving ? "Сохранение..." : "Сохранить настройки"}
                  </button>
                  {indexingSaveOk && (
                    <span style={{ color: "#10b981", fontSize: 13 }}>
                      <i className="fa fa-check" style={{ marginRight: 4 }} />
                      Сохранено
                    </span>
                  )}
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div
                className={`settings-view-fade ${modalMode ? "blur-content" : ""}`}
              >
                <div className="view-header-row">
                  <h2>Интеграции</h2>
                  <button
                    className="add-model-btn-y"
                    onClick={() => openModal("add")}
                  >
                    Добавить модель
                  </button>
                </div>

                {loadingSettings ? (
                  <p className="text-muted">Загрузка...</p>
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
                        <span
                          className={
                            aiSettings.is_active
                              ? "badge-status-success"
                              : "badge-status-danger"
                          }
                        >
                          {aiSettings.is_active ? "Подключено" : "Неактивно"}
                        </span>
                        <button
                          className="redact-btn-y"
                          onClick={() => openModal("edit")}
                        >
                          Редактировать
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted">Настройки не найдены</p>
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
                <button
                  className="modal-close"
                  onClick={() => setModalMode(null)}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Код провайдера</label>
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="Deepseek"
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                  />
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Название модели</label>
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="Введите название"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                  />
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Api ключ</label>
                  <input
                    type="password"
                    className="dark-field-input"
                    placeholder={
                      modalMode === "edit"
                        ? "Оставьте пустым, чтобы не менять"
                        : "sk-..."
                    }
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                  />
                </div>

                <div className="input-group-custom">
                  <div className="toggle-row">
                    <div
                      className={`ui-toggle cursor-pointer ${formIsActive ? "active" : ""}`}
                      onClick={() => setFormIsActive(!formIsActive)}
                    >
                      <div className="ui-toggle-thumb"></div>
                    </div>
                    <span className="toggle-row-label">Активировать сразу</span>
                  </div>
                </div>

                {saveError && <p className="form-error">{saveError}</p>}
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
        {isVisibleModalCreateUser && (
          <div
            className="modal-overlay"
            onClick={() => setVisibleModalCreateUser(false)}
          >
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {modalMode === "add"
                    ? "Добавление новой модели"
                    : "Создание пользователя"}
                </h2>
                <button
                  className="modal-close"
                  onClick={() => setVisibleModalCreateUser(false)}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Полное имя</label>
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="Name"
                    value={modalUserFullName}
                    onChange={(e) => setModalUserFullName(e.target.value)}
                  />
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Почта</label>
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="Введите название"
                    value={modalUserEmail}
                    onChange={(e) => setModalUserEmail(e.target.value)}
                  />
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Пароль</label>
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="Введите название"
                    value={modalUserPassword}
                    onChange={(e) => setModalUserPassword(e.target.value)}
                  />
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Роль</label>
                  <select
                    className="dark-field-input"
                    value={modalUserRole}
                    onChange={(e) => setModalUserRole(e.target.value)}
                  >
                    <option value="">Выберите роль</option>
                    <option value="admin">Администратор</option>
                    <option value="user">Пользователь</option>
                  </select>
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Статус</label>
                  <select
                    className="dark-field-input"
                    value={modalUserStatus}
                    onChange={(e) => setModalUserStatus(e.target.value)}
                  >
                    <option value="">Выберите статус</option>
                    <option value="active">Активен</option>
                    <option value="blocked">Неактивен</option>
                  </select>
                </div>

                {saveError && <p className="form-error">{saveError}</p>}
              </div>

              <div className="modal-footer">
                <button
                  className="save-settings-btn"
                  onClick={handleCreateUser}
                >
                  Создать пользователя
                </button>
              </div>
            </div>
          </div>
        )}
        {isVisibleModalEditUser && (
          <div
            className="modal-overlay"
            onClick={() => setVisibleModalEditUser(false)}
          >
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Редактирование пользователя</h2>
                <button
                  className="modal-close"
                  onClick={() => setVisibleModalEditUser(false)}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Полное имя</label>
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="Введите имя"
                    value={modalUserEditFullName}
                    onChange={(e) => setModalUserEditFullName(e.target.value)}
                  />
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Почта</label>
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="Введите почту"
                    value={modalUserEditEmail}
                    onChange={(e) => setModalUserEditEmail(e.target.value)}
                  />
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Пароль</label>
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="Введите новый пароль"
                    value={modalUserEditPassword}
                    onChange={(e) => setModalUserEditPassword(e.target.value)}
                  />
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Роль</label>
                  <select
                    className="dark-field-input"
                    value={modalUserEditRole}
                    onChange={(e) => setModalUserEditRole(e.target.value)}
                  >
                    <option value="">Выберите роль</option>
                    <option value="admin">Администратор</option>
                    <option value="user">Пользователь</option>
                  </select>
                </div>

                <div className="input-group-custom input-group-mb">
                  <label className="block-title">Статус</label>
                  <select
                    className="dark-field-input"
                    value={modalUserEditStatus}
                    onChange={(e) => setModalUserEditStatus(e.target.value)}
                  >
                    <option value="">Выберите статус</option>
                    <option value="active">Активен</option>
                    <option value="blocked">Неактивен</option>
                  </select>
                </div>

                {saveError && <p className="form-error">{saveError}</p>}
              </div>

              <div className="modal-footer">
                <button
                  className="save-settings-btn"
                  onClick={handleUpdateUser}
                >
                  Обновить пользователя
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Удалить пользователя?"
        message={`Вы уверены, что хотите удалить пользователя «${deleteTargetName}»? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
};

export default SettingsPage;
