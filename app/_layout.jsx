import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
      <SafeAreaProvider>
        <Stack>
          {/* (tabs) no muestra header */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "" }} />
          
          {/* Auth screens (login/register) */}
          <Stack.Screen name="(auth)" options={{ headerShown: false, title: "" }} />

          {/* Pantalla fuera de tabs */}
        </Stack>
      </SafeAreaProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
