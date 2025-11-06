import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';


export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout(); // 👈 borra AsyncStorage y cambia el estado global
    router.replace('/login'); // 👈 navega al login
  };
  return <>
  <View className="flex-1 justify-center items-center">
    <Image source={require('../../assets/logo2.png')} style={{ width: 300, height: 200, marginBottom: 20, marginTop: 20 }} />
    <Text className="mb-2 text-3xl font-bold text-[#212121] text-center">
        Bienvenidos a ServitecYa!
    </Text>
  
  </View>
  </>;
}