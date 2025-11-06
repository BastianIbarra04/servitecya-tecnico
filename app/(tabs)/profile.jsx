import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
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
    router.replace('/login'); // 👈 navega al login
  };

  return (
    <View className="flex-1 justify-around px-6 mt-16">
      {/* Header */}
      <View className="items-center">
        <Image
          source={require("../../assets/imgprofile.jpeg")}
          style={{ width: 150, height: 150, borderRadius: 50}}
        />
        <Text className="text-3xl font-bold text-[#212121] mt-10">
          {user?.name} {user?.lastname}
        </Text>
        <Text className="text-gray-500 text-xl w-full text-center">{user?.email}  </Text>
      </View>

      {/* Opciones */}
      <View className="rounded-2xl border border-gray-300  overflow-hidden mb-6">
        {/* Historial */}
        <TouchableOpacity
          className="flex-row items-center justify-between px-5 py-4 border-b border-gray-300"
          onPress={() => router.push("/profile/history")}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-orange-400 rounded-xl justify-center items-center mr-4">
              <FontAwesome name="history" size={24} color="white" />
            </View>
            <Text className="text-lg text-[#212121] font-medium">
              Historial de Servicios
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={20} color="#212121" />
        </TouchableOpacity>
        {/* Configuración */}
        <TouchableOpacity
          className="flex-row items-center justify-between px-5 py-4"
          onPress={() => router.push("/profile/setting")}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-orange-400 rounded-xl justify-center items-center mr-4">
              <FontAwesome name="cog" size={24} color="white" />
            </View>
            <Text className="text-lg text-[#212121] font-medium">
              Configuración
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={20} color="#212121" />
        </TouchableOpacity>
      </View>

      {/* Botón cerrar sesión */}
      <TouchableOpacity
        className="bg-[#FD963A] py-4 rounded-xl items-center justify-center shadow-md"
        onPress={handleLogout}
      >
        <Text className="text-white text-lg font-semibold">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
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
