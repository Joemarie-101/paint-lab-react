import { useState, useEffect, useRef } from 'react';
import { useBrand } from '../context/BrandContext';
import { useColorHistory } from '../context/ColorHistoryContext';
import './MixTab.css';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export default function MixTab() {
  const { selectedBrands } = useBrand();
  const { addColorToHistory } = useColorHistory();
  const [recommendations, setRecommendations] = useState([]);
  
  const canvasRef = useRef(null);
  const [ryb, setRyb] = useState([1, 0, 0]);
  const [volume, setVolume] = useState(500);
  const [unit, setUnit] = useState('ml');
  const [markerPos, setMarkerPos] = useState({ x: 100, y: 100 });
  const [colorName, setColorName] = useState('');
  const [exactColor, setExactColor] = useState(null);

  // Base paint colors with CRUD functionality
  const [basePaints] = useState([
    { id: 1, name: 'Cadmium Red', ryb: [1, 0, 0], pricePerMl: 0.02, type: 'pigment' },
    { id: 2, name: 'Lemon Yellow', ryb: [0, 1, 0], pricePerMl: 0.015, type: 'pigment' },
    { id: 3, name: 'Ultramarine Blue', ryb: [0, 0, 1], pricePerMl: 0.025, type: 'pigment' },
    { id: 4, name: 'Titanium White', ryb: [0, 0, 0], pricePerMl: 0.01, type: 'mixer' },
    { id: 5, name: 'Mars Black', ryb: [0.1, 0.1, 0.1], pricePerMl: 0.01, type: 'mixer' }
  ]);

  // Fetch brand color recommendations based on selected brand and current color
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const activeBrand = selectedBrands.wood || selectedBrands.steel || selectedBrands.cement;
        if (!activeBrand) { setRecommendations([]); return; }
        const rgb = rybToRgb(ryb).map(v => Math.round(v * 255));
        const colorsRef = collection(db, 'brandColors');
        const q = query(colorsRef, where('brand', '==', activeBrand), limit(20));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // naive: just take first 6 for now; in real impl we could color-distance sort
        setRecommendations(items.slice(0, 6));
      } catch (_) {
        setRecommendations([]);
      }
    };
    fetchRecs();
  }, [selectedBrands, ryb]);

  const unitConversions = {
    ml: 1,
    liter: 1000,
    gallon: 3785.41,
    bucket: 10000
  };
  const volumeInMl = volume * unitConversions[unit];

  // RYB → RGB approximation
  const rybToRgb = (ryb) => {
    const [r, y, b] = ryb;
    return [
      Math.min(1, r + y * 0.5),
      Math.min(1, y + b * 0.3),
      Math.min(1, b + r * 0.1)
    ];
  };

  // Polar → RYB
  const polarToRyb = (angle, r) => {
    angle = angle % 360;
    const sector = Math.floor(angle / 120);
    const sectorAngle = angle % 120;

    let ryb = [0, 0, 0];
    if (sector === 0) ryb = [1 - sectorAngle / 120, sectorAngle / 120, 0];
    else if (sector === 1) ryb = [0, 1 - sectorAngle / 120, sectorAngle / 120];
    else ryb = [sectorAngle / 120, 0, 1 - sectorAngle / 120];

    return ryb.map(v => v * r * 3);
  };

  // Canvas click/drag
  const handleCanvasInteraction = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    const angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const radius = Math.min(1, Math.sqrt(x * x + y * y) / (canvas.width / 2));

  if (radius <= 1) {
    const newRyb = polarToRyb(angle, radius);
      setRyb(newRyb);
      setMarkerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(e.clientX - rect.left, e.clientY - rect.top, 1, 1);
    const [red, green, blue] = imageData.data;
    setExactColor({
      r: red,
      g: green,
      b: blue,
      hex: `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`
    });
  }
};


  // 🎨 Realistic mixing
  const calculateRealisticMix = () => {
    const total = Math.max(0.001, ryb.reduce((a, b) => a + b, 0));
    const targetRyb = ryb.map(v => v / total);

    const pigments = basePaints.filter(p => p.type === 'pigment');
    const mixers = basePaints.filter(p => p.type === 'mixer');

    // Find two closest pigments in RYB space
    const distances = pigments.map(p => {
      const dist = Math.sqrt(
        Math.pow(p.ryb[0] - targetRyb[0], 2) +
        Math.pow(p.ryb[1] - targetRyb[1], 2) +
        Math.pow(p.ryb[2] - targetRyb[2], 2)
      );
      return { pigment: p, dist };
    }).sort((a, b) => a.dist - b.dist);

    const primary = distances[0].pigment;
    const secondary = distances[1].pigment;
    const totalDist = distances[0].dist + distances[1].dist;
    const ratioPrimary = totalDist === 0 ? 0.5 : distances[1].dist / totalDist;
    const ratioSecondary = 1 - ratioPrimary;

    let requiredPigments = [
      { ...primary, ratio: ratioPrimary * 100, ml: ratioPrimary * volumeInMl },
      { ...secondary, ratio: ratioSecondary * 100, ml: ratioSecondary * volumeInMl }
    ];

    // Luminance for light/dark adjustment
    const rgb = rybToRgb(targetRyb);
    const luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
    const white = mixers.find(m => m.name.includes('White'));
    const black = mixers.find(m => m.name.includes('Black'));

    if (luminance < 0.15) {
      const blackAmount = (0.15 - luminance) * 2 * volumeInMl;
      requiredPigments.push({ ...black, ratio: (blackAmount / volumeInMl) * 100, ml: blackAmount });
    } else if (luminance > 0.85) {
      const whiteAmount = (luminance - 0.85) * 2 * volumeInMl;
      requiredPigments.push({ ...white, ratio: (whiteAmount / volumeInMl) * 100, ml: whiteAmount });
    }

    // Normalize ratios
    const totalRatio = requiredPigments.reduce((s, p) => s + p.ratio, 0);
    return requiredPigments.map(p => ({
      ...p,
      ratio: (p.ratio / totalRatio) * 100,
      ml: (p.ratio / totalRatio) * volumeInMl,
      rgb: rybToRgb(p.ryb).map(v => Math.round(v * 255))
    })).sort((a, b) => b.ratio - a.ratio);
  };

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;
    const center = radius;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let angle = 0; angle < 360; angle++) {
      for (let r = 0; r < radius; r++) {
        const rad = angle * Math.PI / 180;
        const x = center + r * Math.cos(rad);
        const y = center + r * Math.sin(rad);

        const rybColor = polarToRyb(angle, r / radius);
        const rgbColor = rybToRgb(rybColor);

        ctx.fillStyle = `rgb(${Math.round(rgbColor[0] * 255)},${Math.round(rgbColor[1] * 255)},${Math.round(rgbColor[2] * 255)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    ctx.beginPath();
    ctx.arc(markerPos.x, markerPos.y, 5, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = `rgb(${rybToRgb(ryb).map(v => Math.round(v * 255)).join(',')})`;
    ctx.fill();
  }, [ryb, markerPos]);

  const mixedColor = `rgb(${rybToRgb(ryb).map(v => Math.round(v * 255)).join(',')})`;
  const paintMix = calculateRealisticMix();

  // Generate Tint/Tone/Shade variants and suggested mixer additions
  const variants = (() => {
    const [r, g, b] = rybToRgb(ryb).map(v => Math.round(v * 255));
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

    const toHex = (rr, gg, bb) => `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;

    const mixers = {
      white: basePaints.find(p => p.name.includes('White')),
      black: basePaints.find(p => p.name.includes('Black'))
    };

    const percent = 0.2; // 20% adjustment suggestion
    const mlWhite = mixers.white ? Math.round(volumeInMl * percent) : 0;
    const mlBlack = mixers.black ? Math.round(volumeInMl * percent) : 0;
    const mlGrayEach = mixers.white && mixers.black ? Math.round((volumeInMl * percent) / 2) : 0;

    // Tint: add white (towards 255)
    const tint = {
      label: 'Tint (lighter)',
      hex: toHex(clamp(r + (255 - r) * percent), clamp(g + (255 - g) * percent), clamp(b + (255 - b) * percent)),
      suggestion: mixers.white ? `Add ~${mlWhite} ml ${mixers.white.name}` : 'Add white mixer (not available)'
    };

    // Shade: add black (towards 0)
    const shade = {
      label: 'Shade (darker)',
      hex: toHex(clamp(r * (1 - percent)), clamp(g * (1 - percent)), clamp(b * (1 - percent))),
      suggestion: mixers.black ? `Add ~${mlBlack} ml ${mixers.black.name}` : 'Add black mixer (not available)'
    };

    // Tone: add gray (white+black)
    const midGray = 128;
    const tone = {
      label: 'Tone (muted)',
      hex: toHex(clamp(r + (midGray - r) * percent), clamp(g + (midGray - g) * percent), clamp(b + (midGray - b) * percent)),
      suggestion: mixers.white && mixers.black
        ? `Add ~${mlGrayEach} ml ${mixers.white.name} + ~${mlGrayEach} ml ${mixers.black.name}`
        : 'Add gray (white + black) mixers'
    };

    return [tint, tone, shade];
  })();

  const handleSaveColor = () => {
    if (!colorName.trim()) {
      alert('Please enter a name for your color');
      return;
    }

    const colorData = {
      id: Date.now().toString(), // Generate unique ID
      name: colorName.trim(),
      ryb: [...ryb],
      rgb: rybToRgb(ryb).map(v => Math.round(v * 255)),
      exactColor: exactColor || { r: 255, g: 0, b: 0, hex: '#ff0000' },
      paintMix: [...paintMix],
      volume: volume,
      unit: unit,
      totalCost: paintMix.reduce((sum, paint) => sum + (paint.ml * paint.pricePerMl), 0),
      selectedBrands: { ...selectedBrands },
      createdAt: new Date().toISOString()
    };

    addColorToHistory(colorData);
    setColorName('');
    alert('Color saved successfully!');
  };

  return (
    <div className="mix-tab">
      <div className="mix-header">
        <h2>Professional Paint Mixer</h2>
      </div>

      {/* Selected Brands Display */}
      <div className="selected-brands-display">
        <h3>Selected Brands:</h3>
        <div className="brands-list">
          {Object.entries(selectedBrands).map(([category, brand]) => (
            brand && (
              <span key={category} className="brand-tag">
                {category.charAt(0).toUpperCase() + category.slice(1)}: {brand}
              </span>
            )
            ))}
          </div>
        {Object.values(selectedBrands).every(brand => !brand) && (
          <p className="no-brands-message">No brands selected. Go to Brand section to select brands.</p>
          )}
        </div>

      <div className="mixer-container">
        <div className="color-wheel-container">
          <canvas 
            ref={canvasRef}
            width={350}
            height={350}
            className="picker-canvas"
            onMouseDown={handleCanvasInteraction}
            onMouseMove={(e) => e.buttons === 1 && handleCanvasInteraction(e)}
          />
          <div className="color-display">
            <div className="color-preview" style={{ backgroundColor: mixedColor }} />
            <div className="color-values">
              <p>RYB: {ryb.map(v => Math.round(v * 100)).join('%, ')}%</p>
              <p>RGB: {mixedColor}</p>
              {exactColor && (
                <div className="exact-color-info">
                  <p>Exact Color: {exactColor.hex}</p>
                  <div 
                    className="exact-color-swatch" 
                    style={{ backgroundColor: exactColor.hex }}
                  />
                </div>
              )}
            </div>
            <div className="color-naming">
              <input
                type="text"
                placeholder="Name your color..."
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="color-name-input"
              />
              <button 
                onClick={handleSaveColor}
                className="save-color-btn"
                disabled={!colorName.trim()}
              >
                💾 Save Color
              </button>
            </div>
          </div>
        </div>

        <div className="mix-controls">
          <div className="volume-controls">
            <label>
              Volume:
              <input 
                type="number" min="1" max="100" value={volume}
                onChange={(e) => setVolume(Math.max(1, Math.min(100, +e.target.value)))}
              />
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="ml">milliliters (ml)</option>
                <option value="liter">liters (L)</option>
                <option value="gallon">gallons (gal)</option>
                <option value="bucket">buckets (~10L)</option>
              </select>
            </label>
            <div className="volume-equivalents">
              <span>{volumeInMl.toLocaleString()} ml</span>
              <span>{(volumeInMl / 1000).toFixed(2)} liters</span>
              <span>{(volumeInMl / 3785.41).toFixed(2)} gallons</span>
            </div>
          </div>

          <div className="mix-results">
            <h3>Required Paints:</h3>
            <div className="paint-list">
              {paintMix.map((paint, i) => (
                <div key={i} className="paint-recipe">
                  <div className="paint-info">
                    <div 
                      className="paint-swatch" 
                      style={{ backgroundColor: `rgb(${paint.rgb.join(',')})`,
                               boxShadow: `0 0 5px rgba(${paint.rgb.join(',')},0.5)` }}
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
          </div>
        </div>
      </div>
    </div>
  );
}
