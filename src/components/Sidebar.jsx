import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from '../logo1.1.png';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
    // Ensure we're on the main app route
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Header - Only show on mobile */}
      {isMobile && (
        <div className="mobile-header">
          <button 
            className="sidebar-mobile-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            ☰
          </button>
          <div className="mobile-header-content">
            <img src={logo} alt="Paint Lab" className="mobile-logo" />
            <span className="mobile-logo-text">Joe's Paint Lab</span>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isMobile ? (isOpen ? 'open' : 'closed') : 'desktop'}`}>
        {/* Logo in sidebar - unified approach */}
        <div className="sidebar-logo">
          <img src={logo} alt="Paint Lab" className="sidebar-logo-img" />
          <span className="sidebar-logo-text">Joe's Paint Lab</span>
        </div>
        
        {currentUser && (
          <div className="user-info">
            <span className="welcome">Hi, {currentUser.displayName || currentUser.email}</span>
            {isAdmin && (
              <div className="admin-badge">
                ⚙️ Administrator
              </div>
            )}
          </div>
        )}
        
        {/* Regular Navigation for All Users */}
        <div 
          className={`sidebar-item ${activeTab === 'brand' ? 'active' : ''}`}
          onClick={() => handleTabClick('brand')}
        >
          🏷️ Brand Selection
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'mix' ? 'active' : ''}`}
          onClick={() => handleTabClick('mix')}
        >
          🎨 Paint Picker
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => handleTabClick('calculator')}
        >
          📐 Paint Calculator
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => handleTabClick('details')}
        >
          📋 My Colors
        </div>
        
        {/* Admin Panel - Only show for admin users as a regular tab */}
        {isAdmin && (
          <div 
            className={`sidebar-item admin-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabClick('admin')}
          >
            ⚙️ Admin Panel
          </div>
        )}
        
        {currentUser && (
          <div className="logout-section">
            <div 
              className="sidebar-item logout-item"
              onClick={handleLogout}
            >
              🚪 Logout
            </div>
          </div>
        )}
      </div>
    </>
  );
}