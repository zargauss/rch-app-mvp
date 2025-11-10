import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import designSystem from '../../theme/designSystem';

// Import conditionnel : @react-native-community/slider uniquement sur mobile
let Slider = null;
if (Platform.OS !== 'web') {
  Slider = require('@react-native-community/slider').default;
}

/**
 * AppSlider - Composant cross-platform pour slider générique
 * Mobile (iOS/Android): Slider natif (@react-native-community/slider)
 * Web: Input range HTML5 natif
 */
const AppSlider = ({
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
  value,
  onValueChange,
  minimumTrackTintColor = '#4C4DDC',
  maximumTrackTintColor = '#E5E5E5',
  thumbStyle,
  style,
}) => {
  if (Platform.OS === 'web') {
    // Version web avec input range HTML5
    return (
      <View style={[styles.webContainer, style]}>
        <input
          type="range"
          min={minimumValue}
          max={maximumValue}
          step={step}
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            outline: 'none',
            background: `linear-gradient(to right, ${minimumTrackTintColor} 0%, ${minimumTrackTintColor} ${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%, ${maximumTrackTintColor} ${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%, ${maximumTrackTintColor} 100%)`,
            cursor: 'pointer',
            WebkitAppearance: 'none',
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${thumbStyle?.backgroundColor || minimumTrackTintColor};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${thumbStyle?.backgroundColor || minimumTrackTintColor};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </View>
    );
  }

  // Version mobile avec Slider natif
  return Slider ? (
    <Slider
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      value={value}
      onValueChange={onValueChange}
      style={style}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbStyle={thumbStyle}
    />
  ) : null;
};

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    paddingVertical: designSystem.spacing[2],
  },
});

export default AppSlider;
