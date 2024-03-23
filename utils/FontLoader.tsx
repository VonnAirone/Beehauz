import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFonts } from 'expo-font';

const FontContext = createContext(false);

export const FontProvider = ({ children }) => {
  const [isFontLoaded, setIsFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      try {
        await useFonts({
          Rubik: require('@/assets/fonts/Rubik-Regular.ttf'),
        });
        setIsFontLoaded(true);
      } catch (error) {
        console.error('Error loading font:', error);
      }
    }

    loadFont();
  }, []);

  return (
    <FontContext.Provider value={isFontLoaded}>
      {children}
    </FontContext.Provider>
  );
};

export const useFontStatus = () => useContext(FontContext);
