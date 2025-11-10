import React, { createContext, useContext, useState } from 'react';

const SpeedDialContext = createContext();

export function SpeedDialProvider({ children }) {
  const [handlers, setHandlers] = useState({
    onStoolPress: null,
    onSymptomPress: null,
    onNotePress: null,
  });

  const registerHandlers = (newHandlers) => {
    setHandlers(newHandlers);
  };

  return (
    <SpeedDialContext.Provider value={{ handlers, registerHandlers }}>
      {children}
    </SpeedDialContext.Provider>
  );
}

export function useSpeedDial() {
  const context = useContext(SpeedDialContext);
  if (!context) {
    throw new Error('useSpeedDial must be used within a SpeedDialProvider');
  }
  return context;
}
