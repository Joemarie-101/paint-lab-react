import { useState } from 'react';
import { useColorHistory } from '../context/ColorHistoryContext';
import './DetailsTab.css';

export default function DetailsTab() {
  const { savedColors, updateColor, deleteColor } = useColorHistory();
  const [editingColor, setEditingColor] = useState(null);
  const [showDetails, setShowDetails] = useState(null);

  const handleEditColor = (color) => {
    setEditingColor({ ...color });
  };

  const handleSaveEdit = () => {
    if (editingColor && editingColor.name.trim()) {
      updateColor(editingColor.id, {
        name: editingColor.name.trim(),
        ryb: editingColor.ryb,
        rgb: editingColor.rgb,
        exactColor: editingColor.exactColor,
        paintMix: editingColor.paintMix,
        volume: editingColor.volume,
        unit: editingColor.unit,
        totalCost: editingColor.totalCost,
        selectedBrands: editingColor.selectedBrands
      });
      setEditingColor(null);
    }
  };

  const handleDeleteColor = (id) => {
    if (window.confirm('Are you sure you want to delete this color?')) {
      deleteColor(id);
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

  return (
    <div className="details-tab">
      <h2>Color History & Details</h2>
      
      {savedColors.length === 0 ? (
        <div className="no-colors-message">
          <p>No colors saved yet. Go to Color Mixing section to create and save colors.</p>
        </div>
      ) : (
        <div className="colors-grid">
          {savedColors.map((color) => (
            <div key={color.id} className="color-card">
              <div className="color-header">
                <div 
                  className="color-swatch-large" 
                  style={{ backgroundColor: color.exactColor?.hex || `rgb(${color.rgb.join(',')})` }}
                />
                <div className="color-info">
                  <h3>{color.name}</h3>
                  <p className="color-date">{formatDate(color.createdAt)}</p>
                </div>
              </div>

              <div className="color-details">
                <div className="detail-row">
                  <span className="label">Exact Color:</span>
                  <div className="color-value">
                    <div 
                      className="exact-color-swatch" 
                      style={{ backgroundColor: color.exactColor?.hex || `rgb(${color.rgb.join(',')})` }}
                    />
                    <span>{color.exactColor?.hex || `rgb(${color.rgb.join(',')})`}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <span className="label">Volume:</span>
                  <span>{color.volume} {color.unit}</span>
                </div>

                {Object.values(color.selectedBrands).some(brand => brand) && (
                  <div className="detail-row">
                    <span className="label">Brands:</span>
                    <div className="brands-list">
                      {Object.entries(color.selectedBrands).map(([category, brand]) => (
                        brand && (
                          <span key={category} className="brand-tag-small">
                            {category}: {brand}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="color-actions">
                <button 
                  onClick={() => setShowDetails(showDetails === color.id ? null : color.id)}
                  className="details-btn"
                >
                  {showDetails === color.id ? 'Hide Details' : 'Show Details'}
                </button>
                <button 
                  onClick={() => handleEditColor(color)}
                  className="edit-btn"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDeleteColor(color.id)}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>

              {showDetails === color.id && (
                <div className="detailed-info">
                  <h4>Required Paints:</h4>
                  <div className="paint-list">
                    {color.paintMix.map((paint, i) => (
                      <div key={i} className="paint-recipe">
                        <div className="paint-info">
                          <div 
                            className="paint-swatch" 
                            style={{ backgroundColor: `rgb(${paint.rgb.join(',')})` }}
                          />
                          <span>{paint.name}</span>
                        </div>
                        <div className="paint-amounts">
                          <span>{paint.ratio.toFixed(1)}%</span>
                          <span>{Math.round(paint.ml)} ml</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="technical-details">
                    <h4>Technical Details:</h4>
                    <p><strong>RYB Values:</strong> {color.ryb.map(v => Math.round(v * 100)).join('%, ')}%</p>
                    <p><strong>RGB Values:</strong> rgb({color.rgb.join(', ')})</p>
                    <p><strong>Created:</strong> {formatDate(color.createdAt)}</p>
                    {color.updatedAt && (
                      <p><strong>Last Updated:</strong> {formatDate(color.updatedAt)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingColor && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Color</h3>
            <div className="form-group">
              <label>Color Name:</label>
              <input
                type="text"
                value={editingColor.name}
                onChange={(e) => setEditingColor({...editingColor, name: e.target.value})}
                className="edit-input"
              />
            </div>
            
            <div className="form-group">
              <label>Volume:</label>
              <input
                type="number"
                value={editingColor.volume}
                onChange={(e) => setEditingColor({...editingColor, volume: parseFloat(e.target.value) || 0})}
                className="edit-input"
              />
            </div>

            <div className="form-group">
              <label>Unit:</label>
              <select
                value={editingColor.unit}
                onChange={(e) => setEditingColor({...editingColor, unit: e.target.value})}
                className="edit-select"
              >
                <option value="ml">milliliters (ml)</option>
                <option value="liter">liters (L)</option>
                <option value="gallon">gallons (gal)</option>
                <option value="bucket">buckets (~10L)</option>
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={handleSaveEdit} className="save-btn">Save Changes</button>
              <button onClick={() => setEditingColor(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
