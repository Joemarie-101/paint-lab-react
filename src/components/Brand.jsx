// Brand.jsx - UPDATED
import { useState, useEffect, useCallback } from "react";
import { useBrand } from "../context/BrandContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import "./Brand.css";

export default function BrandTab({ setActiveTab }) {
  const { brands, selectedBrands, selectBrand } = useBrand();
  const { currentUser } = useAuth();
  const [paintType, setPaintType] = useState("");
  const [surface, setSurface] = useState("");
  const [subMaterial, setSubMaterial] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const subMaterials = {
    wood: ['Pine', 'Oak', 'Maple', 'Cedar', 'Plywood', 'MDF', 'Teak', 'Mahogany'],
    metal: ['Steel', 'Aluminum', 'Copper', 'Brass', 'Stainless Steel', 'Galvanized Iron'],
    concrete: ['Regular Concrete', 'Reinforced Concrete', 'Precast Concrete', 'Concrete Block'],
    drywall: ['Regular Drywall', 'Moisture-Resistant', 'Fire-Resistant', 'Soundproof Drywall'],
    masonry: ['Brick', 'Concrete Block', 'Stone', 'CMU', 'Terracotta']
  };

  const selectedBrandForSurface = surface ? selectedBrands[surface] : '';

  // Load saved selections from Firebase for current user
  useEffect(() => {
    if (!currentUser || hasLoaded) return;

    const loadSelectionsFromFirebase = async () => {
      setLoading(true);
      setError("");
      try {
        const docRef = doc(db, 'paintSelections', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSurface(data.surface || '');
          setSubMaterial(data.subMaterial || '');
          setPaintType(data.paintType || '');
          
          if (data.surface && data.brand) {
            selectBrand(data.surface, data.brand);
          }
        }
      } catch (error) {
        console.error('Error loading from Firebase:', error);
        setError("Failed to load saved selections: " + error.message);
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };

    loadSelectionsFromFirebase();
  }, [currentUser, hasLoaded, selectBrand]);

  const saveSelectionsToFirebase = useCallback(async () => {
    if (!surface || !db || !currentUser) return;
    
    setError("");
    try {
      const selectionData = {
        surface,
        subMaterial: subMaterial || '',
        paintType: paintType || '',
        brand: selectedBrandForSurface || '',
        userId: currentUser.uid,
        userEmail: currentUser.email,
        lastUpdated: new Date(),
        timestamp: new Date()
      };

      const docRef = doc(db, 'paintSelections', currentUser.uid);
      await setDoc(docRef, selectionData, { merge: true });
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setError("Failed to save selection: " + error.message);
    }
  }, [surface, subMaterial, paintType, selectedBrandForSurface, currentUser]);

  // Save to Firebase whenever important selections change
  useEffect(() => {
    if (surface && currentUser && hasLoaded) {
      saveSelectionsToFirebase();
    }
  }, [surface, currentUser, hasLoaded, saveSelectionsToFirebase]);

  const handleSurfaceChange = (e) => {
    const selectedSurface = e.target.value;
    setSurface(selectedSurface);
    setSubMaterial('');
  };

  const handleSubMaterialChange = (e) => {
    setSubMaterial(e.target.value);
  };

  const handleBrandChange = (brand) => {
    selectBrand(surface, brand);
  };

  const handlePaintTypeChange = (e) => {
    setPaintType(e.target.value);
  };

  const handleGoToMixing = () => {
    saveSelectionsToFirebase();
    setActiveTab('mix');
  };

  const getCurrentBrand = () => {
    return selectedBrands[surface] || '';
  };

  const canProceedToMixing = () => {
    return surface && subMaterial && getCurrentBrand() && paintType;
  };

  return (
    <div className="brand-container">
      <h2 className="title">Paint Selection Guide</h2>
      
      {loading && <div className="loading">Loading saved selections...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && (
        <>
          <div className="row">
            <div className="col">
              {/* Surface Selection */}
              <div className="field">
                <label>🪵 What do you want to paint? </label>
                <select value={surface} onChange={handleSurfaceChange}>
                  <option value="">Choose material...</option>
                  <option value="wood">Wood</option>
                  <option value="metal">Metal</option>
                  <option value="concrete">Concrete</option>
                  <option value="drywall">Drywall</option>
                  <option value="masonry">Masonry</option>
                </select>
              </div>

              {/* Sub-material Selection - Only show if surface is selected */}
              {surface && (
                <div className="field">
                  <label>🔍 What type of {surface}?</label>
                  <select value={subMaterial} onChange={handleSubMaterialChange}>
                    <option value="">Select {surface} type...</option>
                    {subMaterials[surface]?.map((material) => (
                      <option key={material} value={material.toLowerCase()}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand Selection - Dynamic based on surface */}
              {surface && (
                <div className="field">
                  <label>🏭 What brand you want to use?</label>
                  <select 
                    value={getCurrentBrand()} 
                    onChange={(e) => handleBrandChange(e.target.value)}
                  >
                    <option value="">Choose brand...</option>
                    {brands[surface]?.map((brand, index) => (
                      <option key={index} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Paint Type Selection */}
              <div className="field">
                <label>🎨 Paint Type</label>
                <select value={paintType} onChange={handlePaintTypeChange}>
                  <option value="">Choose type...</option>
                  <option value="latex">Latex (Water-based)</option>
                  <option value="enamel">Enamel</option>
                  <option value="acrylic">Acrylic</option>
                  <option value="oil">Oil-based</option>
                  <option value="epoxy">Epoxy</option>
                </select>
              </div>

              {/* Selection Summary */}
              <div className="selection-summary">
                {surface && (
                  <div className="summary-item">
                    <strong>Surface:</strong> {surface}
                  </div>
                )}
                {subMaterial && (
                  <div className="summary-item">
                    <strong>Material Type:</strong> {subMaterial}
                  </div>
                )}
                {getCurrentBrand() && (
                  <div className="summary-item">
                    <strong>Brand:</strong> {getCurrentBrand()}
                  </div>
                )}
                {paintType && (
                  <div className="summary-item">
                    <strong>Paint Type:</strong> {paintType}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="center-button">
            <button 
              className="go-to-mixing-btn"
              onClick={handleGoToMixing}
              disabled={!canProceedToMixing()}
            >
              🎨 Go to Color Mixing
            </button>
            {!canProceedToMixing() && (
              <p className="validation-message">
                Please select surface, material type, brand, and paint type to continue
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
