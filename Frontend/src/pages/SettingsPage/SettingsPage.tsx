import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('users'); 
  const [showModal, setShowModal] = useState(false); 

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
              { id: "collections", icon: "fa-layer-group", label: "Коллекции" },
              { id: "models", icon: "fa-microchip", label: "Модели" },
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
                <label className="block-title">
                  Автоматическая индексация новых документов
                </label>
                <div className="custom-checkbox-row">
                  <input type="checkbox" className="custom-checkbox" />
                  <span> Индексировать документы сразу после загрузки</span>
                </div>
              </div>

              <div className="indexing-block">
                <label className="block-title">Размер чанка (токены)</label>
                <div className="input-group-custom">
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="512"
                  />
                  <p className="field-hint">
                    Оптимальный размер: 512-1024 токенов
                  </p>
                </div>
              </div>

              <div className="indexing-block">
                <label className="block-title">
                  Overlap между чанками (токены)
                </label>
                <div className="input-group-custom">
                  <input
                    type="text"
                    className="dark-field-input"
                    placeholder="128"
                  />
                  <p className="field-hint">
                    Рекомендуется: 10-20% от размера чанка
                  </p>
                </div>
              </div>

              <button className="create-collection-btn">
                <i className="fa fa-save"></i> Сохранить настройки
              </button>
            </div>
          )}

          {activeTab === "integrations" && (
  <div className={`settings-view-fade ${showModal ? 'blur-content' : ''}`}>
    <div className="view-header-row">
      <h2>Интеграции</h2>
      <button className="add-model-btn-y" onClick={() => setShowModal(true)}>
        Добавить модель
      </button>
    </div>

    <div className="integrations-grid-layout">
      <div className="integration-card-large">
        <div className="integration-card-header">
          <h3>OpenAI API</h3>
        </div>
        
        <p className="integration-card-desc">
          Используется для эмбеддингов и генерации ответов
        </p>
        
        <div className="integration-card-actions">
          <span className="badge-status success">Подключено</span>
          <button className="redact-btn-y">Редактировать</button>
        </div>
      </div>
    </div>
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

          {activeTab === "models" && (
            <div className="settings-view-fade">
              <div className="view-header-row">
                <h2>Конфигурация моделей</h2>
                <button className="create-collection-btn">
                  + Добавить модель
                </button>
              </div>
              <div className="source-data-card">
                <div className="source-card-body">
                  <div className="source-title-row">
                    <h3>text-embedding-ada-002</h3>
                    <span className="badge-status success">Активна</span>
                    <div className="redact-delete-buttons">
                      <button className="redact-collection-btn">
                        Настроить
                      </button>
                    </div>
                  </div>
                  <p className="source-meta">Тип: Эмбеддинги</p>
                  <p className="source-path">Провайдер: OpenAI</p>
                </div>
              </div>
              <div className="source-data-card">
                <div className="source-card-body">
                  <div className="source-title-row">
                    <h3>gpt-4</h3>
                    <span className="badge-status success">Активна</span>
                    <div className="redact-delete-buttons">
                      <button className="redact-collection-btn">
                        Настроить
                      </button>
                    </div>
                  </div>
                  <p className="source-meta">Тип: Генерация ответов</p>
                  <p className="source-path">Провайдер: OpenAI</p>
                </div>
              </div>
              <div className="source-data-card">
                <div className="source-card-body">
                  <div className="source-title-row">
                    <h3>multilingual-e5-large</h3>
                    <span className="badge-status muted">Неактивна</span>
                    <div className="redact-delete-buttons">
                      <button className="redact-collection-btn">
                        Настроить
                      </button>
                    </div>
                  </div>
                  <p className="source-meta">Тип: Эмбеддинги</p>
                  <p className="source-path">Провайдер: HuggingFace</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "collections" && (
            <div className="settings-view-fade">
              <h2>Коллекции</h2>
              <div className="collection-text">
                <p className="empty-tab-text">
                  Управление коллекциями доступно в разделе{" "}
                  <Link to="/collections" className="coll-endpoint">
                    Архив документов
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Настройка<br/>конфигурации модели</h2>
        <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
      </div>
      
      <div className="modal-body">
        <div className="input-group-custom" style={{marginBottom: '20px'}}>
          <label className="block-title">Код провайдера</label>
          <input type="text" className="dark-field-input" placeholder="По умолчанию deepseek" />
        </div>

        <div className="input-group-custom" style={{marginBottom: '20px'}}>
          <label className="block-title">Название модели</label>
          <input type="text" className="dark-field-input" placeholder="По умолчанию deepseek-v3" />
        </div>

        <div className="input-group-custom" style={{marginBottom: '20px'}}>
          <label className="block-title">Api ключ</label>
          <input type="password" className="dark-field-input" placeholder="Введите api ключ" />
        </div>

        <div className="input-group-custom">
          <label className="block-title">Подключение</label>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px'}}>
            <div className="ui-toggle active">
               <div className="ui-toggle-thumb"></div>
            </div>
            <span style={{color: '#888', fontSize: '12px'}}>Активировать модель после сохранения</span>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="save-settings-btn" onClick={() => setShowModal(false)}>
          Сохранить настройки
        </button>
      </div>
    </div>
  </div>
)}
    </Layout>
  );
};

export default SettingsPage;