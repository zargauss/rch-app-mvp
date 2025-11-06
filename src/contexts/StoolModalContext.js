import React, { createContext, useContext, useState } from 'react';

const StoolModalContext = createContext();

export const useStoolModal = () => {
  const context = useContext(StoolModalContext);
  if (!context) {
    throw new Error('useStoolModal must be used within StoolModalProvider');
  }
  return context;
};

export const StoolModalProvider = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <StoolModalContext.Provider value={{ isModalVisible, openModal, closeModal }}>
      {children}
    </StoolModalContext.Provider>
  );
};
