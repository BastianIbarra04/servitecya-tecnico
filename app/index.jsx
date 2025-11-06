import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fc7f20" />
      </View>
    );
  }

  // ✅ Redirige con base en el estado del contexto
  return isLoggedIn ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
