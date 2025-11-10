import React from 'react';
import AppSlider from './AppSlider';

/**
 * BristolScaleSlider - Composant spécialisé pour l'échelle de Bristol (1-7)
 * Utilise AppSlider en interne pour la compatibilité cross-platform
 */
const BristolScaleSlider = ({
  value,
  onValueChange,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbStyle,
  style,
}) => {
  return (
    <AppSlider
      minimumValue={1}
      maximumValue={7}
      step={1}
      value={value}
      onValueChange={onValueChange}
      style={style}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbStyle={thumbStyle}
    />
  );
};

export default BristolScaleSlider;
