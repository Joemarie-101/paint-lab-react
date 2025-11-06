import React, { createContext, useContext, useState } from 'react';

const BrandContext = createContext();

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

export const BrandProvider = ({ children }) => {
  const [selectedBrands, setSelectedBrands] = useState({
    wood: '',
    steel: '',
    cement: ''
  });
  
  const [brands] = useState({
    wood: ['Dulux', 'Sherwin Williams', 'Benjamin Moore', 'Behr', 'Valspar'],
    steel: ['Rust-Oleum', 'Krylon', 'Montana', 'Belton Molotow', 'MTN'],
    cement: ['Sika', 'Master Builders', 'BASF', 'Mapei', 'Ardex']
  });

  const selectBrand = (type, brand) => {
    setSelectedBrands(prev => ({
      ...prev,
      [type]: brand
    }));
  };

  const getCurrentBrandColors = () => {
    // Return default colors for now
    return ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  };

  const value = {
    selectedBrands,
    setSelectedBrands,
    brands,
    selectBrand,
    getCurrentBrandColors
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};