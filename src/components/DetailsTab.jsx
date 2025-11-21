import { useState } from 'react';
import { useColorHistory } from '../context/ColorHistoryContext';
import { useAuth } from '../context/AuthContext';
import './DetailsTab.css';

// Shared function to get color requirements (same as MixTab)
const getColorRequirements = (color, volumeInMl) => {
  if (!color) return [];
  
  const hex = color.hex?.toLowerCase() || '#cccccc';
  const r = parseInt(hex.substr(1, 2), 16) || 0;
  const g = parseInt(hex.substr(3, 2), 16) || 0;
  const b = parseInt(hex.substr(5, 2), 16) || 0;
  
  // Get price from brandColor (pricePerLiter) or use default
  // pricePerLiter is in ₱ per liter (e.g., 20 means ₱20 per liter)
  const basePricePerLiter = color.pricePerLiter || 20;
  const basePricePerMl = basePricePerLiter / 1000; // Convert to per ml
  
  // Calculate component prices based on base price
  const whiteBasePrice = basePricePerMl;
  const colorPigmentPrice = basePricePerMl * 0.75;
  const tintPrice = basePricePerMl * 0.9;
  const adjusterPrice = basePricePerMl * 0.6;
  const balancerPrice = basePricePerMl * 0.8;
  const thinnerPrice = basePricePerMl * 0.25;
  
  const isDark = (r + g + b) < 384;
  const isWarm = r > g && r > b;
  const isCool = b > r && b > g;
  const isGreen = g > r && g > b;
  const isNeutral = Math.abs(r - g) < 30 && Math.abs(g - b) < 30;

  const baseComponents = [
    { 
      id: 1,
      name: 'White Base Paint', 
      ratio: isDark ? 40 : 60,
      description: 'Main paint base - provides coverage and brightness',
      color: '#ffffff',
      pricePerMl: whiteBasePrice
    },
    { 
      id: 2,
      name: 'Color Pigment', 
      ratio: isDark ? 35 : 25,
      description: 'Adds the main color intensity',
      color: color.hex || '#cccccc',
      pricePerMl: colorPigmentPrice
    }
  ];

  if (isWarm) {
    baseComponents.push(
      { id: 3, name: 'Red/Yellow Tint', ratio: 15, description: 'Enhances warm tones (red, orange, yellow)', color: '#ff6b35', pricePerMl: tintPrice },
      { id: 4, name: 'Warm Adjuster', ratio: 10, description: 'Fine-tunes warm color balance', color: '#ffa726', pricePerMl: adjusterPrice }
    );
  } else if (isCool) {
    baseComponents.push(
      { id: 3, name: 'Blue Tint', ratio: 15, description: 'Enhances cool tones (blue, purple)', color: '#42a5f5', pricePerMl: tintPrice },
      { id: 4, name: 'Cool Adjuster', ratio: 10, description: 'Fine-tunes cool color balance', color: '#7e57c2', pricePerMl: adjusterPrice }
    );
  } else if (isGreen) {
    baseComponents.push(
      { id: 3, name: 'Green Tint', ratio: 15, description: 'Enhances green tones', color: '#66bb6a', pricePerMl: tintPrice },
      { id: 4, name: 'Natural Adjuster', ratio: 10, description: 'Balances natural green shades', color: '#9ccc65', pricePerMl: adjusterPrice }
    );
  } else if (isNeutral) {
    baseComponents.push(
      { id: 3, name: 'Gray Balancer', ratio: 15, description: 'Maintains neutral gray tones', color: '#90a4ae', pricePerMl: balancerPrice },
      { id: 4, name: 'Tone Adjuster', ratio: 10, description: 'Adjusts warm/cool undertones', color: '#b0bec5', pricePerMl: adjusterPrice }
    );
  } else {
    baseComponents.push(
      { id: 3, name: 'Color Balancer', ratio: 15, description: 'Balances multiple color tones', color: '#78909c', pricePerMl: balancerPrice },
      { id: 4, name: 'Universal Adjuster', ratio: 10, description: 'Fine-tunes complex color mixes', color: '#b0bec5', pricePerMl: adjusterPrice }
    );
  }

  baseComponents.push(
    { id: 5, name: 'Paint Thinner', ratio: 5, description: 'Makes paint easy to mix and apply smoothly', color: '#eceff1', pricePerMl: thinnerPrice }
  );

  return baseComponents.map(paint => ({
    ...paint,
    ml: volumeInMl * (paint.ratio / 100)
  }));
};

