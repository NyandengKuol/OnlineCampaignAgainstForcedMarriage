import logo from '../../assets/logo.jpg';
import { useAuth } from '../../context/AuthContext';
import './NavBar.css';

const NavBar = ({ activeTab, setActiveTab, rightContent, dashboardLabel }) => {
  const { user, logout } = useAuth();
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'learn', label: 'Learn' },
    { id: 'prevention', label: 'Prevention' },
    { id: 'campaign', label: 'Campaigns' },
    { id: 'faq', label: 'FAQ' },
    { id: 'resources', label: 'Support' }
  ];
  if (user) navItems.push({ id: user.isAdmin ? 'admin' : 'dashboard', label: user.isAdmin ? (dashboardLabel || 'Admin') : 'Dashboard' });

  return (
    <header className="site-header">
      <div className="container header-container">
        <button className="brand-logo" onClick={() => setActiveTab('home')} aria-label="Go to home page">
          <img src={logo} alt="Online Campaign Against Forced Marriage" className="logo-icon" />
          <div className="brand-text">
            <span className="brand-title">Online Campaign</span>
            <span className="brand-subtitle">Against Forced Marriage</span>
          </div>
        </button>

        <nav className="nav-menu" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          {user ? <>{rightContent}<button className="nav-link account-link" onClick={() => { logout(); setActiveTab('home'); }}><span>Log Out</span></button></> : <>
            <button className={`nav-link account-link ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}><span>Log In</span></button>
          </>}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
