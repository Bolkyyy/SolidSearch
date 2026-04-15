import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <Layout>
      <section className="welcome">
        <h1>Настройки</h1>
        <p className="welcome-link">Управление пользователями, источниками и конфигурацией системы</p>
      </section>
      <div className="settings-container">
        <div className="settings-card-panel">
          <div className="settings-tabs-nav">
            {[
              { id: 'users', icon: 'fa-users', label: 'Пользователи и роли' },
              { id: 'sources', icon: 'fa-database', label: 'Источники' },
              { id: 'collections', icon: 'fa-layer-group', label: 'Коллекции' },
              { id: 'models', icon: 'fa-microchip', label: 'Модели' },
              { id: 'rules', icon: 'fa-cog', label: 'Правила индексации' },
              { id: 'integrations', icon: 'fa-plug', label: 'Интеграции' },
              { id: 'interface', icon: 'fa-desktop', label: 'Интерфейс' },
            ].map(tab => (
              <div
                key={tab.id}
                className={`settings-tab-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`fa ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-divider-settings" />

          {activeTab === 'users' && (
            <div className="settings-view-fade">
              <div className="view-header-row">
                <h2>Управление пользователями</h2>
                <button className="create-collection-btn">+ Создать пользователя</button>
              </div>
              <table className="users-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Имя</th>
                    <th style={{ width: '25%' }}>Email</th>
                    <th style={{ width: '20%' }}>Роль</th>
                    <th style={{ width: '15%' }}>Статус</th>
                    <th style={{ width: '15%' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Иван Петров</td>
                    <td className="text-muted">ivan@company.ru</td>
                    <td>Администратор</td>
                    <td><span className="badge-status success">Активен</span></td>
                    <td className="table-actions">
                      <i className="fa fa-edit"></i>
                      <i className="fa fa-trash-alt"></i>
                    </td>
                  </tr>
                  {/* ещё строки */}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="settings-view-fade">
              <h2>Коллекции</h2>
              <div className="collection-text">
                <p className="empty-tab-text">
                  Управление коллекциями доступно в разделе{' '}
                  <Link to="/collections" className="coll-endpoint">Архив документов</Link>
                </p>
              </div>
            </div>
          )}

          {/* Остальные вкладки скопируйте аналогично из исходного кода */}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;