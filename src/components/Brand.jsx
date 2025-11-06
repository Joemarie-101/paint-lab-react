import { useState } from "react";
import { useBrand } from "../context/BrandContext";
import "./Brand.css";

export default function BrandTab({ setActiveTab }) {
  const { brands, selectedBrands, selectBrand } = useBrand();
  const [woodPurpose, setWoodPurpose] = useState("");
  const [paintType, setPaintType] = useState("");
  const [surface, setSurface] = useState("");
  const [coverage, setCoverage] = useState("");
  const [finish, setFinish] = useState("");
  const [budget, setBudget] = useState("");

  // Calculate recommended brands based on selections
  const getRecommendedBrands = () => {
    const recommendations = [];
    
    if (paintType === "latex" && surface === "interior") {
      recommendations.push("Boysen", "Davies", "Isosceles");
    }
    if (paintType === "enamel" && surface === "metal") {
      recommendations.push("Boysen", "Symphony", "Camel");
    }
    if (surface === "exterior") {
      recommendations.push("Boysen", "Davies", "Camel");
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  };

  const recommendedBrands = getRecommendedBrands();

  return (
    <div className="brand-container">
      <h2 className="title">Paint Selection Guide</h2>
      
      <div className="selection-summary">
        {selectedBrands.wood && (
          <div className="summary-item">
            <strong>Selected Manufacturer:</strong> {selectedBrands.wood}
          </div>
        )}
        {paintType && (
          <div className="summary-item">
            <strong>Paint Type:</strong> {paintType}
          </div>
        )}
        {surface && (
          <div className="summary-item">
            <strong>Surface:</strong> {surface}
          </div>
        )}
      </div>

      <div className="row">
        <div className="col">
          <div className="field">
            <label>🪵 Surface Material</label>
            <select value={surface} onChange={(e) => setSurface(e.target.value)}>
              <option value="">Choose material...</option>
              <option value="wood">Wood</option>
              <option value="metal">Metal</option>
              <option value="concrete">Concrete</option>
              <option value="drywall">Drywall</option>
              <option value="masonry">Masonry</option>
            </select>
          </div>

          <div className="field">
            <label>🏭 Manufacturer</label>
            <select 
              value={selectedBrands.wood} 
              onChange={(e) => selectBrand('wood', e.target.value)}
            >
              <option value="">Choose manufacturer...</option>
              {brands.wood.map((brand, i) => (
                <option key={i} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>🎨 Paint Type</label>
            <select value={paintType} onChange={(e) => setPaintType(e.target.value)}>
              <option value="">Choose type...</option>
              <option value="latex">Latex (Water-based)</option>
              <option value="enamel">Enamel</option>
              <option value="acrylic">Acrylic</option>
              <option value="oil">Oil-based</option>
              <option value="epoxy">Epoxy</option>
            </select>
          </div>
        </div>

        <div className="col">
          <div className="field">
            <label>📍 Application Area</label>
            <select value={surface} onChange={(e) => setSurface(e.target.value)}>
              <option value="">Choose area...</option>
              <option value="interior">Interior Walls</option>
              <option value="exterior">Exterior Walls</option>
              <option value="furniture">Furniture</option>
              <option value="trim">Trim & Molding</option>
              <option value="floor">Floor</option>
            </select>
          </div>

          <div className="field">
            <label>✨ Finish Type</label>
            <select value={finish} onChange={(e) => setFinish(e.target.value)}>
              <option value="">Choose finish...</option>
              <option value="matte">Matte/Flat</option>
              <option value="eggshell">Eggshell</option>
              <option value="satin">Satin</option>
              <option value="semi-gloss">Semi-Gloss</option>
              <option value="gloss">High Gloss</option>
            </select>
          </div>

          <div className="field">
            <label>💰 Budget Range</label>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Choose budget...</option>
              <option value="economy">Economy</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendedBrands.length > 0 && (
        <div className="recommendations-panel">
          <h3>💡 Recommended Manufacturers</h3>
          <div className="recommendations-list">
            {recommendedBrands.map((brand, index) => (
              <div key={index} className="recommendation-item">
                <span className="brand-badge">{brand}</span>
                <span className="recommendation-reason">
                  {paintType === "latex" && surface === "interior" && "Great for interior walls"}
                  {paintType === "enamel" && surface === "metal" && "Durable for metal surfaces"}
                  {surface === "exterior" && "Weather-resistant for exterior use"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paint Properties Info */}
      <div className="paint-properties">
        <h3>Paint Properties</h3>
        <div className="properties-grid">
          <div className="property-card">
            <h4>Drying Time</h4>
            <p>{paintType === "latex" ? "1-2 hours" : 
                paintType === "oil" ? "6-8 hours" : 
                paintType === "enamel" ? "4-6 hours" : "Varies"}</p>
          </div>
          <div className="property-card">
            <h4>Durability</h4>
            <p>{surface === "exterior" ? "High" : 
                paintType === "enamel" ? "Very High" : 
                paintType === "latex" ? "Medium-High" : "Medium"}</p>
          </div>
          <div className="property-card">
            <h4>Cleanup</h4>
            <p>{paintType === "latex" ? "Soap & Water" : 
                paintType === "oil" ? "Mineral Spirits" : 
                "Check manufacturer guide"}</p>
          </div>
        </div>
      </div>

      <div className="center-button">
        <button 
          className="go-to-mixing-btn"
          onClick={() => setActiveTab('mix')}
          disabled={!selectedBrands.wood || !paintType || !surface}
        >
          🎨 Go to Color Mixing
        </button>
        {(!selectedBrands.wood || !paintType || !surface) && (
          <p className="validation-message">
            Please select manufacturer, paint type, and surface to continue
          </p>
        )}
      </div>
    </div>
  );
}