import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VocabProvider } from './src/context/VocabProvider';
import { RootStackParamList } from './src/navigation/types';
import { DecksScreen } from './src/screens/DecksScreen';
import { DeckDetailScreen } from './src/screens/DeckDetailScreen';
import { AddEditCardScreen } from './src/screens/AddEditCardScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <VocabProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.white },
              headerTitleStyle: { color: colors.text },
              headerTintColor: colors.primary,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="Decks" component={DecksScreen} options={{ title: 'Vocab Flashcards' }} />
            <Stack.Screen name="DeckDetail" component={DeckDetailScreen} />
            <Stack.Screen
              name="AddEditCard"
              component={AddEditCardScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Study"
              component={StudyScreen}
              options={{ title: 'Study', presentation: 'fullScreenModal' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </VocabProvider>
    </SafeAreaProvider>
  );
}
