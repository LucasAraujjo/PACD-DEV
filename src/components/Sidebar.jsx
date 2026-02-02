import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">PACD</h2>
          <button className="sidebar-close" onClick={onClose} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.username || 'Usuário'}</p>
            <p className="sidebar-user-role">Administrador</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="/nova-atividade" className="sidebar-nav-item">
            <span className="sidebar-nav-icon">📝</span>
            <span>Nova Atividade</span>
          </a>
          <a href="/minhas-atividades" className="sidebar-nav-item">
            <span className="sidebar-nav-icon">📋</span>
            <span>Minhas Atividades</span>
          </a>
          <a href="#" className="sidebar-nav-item disabled">
            <span className="sidebar-nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="sidebar-nav-item disabled">
            <span className="sidebar-nav-icon">🎯</span>
            <span>Simulados</span>
          </a>
          <a href="#" className="sidebar-nav-item disabled">
            <span className="sidebar-nav-icon">📈</span>
            <span>Relatórios</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-nav-icon">🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
