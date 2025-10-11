import React from 'react';
import 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import theme from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
}
