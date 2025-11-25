import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import  { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Alert, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../components/config/api.js';
import { useFocusEffect } from '@react-navigation/native';

export default function Profile({setIsLoggedIn}) {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const id = await AsyncStorage.getItem('userId');
          if (!id) return;

          const { data } = await axios.get(`${API_URL}/user/${id}`);
          setUser(data);
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'No se pudo obtener el usuario.');
        }
      };

      fetchUser();

      // opcional: limpiar algo cuando salgas de la pantalla
      return () => {
        // cleanup si lo necesitas
      };
    }, []) // 👈 importante: useCallback envuelve la función
  );

  const handleLogout = async () => {
    await logout(); // 👈 borra AsyncStorage y cambia el estado global
  };

  return (
<SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header con gradiente */}
        <View className="bg-gradient-to-b from-blue-600 to-blue-700 pt-8 pb-6 px-6">
          <View className="items-center">
            {/* Avatar con badge online */}
            <View className="relative">
              <Image
                source={user?.profilePicture ? { uri: user.profilePicture } : require("../../assets/imgprofile.jpeg")}
                style={{ width: 120, height: 120 }}
                className="rounded-full border-4 border-white"
              />
            </View>
            
            {/* Información del usuario */}
            <Text className="text-2xl font-bold text-black mt-4 text-center">
              {user?.name} {user?.lastname}
            </Text>
            <Text className="text-black text-base mt-1 text-center mb-2">
              {user?.email}
            </Text>
            
          </View>
        </View>


        {/* Menú de opciones */}
        <View className="px-6 mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Mi Cuenta</Text>
          
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Historial */}
              <TouchableOpacity
                className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100"
                onPress={() => router.push("/profile/history")}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-[#EEF2FF] rounded-xl justify-center items-center mr-4">
                    <FontAwesome name="history" size={22} color="#4F46E5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      Historial de Servicios
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      Revisa tus servicios anteriores
                    </Text>
                  </View>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Configuración */}
              <TouchableOpacity
                className="flex-row items-center justify-between px-5 py-4"
                onPress={() => router.push("/profile/setting")}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-[#F0F9F6] rounded-xl justify-center items-center mr-4">
                    <FontAwesome name="cog" size={22} color="#9CA3AF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      Configuración
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      Ajusta tus preferencias
                    </Text>
                  </View>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Botón cerrar sesión fijo */}
      <View className="px-6 pb-8 pt-4 bg-gray-50 border-t border-gray-200">
        <TouchableOpacity
          className="bg-white border border-gray-300 py-4 rounded-xl items-center justify-center shadow-sm flex-row"
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={18} color="#DC2626" />
          <Text className="text-red-600 text-lg font-semibold ml-2">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
        
        {/* Versión de la app */}
        <Text className="text-gray-400 text-center text-xs mt-4">
          Versión 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#212121',
    },
    textoHome: {
        color: '#fff',
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        width: '60%',
        height: 50,
        backgroundColor: '#fc7f20',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
    cuentaButton:{
      width: '75%',
      height: 70,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      
    }
    
});
