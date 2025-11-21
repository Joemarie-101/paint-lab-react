// components/PaintCalculator.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import './PaintCalculator.css';

const optimizeCanSizes = (cans, sizes) => {
  const optimized = { ...cans };
  const sorted = [...sizes].sort((a, b) => a - b);
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const smaller = sorted[i];
    const larger = sorted[i + 1];
    
    if (optimized[smaller] && smaller * optimized[smaller] >= larger) {
      const howManyLarger = Math.floor((smaller * optimized[smaller]) / larger);
      optimized[larger] = (optimized[larger] || 0) + howManyLarger;
      optimized[smaller] = optimized[smaller] - Math.ceil((larger * howManyLarger) / smaller);
      
      if (optimized[smaller] <= 0) {
        delete optimized[smaller];
      }
    }
  }
  
  return optimized;
};

const calculateCanSizes = (gallons, sizes) => {
  let remaining = gallons;
  const cans = {};
  
  // Sort sizes in descending order
  const sortedSizes = [...sizes].sort((a, b) => b - a);
  
  sortedSizes.forEach(size => {
    cans[size] = Math.floor(remaining / size);
    remaining = remaining % size;
  });
  
  // If there's remaining paint, add one more of the smallest can
  if (remaining > 0) {
    const smallestCan = sortedSizes[sortedSizes.length - 1];
    cans[smallestCan] = (cans[smallestCan] || 0) + 1;
  }
  
  return optimizeCanSizes(cans, sortedSizes);
};

