import React, { createContext, useContext, useState, useEffect } from 'react';

const ColorHistoryContext = createContext();

export const useColorHistory = () => {
  const context = useContext(ColorHistoryContext);
  if (!context) {
    throw new Error('useColorHistory must be used within a ColorHistoryProvider');
  }
  return context;
};

export const ColorHistoryProvider = ({ children }) => {
  const [colorHistory, setColorHistory] = useState([]);
  const MAX_HISTORY = 20;

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('colorHistory');
    if (saved) {
      setColorHistory(JSON.parse(saved));
    }
  }, []);

  const addColorToHistory = (color) => {
    setColorHistory(prev => {
      const filtered = prev.filter(c => c.hex !== color.hex);
      const newHistory = [{ ...color, timestamp: new Date().toISOString() }, ...filtered];
      const trimmed = newHistory.slice(0, MAX_HISTORY);
      localStorage.setItem('colorHistory', JSON.stringify(trimmed));
      return trimmed;
    });
  };

  const clearHistory = () => {
    setColorHistory([]);
    localStorage.removeItem('colorHistory');
  };

  const updateColor = (id, updatedColor) => {
    setColorHistory(prev => {
      const updated = prev.map(color => 
        color.id === id 
          ? { ...color, ...updatedColor, updatedAt: new Date().toISOString() }
          : color
      );
      localStorage.setItem('colorHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteColor = (id) => {
    setColorHistory(prev => {
      const filtered = prev.filter(color => color.id !== id);
      localStorage.setItem('colorHistory', JSON.stringify(filtered));
      return filtered;
    });
  };

  const value = {
    colorHistory,
    savedColors: colorHistory, // Alias for backward compatibility
    addColorToHistory,
    updateColor,
    deleteColor,
    clearHistory
  };

  return (
    <ColorHistoryContext.Provider value={value}>
      {children}
    </ColorHistoryContext.Provider>
  );
};