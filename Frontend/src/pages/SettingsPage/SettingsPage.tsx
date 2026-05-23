import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { aiApi, type AiSettings } from "../../api/AI_api";

interface User {
  id: number | null;
  name: string;
  email: string;
  role: string;
  status: string;
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Иван Петров', email: 'ivan@company.ru', role: 'Администратор', status: 'Активен' },
    { id: 2, name: 'Мария Сидорова', email: 'maria@company.ru', role: 'Пользователь', status: 'Активен' },
    { id: 3, name: 'Ольга Иванова', email: 'olga@company.ru', role: 'Читатель', status: 'Неактивен' }
  ]);

  const [userForm, setUserForm] = useState<User>({ 
    id: null, 
    name: '', 
    email: '', 
    role: '', 
    status: 'Активен' 
  });

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
      const handleDeleteUser = (id: number | null) => {
    if (!id) return; 
    if (window.confirm("Вы уверены, что хотите удалить пользователя?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };
  const openUserModal = (mode: 'add' | 'edit', user: User | null = null) => {
    if (mode === 'edit' && user) {
      setUserForm(user);
    } else {
      setUserForm({ id: null, name: '', email: '', role: '', status: 'Активен' });
    }
    setModalMode(mode);
  };

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
            <button className="create-collection-btn" onClick={() => openUserModal('add')}>
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
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td className="text-muted">{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`badge-status ${user.status === 'Активен' ? 'success' : 'danger'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="table-actions">
                    <i className="fa fa-edit" onClick={() => openUserModal('edit', user)}></i>
                    <i className="fa fa-trash-alt" onClick={() => handleDeleteUser(user.id)}></i>
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
                {activeTab === 'users' 
                  ? (modalMode === 'add' ? 'Создать пользователя' : 'Изменить пользователя')
                  : (modalMode === 'add' ? 'Добавление новой модели' : 'Настройка конфигурации модели')
                }
              </h2>
              <button className="modal-close" onClick={() => setModalMode(null)}>&times;</button>
            </div>
            
            <div className="modal-body">
              {activeTab === 'users' ? (
                <>
                  <div className="input-group-custom" style={{marginBottom: '16px'}}>
                    <label className="block-title">Имя</label>
                    <input type="text" className="dark-field-input" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} placeholder="Иван Иванов" />
                  </div>
                  <div className="input-group-custom" style={{marginBottom: '16px'}}>
                    <label className="block-title">Email</label>
                    <input type="email" className="dark-field-input" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} placeholder="ivan@mail.ru" />
                  </div>
                  <div className="input-group-custom" style={{marginBottom: '16px'}}>
                    <label className="block-title">Роль</label>
                    <input type="text" className="dark-field-input" value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} placeholder="Администратор" />
                  </div>
                  <div className="input-group-custom">
                    <label className="block-title">Статус</label>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <div 
                        className={`ui-toggle ${userForm.status === 'Активен' ? 'active' : ''}`}
                        onClick={() => setUserForm({...userForm, status: userForm.status === 'Активен' ? 'Неактивен' : 'Активен'})}
                      >
                        <div className="ui-toggle-thumb"></div>
                      </div>
                                            <span style={{color: '#888', fontSize: '12px'}}>{userForm.status}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="input-group-custom" style={{marginBottom: '16px'}}>
                    <label className="block-title">Код провайдера</label>
                    <input type="text" className="dark-field-input" placeholder="Например, openai" />
                  </div>
                  <div className="input-group-custom" style={{marginBottom: '16px'}}>
                    <label className="block-title">Название модели</label>
                    <input type="text" className="dark-field-input" placeholder="Введите название" />
                  </div>
                  <div className="input-group-custom" style={{marginBottom: '16px'}}>
                    <label className="block-title">Api ключ</label>
                    <input type="password" className="dark-field-input" placeholder="sk-..." />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="save-settings-btn" onClick={() => {
                                if (activeTab === 'users') {
                  if (modalMode === 'add') {
                    const newUser = { ...userForm, id: Date.now() };
                    setUsers(prev => [...prev, newUser]);
                  } else {
                    setUsers(prev => prev.map(u => u.id === userForm.id ? userForm : u));
                  }
                }
                setModalMode(null);
              }}>
                {modalMode === 'add' ? 'Создать' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SettingsPage;