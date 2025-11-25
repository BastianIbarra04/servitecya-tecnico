import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import {API_URL} from '../components/config/api.js';
import axios from 'axios';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import InactiveScreen from '../app/utils/inactive';
import LoginScreen from '../app/(auth)/login';
import { usePathname } from 'expo-router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState(null); // ACTIVE o INACTIVE
  const router = useRouter();
  const pathname = usePathname();
  const currentRouteName = pathname.split('/').pop();

  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      const userId = await AsyncStorage.getItem('userId');

      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        try {
          const userStatus = await axios.get(`${API_URL}/auth/status/${userId}`); // consulta al backend
          console.log("Estado del usuario obtenido:", userStatus.data);
          setStatus(userStatus.data.status); // 'ACTIVE' o 'INACTIVE'
        } catch (error) {
          console.log('Error al obtener el estado del usuario:', error);
        }
      }

      setIsLoading(false);
    };

    checkLogin();
  }, []);

  const login = async () => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    const userId = await AsyncStorage.getItem('userId');

    setIsLoggedIn(true);

    try {
      const userStatus = await axios.get(`${API_URL}/auth/status/${userId}`); // consulta al backend
      setStatus(userStatus.data.status);
    } catch (error) {
      console.log('Error al obtener el estado del usuario:', error);
    }
  };

      const logout = async () => {
      try {
          await AsyncStorage.multiRemove(['isLoggedIn', 'userId', 'userToken']);
          setIsLoggedIn(false);
          setUserId(null);
          setStatus(null);
          console.log('Logout completed');
      } catch (error) {
          console.log('Error during logout:', error);
      }
      };

      const publicRoutes = ['login', 'register', 'files'];

  return (
    <AuthContext.Provider value={{ isLoggedIn, status, isLoading, login, logout }}>
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <FontAwesome name="spinner" size={48} color="#fb923c" spin />
        </View>
      ) : ( !isLoggedIn && !publicRoutes.includes(currentRouteName) ) ? (
        <LoginScreen login={login} />  // renderizas el login aquí
      ) : status === 'INACTIVE' ? (
        <InactiveScreen logout={logout} />
      ) : (
        children // home u otras pantallas
      )}

    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
