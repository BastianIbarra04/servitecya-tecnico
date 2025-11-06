import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {useAuth} from '../../context/AuthContext';
import { API_URL } from '../../components/config/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
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
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { user } = res.data || {};

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


  return (
    <View className="flex-1 justify-center items-center bg-[#F8F9FB] px-6" >
      <Image source={require('../../assets/logo2.png')} style={{ width: 300, height: 200, marginBottom: 20 }} />
      <Text className="text-2xl text-[#7a797a] font-bold mb-4">Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#7a797a"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#7a797a"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity className="bg-[#FD963A] py-2 rounded-xl items-center justify-center w-full" onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Ingresar</Text>
        )}
      </TouchableOpacity>

      <View className="mt-6">
        <Text className="text-[#7a797a] font-bold">¿No tienes cuenta?</Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerLink}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
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
