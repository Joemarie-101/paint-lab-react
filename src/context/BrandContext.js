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
    metal: '',
    concrete: '',
    drywall: '',
    masonry: ''
  });
  
  const [brands] = useState({
    wood: ['Davids', 'Rain or Shine', 'Boysen'],
    metal: ['Rain or Shine', 'Boysen', 'Davids'],
    concrete: ['Boysen', 'Rain or Shine', 'Davids'],
    drywall: ['Boysen', 'Davids', 'Rain or Shine'],
    masonry: ['Boysen', 'Davids', 'Rain or Shine']
  });

  const selectBrand = (surfaceType, brand) => {
    setSelectedBrands(prev => ({
      ...prev,
      [surfaceType]: brand
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