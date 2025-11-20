import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { 
    isAdmin, 
    adminLoading,
    systemStats,
    users,
    brandColors,
    colorMixes,
    userColors,
    systemSettings,
    refreshData,
    updateUser,
    removeUser,
    disableUser,
    enableUser,
    addBrandColor,
    updateBrandColor,
    removeBrandColor,
    removeColorMix,
    updateUserColor,
    deleteUserColor,
    updateSettings
  } = useAdmin();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [newBrandColor, setNewBrandColor] = useState({
    name: '',
    brand: '',
    colorCode: '',
    hex: '#000000',
    category: '',
    pricePerLiter: 0
  });
  const [editingColor, setEditingColor] = useState(null);
  const [viewingBrandColor, setViewingBrandColor] = useState(null);
  const [viewingUserColor, setViewingUserColor] = useState(null);
  
  // Modal state
  const [showColorModal, setShowColorModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  // Combine all user-created colors from colorHistory
  // userColors already contains all colors from colorHistory collection
  const allUserColors = userColors;

  // Refresh data when panel opens
  useEffect(() => {
    if (isAdmin) {
      refreshData();
    }
  }, [isAdmin, refreshData, activeSection]);

  // Debug: Log brand colors data
  useEffect(() => {
    if (activeSection === 'brand-colors' && brandColors.length > 0) {
      console.log('🔍 Current brand colors in state:', brandColors.map(c => ({ 
        id: c.id, 
        name: c.name,
        brand: c.brand 
      })));
    }
  }, [activeSection, brandColors]);

  const handleUpdateUserRole = async (userId, newRole) => {
    setLoading(true);
    const result = await updateUser(userId, { role: newRole });
    if (!result.success) {
      alert(`Error updating user: ${result.error}`);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    const action = window.confirm(`Are you sure you want to PERMANENTLY DELETE user ${userEmail}?\n\nThis action cannot be undone.`);
    if (action) {
      const confirmDelete = window.confirm(`FINAL WARNING: This will permanently delete ${userEmail} from the system. Continue?`);
      if (confirmDelete) {
        setLoading(true);
        const result = await removeUser(userId);
        if (!result.success) {
          alert(`Error deleting user: ${result.error}`);
        } else {
          await refreshData();
        }
        setLoading(false);
      }
    }
  };

  const handleDisableUser = async (userId, userEmail) => {
    if (window.confirm(`Are you sure you want to disable user ${userEmail}?`)) {
      setLoading(true);
      const result = await disableUser(userId);
      if (!result.success) {
        alert(`Error disabling user: ${result.error}`);
      } else {
        await refreshData();
      }
      setLoading(false);
    }
  };

  const handleEnableUser = async (userId, userEmail) => {
    setLoading(true);
    const result = await enableUser(userId);
    if (!result.success) {
      alert(`Error enabling user: ${result.error}`);
    } else {
      await refreshData();
    }
    setLoading(false);
  };

  // Modal handlers
  const handleAddBrandColorClick = () => {
    setEditingColor(null);
    setModalMode('add');
    setShowColorModal(true);
  };

  const handleEditBrandColor = (color) => {
    console.log('✏️ Editing color:', color);
    setEditingColor({ ...color });
    setModalMode('edit');
    setShowColorModal(true);
  };

  const handleCancelModal = () => {
    setShowColorModal(false);
    setEditingColor(null);
  };

  const handleAddBrandColor = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newBrandColor.name?.trim() || !newBrandColor.brand?.trim() || !newBrandColor.colorCode?.trim()) {
      alert('Please fill in all required fields: Name, Brand, and Color Code');
      return;
    }

    setLoading(true);
    const result = await addBrandColor(newBrandColor);
    if (result.success) {
      setNewBrandColor({
        name: '',
        brand: '',
        colorCode: '',
        hex: '#000000',
        category: '',
        pricePerLiter: 0
      });
      setShowColorModal(false);
      alert('Brand color added successfully!');
    } else {
      alert(`Error adding brand color: ${result.error}`);
    }
    setLoading(false);
  };

  const handleUpdateBrandColor = async (e) => {
    e.preventDefault();
    if (!editingColor) return;

    // Validate required fields
    if (!editingColor.name?.trim() || !editingColor.brand?.trim() || !editingColor.colorCode?.trim()) {
      alert('Please fill in all required fields: Name, Brand, and Color Code');
      return;
    }

    console.log('🔄 Updating brand color ID:', editingColor.id);
    console.log('📝 Color data:', editingColor);

    setLoading(true);
    try {
      const result = await updateBrandColor(editingColor.id, {
        name: editingColor.name.trim(),
        brand: editingColor.brand.trim(),
        colorCode: editingColor.colorCode.trim(),
        hex: editingColor.hex,
        category: editingColor.category,
        pricePerLiter: editingColor.pricePerLiter
      });
      
      console.log('✅ Update result:', result);
      
      if (result.success) {
        setEditingColor(null);
        setShowColorModal(false);
        // Force refresh the data to ensure consistency
        await refreshData();
        alert('Color updated successfully!');
      } else {
        alert(`Error updating color: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      alert(`Error updating color: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrandColor = async (colorId, colorName) => {
    if (window.confirm(`Are you sure you want to delete ${colorName}?`)) {
      setLoading(true);
      const result = await removeBrandColor(colorId);
      if (!result.success) {
        alert(`Error deleting color: ${result.error}`);
      }
      setLoading(false);
    }
  };

  const handleDeleteUserColor = async (colorId, colorName, userEmail) => {
    if (window.confirm(`Are you sure you want to delete "${colorName}" saved by ${userEmail}?`)) {
      setLoading(true);
      
      try {
        // All user-created colors are in colorHistory collection
        const result = await deleteUserColor(colorId);
        
        if (!result.success) {
          alert(`Error deleting color: ${result.error}`);
          // Refresh data even on error to sync state
          await refreshData();
        } else {
          // If we got an actualId back, it means we found the color with a different ID
          if (result.actualId && result.actualId !== colorId) {
            console.log('Color ID corrected from', colorId, 'to', result.actualId);
          }
          // Refresh data after successful deletion
          await refreshData();
        }
      } catch (error) {
        console.error('Error deleting color:', error);
        alert(`Error deleting color: ${error.message}`);
        // Refresh data even on error to sync state
        await refreshData();
      } finally {
        setLoading(false);
      }
    }
  };

  // Color categories for the dropdown
  const colorCategories = [
    'red',
    'orange', 
    'yellow',
    'green',
    'blue',
    'purple',
    'brown',
    'gray',
    'white',
    'black',
    'neutral',
    'pastel',
    'vibrant'
  ];

  if (adminLoading) {
    return <div className="admin-loading">Loading admin panel...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You don't have administrator privileges to access this panel.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage users, brand colors, and system settings</p>
        
        {systemStats && (
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{systemStats.totalUsers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Brand Colors</h3>
              <p>{systemStats.brandColors || 0}</p>
            </div>
            <div className="stat-card">
              <h3>User Colors</h3>
              <p>{userColors.length || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Active Today</h3>
              <p>{systemStats.activeToday || 0}</p>
            </div>
          </div>
        )}
      </div>

      <div className="admin-nav">
        <button 
          className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSection('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-btn ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          👥 Users ({users.length})
        </button>
        <button 
          className={`nav-btn ${activeSection === 'brand-colors' ? 'active' : ''}`}
          onClick={() => setActiveSection('brand-colors')}
        >
          🎨 Brand Colors ({brandColors.length})
        </button>
        <button 
          className={`nav-btn ${activeSection === 'user-colors' ? 'active' : ''}`}
          onClick={() => setActiveSection('user-colors')}
        >
          💾 User Colors ({userColors.length})
        </button>
        <button 
          className={`nav-btn ${activeSection === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSection('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="admin-content">
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="section-content">
            <h2>System Overview</h2>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Recent Users</h3>
                <div className="recent-list">
                  {users.slice(0, 5).map(user => (
                    <div key={user.id} className="recent-item">
                      <span className="user-email">{user.email}</span>
                      <span className={`role-badge ${user.role}`}>
                        {user.role || 'user'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="dashboard-card">
                <h3>Recent Brand Colors</h3>
                <div className="recent-list">
                  {brandColors.slice(0, 5).map(color => (
                    <div key={color.id} className="recent-item">
                      <div 
                        className="color-swatch-small"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="color-info">
                        <strong>{color.name}</strong>
                        <span className="color-brand">{color.brand}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="dashboard-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button 
                    onClick={() => setActiveSection('brand-colors')}
                    className="quick-action-btn"
                  >
                    + Add Brand Color
                  </button>
                  <button 
                    onClick={() => setActiveSection('users')}
                    className="quick-action-btn"
                  >
                    👥 Manage Users
                  </button>
                  <button 
                    onClick={refreshData}
                    className="quick-action-btn"
                  >
                    🔄 Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div className="section-content">
            <h2>User Management</h2>
            <div className="data-table">
              <div className="table-header">
                <span>Email</span>
                <span>Display Name</span>
                <span>Role</span>
                <span>Status</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {users.map(user => (
                <div key={user.id} className={`table-row ${user.disabled ? 'disabled-user' : ''}`}>
                  <span className="user-email" data-label="Email">{user.email}</span>
                  <span data-label="Display Name">{user.displayName || 'N/A'}</span>
                  <span data-label="Role">
                    <select 
                      value={user.role || 'user'} 
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                      disabled={loading || user.disabled}
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </span>
                  <span data-label="Status">
                    {user.disabled ? (
                      <span className="status-badge disabled">Disabled</span>
                    ) : (
                      <span className="status-badge active">Active</span>
                    )}
                  </span>
                  <span data-label="Joined">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="actions" data-label="Actions">
                    {user.disabled ? (
                      <button 
                        className="action-btn success"
                        onClick={() => handleEnableUser(user.id, user.email)}
                        disabled={loading}
                        title="Enable user"
                      >
                        ✅ Enable
                      </button>
                    ) : (
                      <button 
                        className="action-btn warning"
                        onClick={() => handleDisableUser(user.id, user.email)}
                        disabled={loading}
                        title="Disable user"
                      >
                        ⚠️ Disable
                      </button>
                    )}
                    <button 
                      className="action-btn danger"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      disabled={loading}
                      title="Permanently delete user"
                    >
                      🗑️ Delete
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Colors Section */}
        {activeSection === 'brand-colors' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Brand Colors Management</h2>
              <button 
                className="btn-primary"
                onClick={handleAddBrandColorClick}
              >
                + Add New Color
              </button>
            </div>

            <div className="brand-colors-grid">
              {brandColors.map(color => (
                <div key={color.id} className="brand-color-card">
                  <div 
                    className="color-swatch-large"
                    style={{ backgroundColor: color.hex }}
                    title={`Click to view details`}
                    onClick={() => setViewingBrandColor(color)}
                  />
                  <div className="color-card-details">
                    <h4>{color.name}</h4>
                    <p className="color-brand-name">{color.brand}</p>
                    <p className="color-code-display">{color.colorCode}</p>
                    <p className="color-hex">{color.hex}</p>
                    {color.category && (
                      <span className="category-badge">{color.category}</span>
                    )}
                    {color.pricePerLiter && (
                      <p className="color-price-display">₱{color.pricePerLiter.toFixed(2)}/L</p>
                    )}
                    <div className="color-card-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => setViewingBrandColor(color)}
                        disabled={loading}
                        title="View full details"
                      >
                        👁️ View
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEditBrandColor(color)}
                        disabled={loading}
                        title="Edit color"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => handleDeleteBrandColor(color.id, color.name)}
                        disabled={loading}
                        title="Delete color"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Combined User Colors Section */}
        {activeSection === 'user-colors' && (
          <div className="section-content">
            <h2>User Created Colors</h2>
            <p>All colors saved by users from across the application</p>
            <div className="user-colors-grid">
              {userColors.map(color => (
                <div key={color.id} className="user-color-card">
                  <div 
                    className="color-swatch-large"
                    style={{ backgroundColor: color.hex || '#cccccc' }}
                    title={`Click to view details`}
                    onClick={() => setViewingUserColor(color)}
                  />
                  <div className="color-card-details">
                    <h4>{color.name}</h4>
                    <p className="color-user-email">{color.userEmail || 'Unknown'}</p>
                    {color.brandColorName && (
                      <p className="color-based-on">Based on: {color.brandColorName}</p>
                    )}
                    {!color.brandColorName && (
                      <p className="color-based-on">Custom Mix</p>
                    )}
                    <p className="color-hex">{color.hex || 'N/A'}</p>
                    <p className="color-volume-info">
                      Volume: {color.volume} {color.unit || 'ml'}
                    </p>
                    {color.totalCost && (
                      <p className="color-cost">Cost: ₱{color.totalCost.toFixed(2)}</p>
                    )}
                    <p className="color-date">
                      {new Date(color.createdAt).toLocaleDateString()}
                    </p>
                    <div className="color-card-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => setViewingUserColor(color)}
                        disabled={loading}
                        title="View full details"
                      >
                        👁️ View
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => handleDeleteUserColor(color.id, color.name, color.userEmail)}
                        disabled={loading}
                        title="Delete color"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div className="section-content">
            <h2>System Settings</h2>
            <div className="settings-form">
              <div className="form-group">
                <label>Application Name:</label>
                <input
                  type="text"
                  value={systemSettings.appName || "Joe's Paint Lab"}
                  onChange={(e) => updateSettings({...systemSettings, appName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Default Volume Unit:</label>
                <select
                  value={systemSettings.defaultVolumeUnit || 'ml'}
                  onChange={(e) => updateSettings({...systemSettings, defaultVolumeUnit: e.target.value})}
                >
                  <option value="ml">Milliliters (ml)</option>
                  <option value="liter">Liters (L)</option>
                  <option value="gallon">Gallons (gal)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Maximum Saved Colors per User:</label>
                <input
                  type="number"
                  value={systemSettings.maxSavedColors || 100}
                  onChange={(e) => updateSettings({...systemSettings, maxSavedColors: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Default Color Categories:</label>
                <div className="categories-list">
                  {colorCategories.map(category => (
                    <span key={category} className="category-tag">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => {
                  updateSettings(systemSettings);
                  alert('Settings saved successfully!');
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Brand Color Modal */}
      {showColorModal && (
        <div className="color-modal-overlay" onClick={handleCancelModal}>
          <div className="color-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3>{modalMode === 'edit' ? '✏️ Edit Brand Color' : '🎨 Add New Brand Color'}</h3>
              <div className="card-subtitle">
                {modalMode === 'edit' ? 'Update the color details below' : 'Fill in the details to add a new brand color'}
              </div>
              <button className="close-modal" onClick={handleCancelModal}>×</button>
            </div>
            
            <div className="card-body">
              <form onSubmit={modalMode === 'edit' ? handleUpdateBrandColor : handleAddBrandColor}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Color Name *</label>
                    <input
                      type="text"
                      value={modalMode === 'edit' ? editingColor.name : newBrandColor.name}
                      onChange={(e) => modalMode === 'edit' 
                        ? setEditingColor({...editingColor, name: e.target.value})
                        : setNewBrandColor({...newBrandColor, name: e.target.value})
                      }
                      required
                      placeholder="e.g., Crimson Red"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Brand *</label>
                    <input
                      type="text"
                      value={modalMode === 'edit' ? editingColor.brand : newBrandColor.brand}
                      onChange={(e) => modalMode === 'edit'
                        ? setEditingColor({...editingColor, brand: e.target.value})
                        : setNewBrandColor({...newBrandColor, brand: e.target.value})
                      }
                      required
                      placeholder="e.g., Sherwin Williams"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Color Code *</label>
                    <input
                      type="text"
                      value={modalMode === 'edit' ? editingColor.colorCode : newBrandColor.colorCode}
                      onChange={(e) => modalMode === 'edit'
                        ? setEditingColor({...editingColor, colorCode: e.target.value})
                        : setNewBrandColor({...newBrandColor, colorCode: e.target.value})
                      }
                      required
                      placeholder="e.g., SW 1234"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hex Color *</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={modalMode === 'edit' ? editingColor.hex : newBrandColor.hex}
                        onChange={(e) => modalMode === 'edit'
                          ? setEditingColor({...editingColor, hex: e.target.value})
                          : setNewBrandColor({...newBrandColor, hex: e.target.value})
                        }
                        required
                        className="color-picker"
                      />
                      <span className="hex-value">
                        {modalMode === 'edit' ? editingColor.hex : newBrandColor.hex}
                      </span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={modalMode === 'edit' ? editingColor.category : newBrandColor.category}
                      onChange={(e) => modalMode === 'edit'
                        ? setEditingColor({...editingColor, category: e.target.value})
                        : setNewBrandColor({...newBrandColor, category: e.target.value})
                      }
                      className="form-select"
                    >
                      <option value="">Select Category</option>
                      {colorCategories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Price per Liter (₱)</label>
                    <div className="price-input-group">
                      <span className="currency-symbol">₱</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={modalMode === 'edit' ? editingColor.pricePerLiter : newBrandColor.pricePerLiter}
                        onChange={(e) => modalMode === 'edit'
                          ? setEditingColor({...editingColor, pricePerLiter: parseFloat(e.target.value) || 0})
                          : setNewBrandColor({...newBrandColor, pricePerLiter: parseFloat(e.target.value) || 0})
                        }
                        placeholder="0.00"
                        className="form-input price-input"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Saving...' : (modalMode === 'edit' ? '💾 Update Color' : '➕ Add Color')}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleCancelModal}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Brand Color View Modal */}
      {viewingBrandColor && (
        <div className="color-view-modal-overlay" onClick={() => setViewingBrandColor(null)}>
          <div className="color-view-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={() => setViewingBrandColor(null)}
            >
              ×
            </button>
            <div className="color-view-content">
              <div className="color-view-header">
                <div 
                  className="color-view-swatch"
                  style={{ backgroundColor: viewingBrandColor.hex }}
                />
                <div className="color-view-title">
                  <h2>{viewingBrandColor.name}</h2>
                  <div className="color-view-details">
                    <span><strong>Brand:</strong> {viewingBrandColor.brand}</span>
                    <span><strong>Color Code:</strong> {viewingBrandColor.colorCode}</span>
                    <span><strong>HEX:</strong> {viewingBrandColor.hex}</span>
                    {viewingBrandColor.category && (
                      <span><strong>Category:</strong> {viewingBrandColor.category}</span>
                    )}
                    {viewingBrandColor.pricePerLiter && (
                      <span><strong>Price per Liter:</strong> ₱{viewingBrandColor.pricePerLiter.toFixed(2)}</span>
                    )}
                    {viewingBrandColor.createdAt && (
                      <span><strong>Created:</strong> {new Date(viewingBrandColor.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="color-view-body">
                <p>This is a brand color saved by admin. Users can select this color from the Paint Picker section.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Color View Modal */}
      {viewingUserColor && (
        <div className="color-view-modal-overlay" onClick={() => setViewingUserColor(null)}>
          <div className="color-view-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={() => setViewingUserColor(null)}
            >
              ×
            </button>
            <div className="color-view-content">
              <div className="color-view-header">
                <div 
                  className="color-view-swatch"
                  style={{ backgroundColor: viewingUserColor.hex || '#cccccc' }}
                />
                <div className="color-view-title">
                  <h2>{viewingUserColor.name}</h2>
                  <div className="color-view-details">
                    <span><strong>Saved by:</strong> {viewingUserColor.userEmail || 'Unknown'}</span>
                    {viewingUserColor.brand && (
                      <span><strong>Brand:</strong> {viewingUserColor.brand}</span>
                    )}
                    {viewingUserColor.brandColorName && (
                      <span><strong>Based on:</strong> {viewingUserColor.brandColorName}</span>
                    )}
                    {viewingUserColor.colorCode && (
                      <span><strong>Color Code:</strong> {viewingUserColor.colorCode}</span>
                    )}
                    <span><strong>HEX:</strong> {viewingUserColor.hex || 'N/A'}</span>
                    {viewingUserColor.volume && (
                      <span><strong>Volume:</strong> {viewingUserColor.volume} {viewingUserColor.unit || 'ml'}</span>
                    )}
                    {viewingUserColor.totalCost && (
                      <span><strong>Total Cost:</strong> ₱{viewingUserColor.totalCost.toFixed(2)}</span>
                    )}
                    {viewingUserColor.createdAt && (
                      <span><strong>Created:</strong> {new Date(viewingUserColor.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="color-view-body">
                {viewingUserColor.paintMix && viewingUserColor.paintMix.length > 0 && (
                  <div className="paint-mix-view">
                    <h3>Paint Mix Components:</h3>
                    <div className="paint-components-list">
                      {viewingUserColor.paintMix.map((paint, index) => (
                        <div key={index} className="paint-component-view">
                          <div 
                            className="paint-color-indicator" 
                            style={{ backgroundColor: paint.color || '#cccccc' }}
                          />
                          <div className="paint-info-view">
                            <span className="paint-name">{paint.name}</span>
                            <span className="paint-ratio">{paint.ratio}% - {Math.round(paint.ml || 0)} ml</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!viewingUserColor.paintMix || viewingUserColor.paintMix.length === 0) && (
                  <p>This is a color saved by a user. Paint mix details are not available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}