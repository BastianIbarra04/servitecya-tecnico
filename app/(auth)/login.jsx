import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {useAuth} from '../../context/AuthContext';
import { API_URL } from '../../components/config/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  
  const router = useRouter();
  const { login } = useAuth(); // 👈 usamos el método login del contexto

  const handleRegister = () => {
    router.replace('/register'); // 👈 redirige a la pantalla de registro
  };

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Por favor completa todos los campos.');
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post(`${API_URL}/authTechnician/login`, { email, password });
    const { user } = res.data || {};
    console.log("Respuesta de login:", res.data);

    // Si tu API SIEMPRE devuelve 200 con un flag de éxito, valida aquí:
    if (!user) {
      // fuerza el flujo de error para usar la misma lógica del catch
      const error = new Error('INVALID_CREDENTIALS');
      // @ts-ignore
      error.response = { status: 401, data: { error: 'Credenciales inválidas' } };
      throw error;
    }

    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('userId', String(user.id));
    await AsyncStorage.setItem("technicianId", String(user.technicianId));
    await login();

    router.replace('/home');
  } catch (error) {
    // Manejo claro por status
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg = error.response?.data?.error;

      if (status === 401 || status === 400) {
        Alert.alert('Error', msg || 'Credenciales inválidas');
      } else {
        Alert.alert('Error', msg || 'No se pudo iniciar sesión.');
      }
    } else {
      Alert.alert('Error', 'Ocurrió un error inesperado.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
        <View className="flex-1 justify-center px-8 bg-white">
          {/* Header con logo */}
          <View className="items-center mb-12">
            <Image 
              source={require('../../assets/logo2.png')} 
              style={{ width: 280, height: 160 }} 
              resizeMode="contain"
            />
            <Text className="text-3xl font-bold text-gray-800 mt-4">
              Bienvenido
            </Text>
            <Text className="text-lg text-gray-500 mt-2 text-center">
              Inicia sesión en tu cuenta para continuar
            </Text>
          </View>

          {/* Formulario */}
          <View className="space-y-6">
            {/* Campo Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </Text>
              <TextInput
                className={`border-2 rounded-xl px-4 py-4  ${
                  isFocused.email 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="tu@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {/* Campo Contraseña */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </Text>
              <TextInput
                className={`border-2 rounded-xl px-4 py-4 ${
                  isFocused.password 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            {/* Botón de Login */}
            <TouchableOpacity 
              className={`bg-orange-500 py-4 rounded-xl items-center justify-center shadow-lg ${
                loading ? 'opacity-70' : ''
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white text-lg font-semibold ml-2">
                    Iniciando sesión...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Iniciar Sesión
                </Text>
              )}
            </TouchableOpacity>

            {/* Enlace de olvidé contraseña */}
            <TouchableOpacity
              onPress={handleRegister}
              className="items-center mt-2"
            >
              <Text className="text-orange-500 font-medium text-sm">
                Regístrate aquí
              </Text>
            </TouchableOpacity>
          </View>
</View> 
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#7a797a',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    height: 40,
    color: '#7a797a',
  },
  register: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
    padding: 10,
  },
  registerLink: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fc7f20',
  },
});
