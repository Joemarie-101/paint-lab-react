import { useState } from 'react';
import './Sidebar.css';
import logo from '../logo1.1.png';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false); // Close mobile menu when tab is selected
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false); // Close mobile menu after logout
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1001,
          background: 'var(--accent)',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '16px'
        }}
      >
        ☰
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="Paint Lab" className="sidebar-logo-img" />
          <span className="sidebar-logo-text">Joe's Paint Lab</span>
        </div>
        
        {currentUser && (
          <div className="user-info">
            <span className="welcome">Hi, {currentUser.displayName || currentUser.email}</span>
          </div>
        )}
        
        <div 
          className={`sidebar-item ${activeTab === 'brand' ? 'active' : ''}`}
          onClick={() => handleTabClick('brand')}
        >
          🏷️ Brand
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'mix' ? 'active' : ''}`}
          onClick={() => handleTabClick('mix')}
        >
          🎨 Color Mixing
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => handleTabClick('details')}
        >
          📋 Details
        </div>
        
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