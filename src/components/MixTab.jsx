import { useState, useEffect } from 'react';
import { useBrand } from '../context/BrandContext';
import { useColorHistory } from '../context/ColorHistoryContext';
import { useAuth } from '../context/AuthContext';
import './MixTab.css';
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from '../firebase/config';

export default function MixTab() {
  const { selectedBrands } = useBrand();
  const { addColorToHistory } = useColorHistory();
  const { currentUser } = useAuth();
  const [brandColors, setBrandColors] = useState([]);
  const [filteredColors, setFilteredColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showColorModal, setShowColorModal] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // Volume states
  const [volume, setVolume] = useState(1);
  const [unit, setUnit] = useState('liter');
  const [colorName, setColorName] = useState('');

  // Fetch all brand colors from Firestore
  useEffect(() => {
    const fetchBrandColors = async () => {
      setLoading(true);
      try {
        const colorsRef = collection(db, 'brandColors');
        const q = query(colorsRef, orderBy('name'));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => {
          const data = d.data();
          // Ensure pricePerLiter is a number, not undefined
          const pricePerLiter = typeof data.pricePerLiter === 'number' ? data.pricePerLiter : (data.pricePerLiter ? parseFloat(data.pricePerLiter) : 0);
          return { 
            id: d.id, 
            ...data,
            hex: data.hex || '#cccccc',
            pricePerLiter: pricePerLiter // Explicitly set pricePerLiter
          };
        });
        console.log('📦 Fetched brand colors with prices:', items.slice(0, 3).map(c => ({ 
          name: c.name, 
          pricePerLiter: c.pricePerLiter,
          hasPrice: !!c.pricePerLiter 
        })));
        setBrandColors(items);
        setFilteredColors(items);
      } catch (error) {
        console.error('Error fetching brand colors:', error);
        setBrandColors([]);
        setFilteredColors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandColors();
    
    // Refresh colors every 10 seconds to catch admin updates
    const interval = setInterval(fetchBrandColors, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort colors
  useEffect(() => {
    let filtered = [...brandColors];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(color => 
        color.name?.toLowerCase().includes(query) ||
        color.brand?.toLowerCase().includes(query) ||
        color.colorCode?.toLowerCase().includes(query) ||
        color.category?.toLowerCase().includes(query)
      );
    }

    // Filter by selected brand
    const activeBrand = Object.values(selectedBrands).find(brand => brand);
    if (activeBrand && activeBrand !== 'all') {
      filtered = filtered.filter(color => 
        color.brand?.toLowerCase().includes(activeBrand.toLowerCase())
      );
    }

    // Sort colors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'lightness':
          return getLightness(a.hex) - getLightness(b.hex);
        case 'darkness':
          return getLightness(b.hex) - getLightness(a.hex);
        default:
          return 0;
      }
    });

    setFilteredColors(filtered);
  }, [brandColors, selectedBrands, searchQuery, sortBy]);

  const getLightness = (hex) => {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;
    return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
  };

  const unitConversions = {
    ml: 1,
    liter: 1000,
    gallon: 3785.41
  };
  const volumeInMl = volume * unitConversions[unit];

  // Get color-specific paint requirements based on color properties
  const getColorRequirements = (color) => {
    if (!color) return [];
    
    const hex = color.hex?.toLowerCase() || '#cccccc';
    const r = parseInt(hex.substr(1, 2), 16) || 0;
    const g = parseInt(hex.substr(3, 2), 16) || 0;
    const b = parseInt(hex.substr(5, 2), 16) || 0;
    
    // Get price from brandColor (pricePerLiter) or use default
    // pricePerLiter is in ₱ per liter (e.g., 20 means ₱20 per liter)
    // Convert pricePerLiter to pricePerMl (divide by 1000)
    const basePricePerLiter = color.pricePerLiter || 20; // Default 20 per liter
    const basePricePerMl = basePricePerLiter / 1000; // Convert to per ml
    
    console.log('💰 Price calculation:', {
      colorName: color.name,
      pricePerLiter: basePricePerLiter,
      pricePerMl: basePricePerMl,
      volumeInMl: volumeInMl
    });
    
    // Calculate component prices based on base price
    const whiteBasePrice = basePricePerMl; // Same as base
    const colorPigmentPrice = basePricePerMl * 0.75; // 75% of base
    const tintPrice = basePricePerMl * 0.9; // 90% of base
    const adjusterPrice = basePricePerMl * 0.6; // 60% of base
    const balancerPrice = basePricePerMl * 0.8; // 80% of base
    const thinnerPrice = basePricePerMl * 0.25; // 25% of base
    
    // Determine color characteristics
    const isDark = (r + g + b) < 384; // Dark color threshold
    const isWarm = r > g && r > b; // Red-dominated
    const isCool = b > r && b > g; // Blue-dominated
    const isGreen = g > r && g > b; // Green-dominated
    const isNeutral = Math.abs(r - g) < 30 && Math.abs(g - b) < 30; // Neutral/gray

    // Base components for all colors
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

    // Add specific color pigments based on color type
    if (isWarm) {
      baseComponents.push(
        { 
          id: 3,
          name: 'Red/Yellow Tint', 
          ratio: 15,
          description: 'Enhances warm tones (red, orange, yellow)',
          color: '#ff6b35',
          pricePerMl: tintPrice
        },
        { 
          id: 4,
          name: 'Warm Adjuster', 
          ratio: 10,
          description: 'Fine-tunes warm color balance',
          color: '#ffa726',
          pricePerMl: adjusterPrice
        }
      );
    } else if (isCool) {
      baseComponents.push(
        { 
          id: 3,
          name: 'Blue Tint', 
          ratio: 15,
          description: 'Enhances cool tones (blue, purple)',
          color: '#42a5f5',
          pricePerMl: tintPrice
        },
        { 
          id: 4,
          name: 'Cool Adjuster', 
          ratio: 10,
          description: 'Fine-tunes cool color balance',
          color: '#7e57c2',
          pricePerMl: adjusterPrice
        }
      );
    } else if (isGreen) {
      baseComponents.push(
        { 
          id: 3,
          name: 'Green Tint', 
          ratio: 15,
          description: 'Enhances green tones',
          color: '#66bb6a',
          pricePerMl: tintPrice
        },
        { 
          id: 4,
          name: 'Natural Adjuster', 
          ratio: 10,
          description: 'Balances natural green shades',
          color: '#9ccc65',
          pricePerMl: adjusterPrice
        }
      );
    } else if (isNeutral) {
      baseComponents.push(
        { 
          id: 3,
          name: 'Gray Balancer', 
          ratio: 15,
          description: 'Maintains neutral gray tones',
          color: '#90a4ae',
          pricePerMl: balancerPrice
        },
        { 
          id: 4,
          name: 'Tone Adjuster', 
          ratio: 10,
          description: 'Adjusts warm/cool undertones',
          color: '#b0bec5',
          pricePerMl: adjusterPrice
        }
      );
    } else {
      // Mixed colors
      baseComponents.push(
        { 
          id: 3,
          name: 'Color Balancer', 
          ratio: 15,
          description: 'Balances multiple color tones',
          color: '#78909c',
          pricePerMl: balancerPrice
        },
        { 
          id: 4,
          name: 'Universal Adjuster', 
          ratio: 10,
          description: 'Fine-tunes complex color mixes',
          color: '#b0bec5',
          pricePerMl: adjusterPrice
        }
      );
    }

    // Add thinner for all colors
    baseComponents.push(
      { 
        id: 5,
        name: 'Paint Thinner', 
        ratio: 5,
        description: 'Makes paint easy to mix and apply smoothly',
        color: '#eceff1',
        pricePerMl: thinnerPrice
      }
    );

    // Calculate ml amounts based on current volume
    return baseComponents.map(paint => ({
      ...paint,
      ml: volumeInMl * (paint.ratio / 100)
    }));
  };

  const paintMix = selectedColor ? getColorRequirements(selectedColor) : [];

  const handleSaveColor = async () => {
    if (!colorName.trim()) {
      alert('Please enter a name for your color');
      return;
    }

    if (!selectedColor) {
      alert('Please select a color first');
      return;
    }

    const colorData = {
      name: colorName.trim(),
      brandColorId: selectedColor.id,
      brandColorName: selectedColor.name,
      brand: selectedColor.brand,
      hex: selectedColor.hex,
      colorCode: selectedColor.colorCode,
      rgb: hexToRgb(selectedColor.hex),
      pricePerLiter: selectedColor.pricePerLiter, // Save price from brandColor
      paintMix: [...paintMix],
      volume: volume,
      unit: unit,
      totalCost: paintMix.reduce((sum, paint) => sum + (paint.ml * paint.pricePerMl), 0),
      selectedBrands: { ...selectedBrands },
      createdAt: new Date().toISOString(),
      userId: currentUser?.uid,
      userEmail: currentUser?.email
    };

    try {
      await addColorToHistory(colorData);
      setColorName('');
      setShowColorModal(false);
      alert('Color saved to your collection successfully!');
    } catch (error) {
      alert('Error saving color: ' + error.message);
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  const handleColorClick = (color) => {
    console.log('🎨 Color selected:', {
      name: color.name,
      pricePerLiter: color.pricePerLiter,
      id: color.id
    });
    setSelectedColor(color);
    setShowColorModal(true);
  };

  // Get color type description
  const getColorType = (color) => {
    if (!color) return '';
    const hex = color.hex.toLowerCase();
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    const isWarm = r > g && r > b;
    const isCool = b > r && b > g;
    const isGreen = g > r && g > b;
    const isNeutral = Math.abs(r - g) < 30 && Math.abs(g - b) < 30;

    if (isNeutral) return 'Neutral/Gray Color';
    if (isWarm) return 'Warm Color (Red/Orange/Yellow)';
    if (isCool) return 'Cool Color (Blue/Purple)';
    if (isGreen) return 'Green/Natural Color';
    return 'Mixed Complex Color';
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="mix-tab-website">
      {/* Filters Bar */}
      <section className="filters-bar">
        <div className="container">
          <div className="filters-content">
            <div className="filter-group search-group">
              <label>Search Colors</label>
              <div className="search-input-container">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, code, or category..."
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={clearSearch}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="brand">Brand</option>
                <option value="lightness">Light to Dark</option>
                <option value="darkness">Dark to Light</option>
              </select>
            </div>

            <div className="active-brand">
              {(() => {
                const activeBrandEntry = Object.entries(selectedBrands).find(([category, brand]) => brand);
                
                if (activeBrandEntry) {
                  const [category, brand] = activeBrandEntry;
                  return (
                    <span key={category} className="brand-badge">
                      {brand}
                    </span>
                  );
                }
                
                return (
                  <span className="brand-badge inactive">
                    No brand selected
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Colors Grid Section */}
      <section className="colors-section">
        <div className="container">
          <div className="section-header">
            <h2>Paint Color Collection</h2>
            <div className="results-info">
              <span className="results-count">
                {filteredColors.length} colors found
                {searchQuery && (
                  <span className="search-query"> for "{searchQuery}"</span>
                )}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Loading our color collection...</p>
            </div>
          ) : (
            <>
              <div className="colors-grid-website">
                {filteredColors.map((color) => (
                  <div
                    key={color.id}
                    className="color-card-website"
                    onClick={() => handleColorClick(color)}
                  >
                    <div 
                      className="color-swatch-large"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="color-info-website">
                      <h3 className="color-name-website">{color.name}</h3>
                      <div className="color-meta">
                        <span className="color-code-website">{color.colorCode}</span>
                        <span className="color-brand-website">{color.brand}</span>
                      </div>
                      {color.category && (
                        <div className="color-category-tag">{color.category}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredColors.length === 0 && !loading && (
                <div className="no-colors-section">
                  <h3>No colors found</h3>
                  <p>
                    {searchQuery 
                      ? `No colors match "${searchQuery}". Try searching with different terms.`
                      : 'No colors match your current filters. Try adjusting your search or filters.'
                    }
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    className="reset-filters-btn"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div className="modal-title">
                  <h2>{selectedColor.name}</h2>
                  <div className="color-type-badge">
                    {getColorType(selectedColor)}
                  </div>
                  <div className="color-details-modal">
                    <span><strong>Color Code:</strong> {selectedColor.colorCode}</span>
                    <span><strong>Brand:</strong> {selectedColor.brand}</span>
                    <span><strong>HEX:</strong> {selectedColor.hex}</span>
                    {selectedColor.pricePerLiter && (
                      <span><strong>Price per Liter:</strong> ₱{selectedColor.pricePerLiter.toFixed(2)}</span>
                    )}
                    {selectedColor.category && (
                      <span><strong>Category:</strong> {selectedColor.category}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-body">
                <div className="mixing-section-modal">
                  <h3>🎨 Custom Paint Mixing Formula</h3>
                  
                  <div className="color-analysis">
                    <h4>🔍 Color Analysis:</h4>
                    <p>This is a <strong>{getColorType(selectedColor).toLowerCase()}</strong>. The formula below is specifically tailored for this color type.</p>
                  </div>

                  {/* Volume Settings - KEEP THIS SECTION */}
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

                  <div className="mix-formula-simple">
                    <h4>📋 Required Paint Components:</h4>
                    <div className="paint-components-simple">
                      {paintMix.map((paint, index) => (
                        <div key={index} className="paint-component-simple">
                          <div className="paint-color-indicator" style={{ backgroundColor: paint.color }}></div>
                          <div className="paint-info">
                            <span className="paint-name-simple">{paint.name}</span>
                            <span className="paint-description">{paint.description}</span>
                          </div>
                          <div className="paint-amounts-modal">
                            <span className="ratio-modal">{paint.ratio}%</span>
                            <span className="volume-modal">{Math.round(paint.ml)} ml</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cost-estimate-modal">
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6c757d' }}>
                        Base Price: ₱{(selectedColor.pricePerLiter || 20).toFixed(2)} per liter
                        {selectedColor.pricePerLiter === 0 && (
                          <span style={{ color: '#e74c3c', marginLeft: '0.5rem' }}>
                            (Using default - set price in admin panel)
                          </span>
                        )}
                      </div>
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#6c757d' }}>
                        Total Volume: {volumeInMl.toLocaleString()} ml ({volume} {unit})
                      </div>
                      Estimated Cost: <strong>₱{paintMix.reduce((sum, paint) => 
                        sum + (paint.ml * paint.pricePerMl), 0).toFixed(2)
                      }</strong>
                    </div>

                    <div className="mixing-instructions">
                      <h4>👨‍🏫 Mixing Instructions:</h4>
                      <div className="steps-grid">
                        {paintMix.map((paint, index) => (
                          <div key={index} className="step-card">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                              <strong>Add {paint.name}</strong>
                              <p>Measure {Math.round(paint.ml)} ml ({paint.ratio}%) and mix thoroughly</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="color-specific-tips">
                      <h4>🎯 Tips for {getColorType(selectedColor)}:</h4>
                      <div className="tips-content">
                        {getColorType(selectedColor).includes('Warm') && (
                          <ul>
                            <li>🔥 Warm colors may need extra stirring to blend red/yellow pigments</li>
                            <li>☀️ Test in natural light - warm colors change appearance in different lighting</li>
                            <li>🎨 Start with less pigment - warm colors can become overwhelming quickly</li>
                          </ul>
                        )}
                        {getColorType(selectedColor).includes('Cool') && (
                          <ul>
                            <li>💧 Cool colors mix well but may appear darker when dry</li>
                            <li>🌙 They often look best in artificial or low lighting conditions</li>
                            <li>🔄 Mix blue pigments slowly to avoid overwhelming other colors</li>
                          </ul>
                        )}
                        {getColorType(selectedColor).includes('Green') && (
                          <ul>
                            <li>🌿 Green pigments can be strong - add gradually</li>
                            <li>🍃 Natural greens work well with both warm and cool lighting</li>
                            <li>🎨 Green often needs careful balancing with yellow/blue undertones</li>
                          </ul>
                        )}
                        {getColorType(selectedColor).includes('Neutral') && (
                          <ul>
                            <li>⚫ Gray tones require precise measurement for consistency</li>
                            <li>🏠 Test on large surfaces - neutrals show variations easily</li>
                            <li>🎭 Small adjustments make big differences in neutral colors</li>
                          </ul>
                        )}
                        {getColorType(selectedColor).includes('Mixed') && (
                          <ul>
                            <li>🌈 Complex colors need extra mixing time</li>
                            <li>📏 Measure all components precisely for consistent results</li>
                            <li>🔍 Check color from different angles and lighting conditions</li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="save-section-modal">
                    <h4>💾 Save This Custom Formula</h4>
                    <p className="save-description">Save this specific formula for "{selectedColor.name}" to use later</p>
                    <div className="save-controls-modal">
                      <input
                        type="text"
                        placeholder={`My ${selectedColor.name} Mix...`}
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                        className="save-input-modal"
                      />
                      <button 
                        onClick={handleSaveColor}
                        className="save-btn-modal"
                        disabled={!colorName.trim()}
                      >
                        💾 Save Color Formula
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}