export default function PaintCalculator() {
  const [roomType, setRoomType] = useState('bedroom');
  const [roomDimensions, setRoomDimensions] = useState({
    length: 4,
    width: 3,
    height: 2.7
  });
  const [windows, setWindows] = useState(1);
  const [doors, setDoors] = useState(1);
  const [coats, setCoats] = useState(2);
  const [paintBrand, setPaintBrand] = useState('boysen');
  const [paintProduct, setPaintProduct] = useState('flat');
  const [surfaceType, setSurfaceType] = useState('smooth');
  const [includeCeiling, setIncludeCeiling] = useState(true);
  const [includeWalls, setIncludeWalls] = useState(true);
  const [wastagePercentage, setWastagePercentage] = useState(10);
  const [results, setResults] = useState(null);

  // Enhanced room type presets with realistic coverage adjustments
  const roomTypes = useMemo(() => ({
    bedroom: { 
      name: 'Bedroom', 
      coverageMultiplier: 1.0,
      typicalWindows: 1,
      typicalDoors: 1
    },
    living: { 
      name: 'Living Room', 
      coverageMultiplier: 0.95,
      typicalWindows: 2,
      typicalDoors: 1
    },
    kitchen: { 
      name: 'Kitchen', 
      coverageMultiplier: 0.85,
      typicalWindows: 1,
      typicalDoors: 1
    },
    bathroom: { 
      name: 'Bathroom', 
      coverageMultiplier: 0.75,
      typicalWindows: 1,
      typicalDoors: 1
    },
    exterior: { 
      name: 'Exterior Wall', 
      coverageMultiplier: 1.1,
      typicalWindows: 0,
      typicalDoors: 0
    },
    custom: { 
      name: 'Custom Room', 
      coverageMultiplier: 1.0,
      typicalWindows: 1,
      typicalDoors: 1
    }
  }), []);

  // Paint brands with their specific products
  const paintBrands = useMemo(() => ({
    boysen: {
      name: 'Boysen',
      products: {
        flat: { name: 'Boysen Flat Latex', coverage: 40, pricePerGallon: 650, requiresPrimer: false },
        semiGloss: { name: 'Boysen Semi-Gloss', coverage: 35, pricePerGallon: 720, requiresPrimer: true },
        gloss: { name: 'Boysen Gloss', coverage: 30, pricePerGallon: 780, requiresPrimer: true },
        masonry: { name: 'Boysen Masonry', coverage: 25, pricePerGallon: 850, requiresPrimer: false },
        quickDry: { name: 'Boysen Quick Dry', coverage: 35, pricePerGallon: 680, requiresPrimer: false }
      }
    },
    davids: {
      name: 'Davids',
      products: {
        premium: { name: 'Davids Premium', coverage: 45, pricePerGallon: 580, requiresPrimer: false },
        master: { name: 'Davids Master', coverage: 38, pricePerGallon: 620, requiresPrimer: false },
        exterior: { name: 'Davids Exterior', coverage: 28, pricePerGallon: 720, requiresPrimer: true },
        enamel: { name: 'Davids Enamel', coverage: 32, pricePerGallon: 750, requiresPrimer: true },
        eco: { name: 'Davids Eco', coverage: 42, pricePerGallon: 550, requiresPrimer: false }
      }
    },
    rian: {
      name: 'Rian/Shine',
      products: {
        shinePlus: { name: 'Rian Shine Plus', coverage: 36, pricePerGallon: 520, requiresPrimer: false },
        superWhite: { name: 'Rian Super White', coverage: 40, pricePerGallon: 480, requiresPrimer: false },
        exteriorPro: { name: 'Rian Exterior Pro', coverage: 26, pricePerGallon: 620, requiresPrimer: true },
        glossPro: { name: 'Rian Gloss Pro', coverage: 28, pricePerGallon: 580, requiresPrimer: true },
        quickCoat: { name: 'Rian Quick Coat', coverage: 38, pricePerGallon: 500, requiresPrimer: false }
      }
    }
  }), []);

  // Surface types with descriptions
  const surfaceTypes = useMemo(() => ({
    smooth: { name: 'Smooth (plasterboard, finished plaster)', multiplier: 1.0 },
    textured: { name: 'Textured (light texture, orange peel)', multiplier: 0.85 },
    rough: { name: 'Rough (brick, concrete, heavy texture)', multiplier: 0.7 },
    porous: { name: 'Porous (unsealed drywall, bare wood)', multiplier: 0.6 }
  }), []);

  // Standard opening sizes (in square meters)
  const openingSizes = useMemo(() => ({
    standardDoor: 1.9,
    largeDoor: 2.5,
    standardWindow: 1.5,
    largeWindow: 2.5,
    smallWindow: 0.8
  }), []);

  // Set default product when brand changes
  useEffect(() => {
    const brandProducts = paintBrands[paintBrand].products;
    const firstProduct = Object.keys(brandProducts)[0];
    setPaintProduct(firstProduct);
  }, [paintBrand, paintBrands]);

  const calculatePaint = useCallback(() => {
    // Guard clause to prevent calculation if product data isn't available
    if (!paintProduct || !paintBrands[paintBrand]?.products?.[paintProduct]) {
      return;
    }

    const { length, width, height } = roomDimensions;
    
    let totalArea = 0;

    // Calculate wall area if included
    if (includeWalls) {
      const wallArea = 2 * (length * height) + 2 * (width * height);
      totalArea += wallArea;
    }

    // Calculate ceiling area if included
    if (includeCeiling) {
      const ceilingArea = length * width;
      totalArea += ceilingArea;
    }

    // Calculate openings
    const doorArea = doors * openingSizes.standardDoor;
    const windowArea = windows * openingSizes.standardWindow;
    const totalOpenings = doorArea + windowArea;

    // Total paintable area
    const paintableArea = Math.max(0, totalArea - totalOpenings);
    
    // Get paint product info with safety checks
    const brandInfo = paintBrands[paintBrand];
    const productInfo = brandInfo.products[paintProduct];
    const surfaceMultiplier = surfaceTypes[surfaceType].multiplier;
    const roomMultiplier = roomTypes[roomType].coverageMultiplier;
    
    // Convert coverage from sqm/gallon to sqm/liter and apply adjustments
    const coveragePerGallon = productInfo.coverage;
    const coveragePerLiter = coveragePerGallon / 3.785; // Convert gallons to liters
    const adjustedCoverage = coveragePerLiter * surfaceMultiplier * roomMultiplier;
    
    // Calculate required paint (in liters) with wastage
    const baseLiters = (paintableArea / adjustedCoverage) * coats;
    const wastageLiters = baseLiters * (wastagePercentage / 100);
    const requiredLiters = baseLiters + wastageLiters;
    
    // Calculate required gallons for purchasing
    const requiredGallons = requiredLiters / 3.785;
    
    // Calculate cost
    const pricePerGallon = productInfo.pricePerGallon;
    const totalCost = requiredGallons * pricePerGallon;
    
    // Calculate primer if needed
    let primerGallons = 0;
    let primerCost = 0;
    if (productInfo.requiresPrimer) {
      primerGallons = (paintableArea / (35 / 3.785)) * 1; // One coat of primer
      primerCost = primerGallons * 450; // Average primer price per gallon
    }
    
    // Recommended can sizes (in gallons)
    const canSizes = [1, 4, 16]; // 1-gallon, 4-gallon, 16-gallon
    const recommendedCans = calculateCanSizes(requiredGallons, canSizes);
    const primerCans = productInfo.requiresPrimer ? calculateCanSizes(primerGallons, canSizes) : null;
    
    setResults({
      paintableArea: Math.round(paintableArea * 10) / 10,
      requiredLiters: Math.round(requiredLiters * 10) / 10,
      requiredGallons: Math.round(requiredGallons * 10) / 10,
      totalCost: Math.round(totalCost * 100) / 100,
      coats,
      recommendedCans,
      primerRequired: productInfo.requiresPrimer,
      primerGallons: Math.round(primerGallons * 10) / 10,
      primerCost: Math.round(primerCost * 100) / 100,
      primerCans,
      adjustedCoverage: Math.round(adjustedCoverage * 10) / 10,
      totalWithPrimer: Math.round((totalCost + primerCost) * 100) / 100,
      pricePerGallon
    });
  }, [
    paintProduct,
    paintBrands,
    paintBrand,
    roomDimensions,
    includeWalls,
    includeCeiling,
    doors,
    windows,
    openingSizes,
    surfaceTypes,
    surfaceType,
    roomTypes,
    roomType,
    coats,
    wastagePercentage
  ]);

  useEffect(() => {
    calculatePaint();
  }, [calculatePaint]);

  // Set typical values when room type changes
  useEffect(() => {
    if (roomType !== 'custom') {
      const typical = roomTypes[roomType];
      setWindows(typical.typicalWindows);
      setDoors(typical.typicalDoors);
    }
  }, [roomType, roomTypes]);

  const handleDimensionChange = (dimension, value) => {
    setRoomDimensions(prev => ({
      ...prev,
      [dimension]: parseFloat(value) || 0
    }));
  };

  const resetCalculator = () => {
    setRoomType('bedroom');
    setRoomDimensions({
      length: 4,
      width: 3,
      height: 2.7
    });
    setWindows(1);
    setDoors(1);
    setCoats(2);
    setPaintBrand('boysen');
    setPaintProduct('flat');
    setSurfaceType('smooth');
    setIncludeCeiling(true);
    setIncludeWalls(true);
    setWastagePercentage(10);
  };

  // Safe access to current product data
  const currentBrand = paintBrands[paintBrand] || paintBrands.boysen;
  const currentProduct = currentBrand.products[paintProduct] || currentBrand.products[Object.keys(currentBrand.products)[0]];

  return (
    <div className="paint-calculator">
      <div className="calculator-header">
        <h1>Philippine Paint Calculator</h1>
        <p>Calculate exactly how much paint you need for your project</p>
      </div>

      <div className="calculator-container">
        {/* Input Section */}
        <div className="input-section">
          <div className="calculator-card">
            <h2>Room Details</h2>
            
            <div className="form-group">
              <label>Room Type</label>
              <select 
                value={roomType} 
                onChange={(e) => setRoomType(e.target.value)}
                className="form-select"
              >
                {Object.entries(roomTypes).map(([key, room]) => (
                  <option key={key} value={key}>{room.name}</option>
                ))}
              </select>
            </div>

            <div className="dimensions-grid">
              <div className="form-group">
                <label>Length (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={roomDimensions.length}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Width (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={roomDimensions.width}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Height (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={roomDimensions.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="surface-options">
              <div className="form-group">
                <label>Surface Type</label>
                <select 
                  value={surfaceType} 
                  onChange={(e) => setSurfaceType(e.target.value)}
                  className="form-select"
                >
                  {Object.entries(surfaceTypes).map(([key, surface]) => (
                    <option key={key} value={key}>{surface.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="openings-grid">
              <div className="form-group">
                <label>Number of Windows</label>
                <input
                  type="number"
                  min="0"
                  value={windows}
                  onChange={(e) => setWindows(parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Number of Doors</label>
                <input
                  type="number"
                  min="0"
                  value={doors}
                  onChange={(e) => setDoors(parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="coverage-options">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeWalls}
                    onChange={(e) => setIncludeWalls(e.target.checked)}
                  />
                  Include Walls
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeCeiling}
                    onChange={(e) => setIncludeCeiling(e.target.checked)}
                  />
                  Include Ceiling
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Number of Coats</label>
              <select 
                value={coats} 
                onChange={(e) => setCoats(parseInt(e.target.value))}
                className="form-select"
              >
                <option value="1">1 Coat (light refresh)</option>
                <option value="2">2 Coats (Recommended)</option>
                <option value="3">3 Coats (dark colors, major change)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Paint Brand</label>
              <select 
                value={paintBrand} 
                onChange={(e) => setPaintBrand(e.target.value)}
                className="form-select"
              >
                {Object.entries(paintBrands).map(([key, brand]) => (
                  <option key={key} value={key}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Paint Product</label>
              <select 
                value={paintProduct} 
                onChange={(e) => setPaintProduct(e.target.value)}
                className="form-select"
              >
                {currentBrand && Object.entries(currentBrand.products).map(([key, product]) => (
                  <option key={key} value={key}>{product.name}</option>
                ))}
              </select>
              {currentProduct && (
                <small className="paint-info">
                  Coverage: {currentProduct.coverage} m²/gallon • 
                  Price: ₱{currentProduct.pricePerGallon}/gallon
                  {currentProduct.requiresPrimer && ' • Primer Required'}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Wastage & Touch-ups</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="5"
                  value={wastagePercentage}
                  onChange={(e) => setWastagePercentage(parseInt(e.target.value))}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>10%</span>
                  <span>20%</span>
                </div>
                <div className="slider-value">{wastagePercentage}% extra</div>
              </div>
            </div>

            <button onClick={resetCalculator} className="reset-btn">
              🔄 Reset Calculator
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {results && (
            <div className="results-card">
              <h2>Calculation Results</h2>
              
              <div className="results-grid">
                <div className="result-item">
                  <div className="result-label">Paintable Area</div>
                  <div className="result-value">{results.paintableArea} m²</div>
                </div>
                
                <div className="result-item">
                  <div className="result-label">Adjusted Coverage</div>
                  <div className="result-value">{results.adjustedCoverage} m²/L</div>
                </div>
                
                <div className="result-item">
                  <div className="result-label">Required Paint</div>
                  <div className="result-value">
                    {results.requiredLiters} L ({results.requiredGallons} gallons)
                  </div>
                </div>
                
                <div className="result-item">
                  <div className="result-label">Number of Coats</div>
                  <div className="result-value">{results.coats}</div>
                </div>
                
                <div className="result-item highlight">
                  <div className="result-label">Paint Cost</div>
                  <div className="result-value">₱{results.totalCost}</div>
                </div>

                {results.primerRequired && (
                  <>
                    <div className="result-item">
                      <div className="result-label">Primer Required</div>
                      <div className="result-value">{results.primerGallons} gallons</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Primer Cost</div>
                      <div className="result-value">₱{results.primerCost}</div>
                    </div>
                    <div className="result-item highlight">
                      <div className="result-label">Total Cost</div>
                      <div className="result-value">₱{results.totalWithPrimer}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Recommended Paint Cans */}
              <div className="cans-recommendation">
                <h3>Recommended Paint Cans</h3>
                <div className="cans-grid">
                  {Object.entries(results.recommendedCans)
                    .filter(([size, count]) => count > 0)
                    .map(([size, count]) => (
                      <div key={size} className="can-item">
                        <div className="can-size">{size}-gallon</div>
                        <div className="can-count">× {count}</div>
                        <div className="can-price">₱{Math.round(count * size * results.pricePerGallon * 100) / 100}</div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Primer Cans if needed */}
              {results.primerRequired && results.primerCans && (
                <div className="cans-recommendation">
                  <h3>Recommended Primer Cans</h3>
                  <div className="cans-grid">
                    {Object.entries(results.primerCans)
                      .filter(([size, count]) => count > 0)
                      .map(([size, count]) => (
                        <div key={size} className="can-item primer">
                          <div className="can-size">{size}-gallon</div>
                          <div className="can-count">× {count}</div>
                          <div className="can-price">₱{count * size * 450}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Paint Summary */}
              <div className="paint-summary">
                <h3>Project Summary</h3>
                <div className="paint-details">
                  <strong>{currentProduct?.name}</strong> on {surfaceTypes[surfaceType].name}
                  <br />
                  Effective Coverage: {results.adjustedCoverage} m² per liter
                  <br />
                  Wastage allowance: {wastagePercentage}%
                  {results.primerRequired && (
                    <>
                      <br />
                      <strong>Primer required for best results</strong>
                    </>
                  )}
                </div>
              </div>

              {/* Contextual Tips */}
              <div className="tips-section">
                <h3>💡 Pro Tips</h3>
                <ul className="tips-list">
                  {surfaceType !== 'smooth' && (
                    <li>Consider using a roller with longer nap for {surfaceType} surfaces</li>
                  )}
                  {currentProduct?.requiresPrimer && (
                    <li>Apply primer before painting for better adhesion and coverage</li>
                  )}
                  {coats === 1 && (
                    <li>For best results with 1 coat, use a paint+primer combo product</li>
                  )}
                  <li>Buy all your paint at once for color consistency</li>
                  <li>Keep extra paint for future touch-ups and repairs</li>
                  <li>Stir paint thoroughly before and during use</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