export default function DetailsTab() {
  const { savedColors, updateColor, deleteColor, refreshColors } = useColorHistory();
  const { currentUser } = useAuth();
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [volume, setVolume] = useState(1);
  const [unit, setUnit] = useState('liter');
  const [colorName, setColorName] = useState('');

  const unitConversions = {
    ml: 1,
    liter: 1000,
    gallon: 3785.41
  };
  const volumeInMl = volume * unitConversions[unit];

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setVolume(color.volume || 1);
    setUnit(color.unit || 'liter');
    setColorName(color.name || '');
    setShowColorModal(true);
  };

  const handleEditColor = (color) => {
    if (color.userId !== currentUser?.uid) {
      alert('You can only edit your own colors');
      return;
    }
    setEditingColor({ ...color });
  };

  const handleSaveEdit = () => {
    if (editingColor && editingColor.name.trim()) {
      if (editingColor.userId !== currentUser?.uid) {
        alert('You can only edit your own colors');
        return;
      }
      
      updateColor(editingColor.id, {
        name: editingColor.name.trim(),
        volume: editingColor.volume,
        unit: editingColor.unit
      });
      setEditingColor(null);
    }
  };

  const handleDeleteColor = async (id) => {
    const colorToDelete = savedColors.find(color => color.id === id);
    if (colorToDelete && colorToDelete.userId !== currentUser?.uid && currentUser?.role !== 'admin') {
      alert('You can only delete your own colors');
      return;
    }

    if (window.confirm('Are you sure you want to delete this color?')) {
      try {
        await deleteColor(id);
        // Refresh colors to ensure state is synced
        await refreshColors();
        alert('Color deleted successfully!');
      } catch (error) {
        console.error('Error deleting color:', error);
        const errorMsg = error.message || 'Unknown error occurred';
        // Refresh colors to sync state, especially if ID was invalid
        await refreshColors();
        if (errorMsg.includes('not found') || errorMsg.includes('invalid')) {
          alert('This color may have already been deleted. Your colors have been refreshed.');
        } else {
          alert('Error deleting color: ' + errorMsg);
        }
      }
    }
  };

  const handleUpdateColor = async () => {
    if (!colorName.trim()) {
      alert('Please enter a name for your color');
      return;
    }

    if (!selectedColor) return;

    // Check if user owns this color or is admin
    if (selectedColor.userId !== currentUser?.uid && currentUser?.role !== 'admin') {
      alert('You can only update your own colors');
      return;
    }

    try {
      // Only send the fields that need to be updated
      await updateColor(selectedColor.id, {
        name: colorName.trim(),
        volume: volume,
        unit: unit
      });
      setColorName('');
      setShowColorModal(false);
      // Refresh colors to ensure we have the latest data with correct IDs
      await refreshColors();
      alert('Color updated successfully!');
    } catch (error) {
      console.error('Error updating color:', error);
      const errorMsg = error.message || 'Unknown error occurred';
      // Refresh colors to sync state, especially if ID was invalid
      await refreshColors();
      if (errorMsg.includes('not found') || errorMsg.includes('invalid')) {
        alert('This color may have been deleted or has an invalid ID. Your colors have been refreshed.');
      } else {
        alert('Error updating color: ' + errorMsg);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Safe data access functions
  const getColorDisplay = (color) => {
    return color.exactColor?.hex || color.hex || `rgb(${(color.rgb || [0, 0, 0]).join(',')})`;
  };

  const getPaintMix = (color) => {
    // Use saved paintMix if available, otherwise recalculate using same logic as MixTab
    if (color.paintMix && color.paintMix.length > 0) {
      // Recalculate ml amounts based on current volume if needed
      return color.paintMix.map(paint => ({
        ...paint,
        ml: volumeInMl * (paint.ratio / 100)
      }));
    }
    // Recalculate using same function as MixTab
    if (color.hex && volumeInMl > 0) {
      return getColorRequirements(color, volumeInMl);
    }
    return [];
  };

  return (
    <div className="details-tab">
      <div className="details-header">
        <h1>My Color Collection</h1>
        <p>Manage and view your saved paint colors</p>
      </div>
      
      {savedColors.length === 0 ? (
        <div className="no-colors-message">
          <h3>No colors saved yet</h3>
          <p>Go to Paint Picker section to browse and save colors from our collection.</p>
        </div>
      ) : (
        <div className="colors-grid-details">
          {savedColors.map((color) => (
            <div
              key={color.id}
              className="color-card-details"
              onClick={() => handleColorClick(color)}
            >
              <div 
                className="color-swatch-details"
                style={{ backgroundColor: getColorDisplay(color) }}
              />
              <div className="color-info-details">
                <h3 className="color-name-details">{color.name}</h3>
                <div className="color-meta-details">
                  {color.brand && (
                    <span className="color-brand-details">{color.brand}</span>
                  )}
                  {color.colorCode && (
                    <span className="color-code-details">{color.colorCode}</span>
                  )}
                </div>
                <div className="color-date-details">
                  {formatDate(color.createdAt)}
                </div>
              </div>
              <div className="color-actions-details">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditColor(color);
                  }}
                  className="edit-btn-details"
                >
                  ✏️
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteColor(color.id);
                  }}
                  className="delete-btn-details"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Color Detail Modal */}
      {showColorModal && selectedColor && (
        <div className="color-modal-overlay" onClick={() => setShowColorModal(false)}>
          <div className="color-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={() => setShowColorModal(false)}
            >
              ×
            </button>

            <div className="modal-content">
              <div className="modal-header">
                <div 
                  className="modal-swatch"
                  style={{ backgroundColor: getColorDisplay(selectedColor) }}
                />
                <div className="modal-title">
                  <h2>{selectedColor.name}</h2>
                  <div className="color-details-modal">
                    {selectedColor.colorCode && (
                      <span><strong>Color Code:</strong> {selectedColor.colorCode}</span>
                    )}
                    {selectedColor.brand && (
                      <span><strong>Brand:</strong> {selectedColor.brand}</span>
                    )}
                    <span><strong>HEX:</strong> {getColorDisplay(selectedColor)}</span>
                    {selectedColor.category && (
                      <span><strong>Category:</strong> {selectedColor.category}</span>
                    )}
                    <span><strong>Saved:</strong> {formatDate(selectedColor.createdAt)}</span>
                    {selectedColor.updatedAt && (
                      <span><strong>Updated:</strong> {formatDate(selectedColor.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-body">
                <div className="mixing-section-modal">
                  <h3>Color Details</h3>
                  
                  <div className="volume-controls-modal">
                    <h4>Volume Settings</h4>
                    <div className="volume-inputs-modal">
                      <div className="input-group-modal">
                        <label>Amount</label>
                        <input 
                          type="number" 
                          min="0.1" 
                          max="100" 
                          step="0.1"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value) || 0.1)}
                        />
                      </div>
                      <div className="input-group-modal">
                        <label>Unit</label>
                        <select 
                          value={unit} 
                          onChange={(e) => setUnit(e.target.value)}
                        >
                          <option value="liter">Liters</option>
                          <option value="ml">Milliliters</option>
                          <option value="gallon">Gallons</option>
                        </select>
                      </div>
                    </div>
                    <div className="volume-equivalents-modal">
                      <span>{volumeInMl.toLocaleString()} ml</span>
                      <span>{(volumeInMl / 1000).toFixed(2)} liters</span>
                      {unit !== 'gallon' && <span>{(volumeInMl / 3785.41).toFixed(2)} gallons</span>}
                    </div>
                  </div>

                  {/* Paint Mix Section */}
                  {getPaintMix(selectedColor).length > 0 && (
                    <div className="mix-formula-simple">
                      <h4>📋 Required Paint Components:</h4>
                      <div className="paint-components-simple">
                        {getPaintMix(selectedColor).map((paint, index) => (
                          <div key={paint.id || index} className="paint-component-simple">
                            <div className="paint-color-indicator" style={{ backgroundColor: paint.color || '#cccccc' }}></div>
                            <div className="paint-info">
                              <span className="paint-name-simple">{paint.name}</span>
                              <span className="paint-description">{paint.description || 'Paint component'}</span>
                            </div>
                            <div className="paint-amounts-modal">
                              <span className="ratio-modal">{paint.ratio?.toFixed(1) || '0'}%</span>
                              <span className="volume-modal">{Math.round(paint.ml || 0)} ml</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="cost-estimate-modal">
                        {selectedColor.pricePerLiter && (
                          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6c757d' }}>
                            Base Price: ₱{selectedColor.pricePerLiter.toFixed(2)} per liter
                          </div>
                        )}
                        Estimated Cost: <strong>₱{(() => {
                          const mix = getPaintMix(selectedColor);
                          return mix.length > 0 
                            ? mix.reduce((sum, paint) => sum + (paint.ml * (paint.pricePerMl || 0)), 0).toFixed(2)
                            : (selectedColor.totalCost || 0).toFixed(2);
                        })()}</strong>
                      </div>

                      <div className="mixing-instructions">
                        <h4>👨‍🏫 Mixing Instructions:</h4>
                        <div className="steps-grid">
                          {getPaintMix(selectedColor).map((paint, index) => (
                            <div key={paint.id || index} className="step-card">
                              <div className="step-number">{index + 1}</div>
                              <div className="step-content">
                                <strong>Add {paint.name}</strong>
                                <p>Measure {Math.round(paint.ml || 0)} ml ({paint.ratio?.toFixed(1) || '0'}%) and mix thoroughly</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Surface Brands */}
                  {selectedColor.selectedBrands && Object.values(selectedColor.selectedBrands).some(brand => brand) && (
                    <div className="brands-section-modal">
                      <h4>Surface Brands</h4>
                      <div className="brands-list-modal">
                        {Object.entries(selectedColor.selectedBrands).map(([category, brand]) => (
                          brand && (
                            <span key={category} className="brand-tag-modal">
                              {category}: {brand}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="save-section-modal">
                    <h4>Update Colo Name</h4>
                    <div className="save-controls-modal">
                      <input
                        type="text"
                        placeholder="Update color name..."
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                        className="save-input-modal"
                      />
                      <button 
                        onClick={handleUpdateColor}
                        className="save-btn-modal"
                        disabled={!colorName.trim()}
                      >
                        💾 Update Color Name
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {editingColor && (
        <div className="edit-modal-overlay" onClick={() => setEditingColor(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={() => setEditingColor(null)}
            >
              ×
            </button>
            <div className="modal-content">
              <h3>Edit Color Name</h3>
              <div className="form-group">
                <label>Color Name:</label>
                <input
                  type="text"
                  value={editingColor.name}
                  onChange={(e) => setEditingColor({...editingColor, name: e.target.value})}
                  className="edit-input"
                />
              </div>
              <div className="modal-actions">
                <button onClick={handleSaveEdit} className="save-btn">Save Changes</button>
                <button onClick={() => setEditingColor(null)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}