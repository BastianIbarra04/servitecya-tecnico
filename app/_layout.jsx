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
          <Stack.Screen 
            name="profile/setting" 
            options={{
              title: 'Editar Perfil',
              headerShown: false,
              headerBackTitleVisible: false,
            }}
          />

          <Stack.Screen 
            name="request/[id]" 
            options={{
              title: 'Detalle de la Solicitud',
              headerShown: false,
              headerBackTitleVisible: false,
            }}
          />

          <Stack.Screen 
            name="request/[id]/offer" 
            options={{
              title: '',
              headerShown: false,
              headerBackTitleVisible: false,
              
            }}
          />

          <Stack.Screen 
            name="offer-detail/[offerId]" 
            options={{
              title: '',
              headerShown: false,
              headerBackTitleVisible: false,
              
            }}
          />

          <Stack.Screen 
            name="chat/[offerId]" 
            options={{
              title: '',
              headerShown: false,
              headerBackTitleVisible: false,
              
            }}
          />

          <Stack.Screen 
            name="service-management/[serviceRequestId]" 
            options={{
              title: '',
              headerShown: false,
              headerBackTitleVisible: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
