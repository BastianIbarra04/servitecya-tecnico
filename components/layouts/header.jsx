import { View, Text, StyleSheet, Platform, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Logo} from "../icons/user";

const API_URL = Platform.select({
  ios: 'http://localhost:3000',        // iOS simulator
  android: 'http://192.168.1.39:3000', // Android emulator / dispositivo
  default: 'http://192.168.1.39:3000',
});

const Header = () => {
  const [userName, setUserName] = useState("");
  const insets = useSafeAreaInsets(); // obtiene los márgenes seguros (notch, barra superior, etc.)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        if (!id) return;
        const { data } = await axios.get(`${API_URL}/user/${id}`);
        setUserName(data.name);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "No se pudo obtener el usuario.");
      }
    };

    fetchUser();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        <View>
      <Text style={styles.title}>
        {userName ? `Hola ${userName}` : ""}
      </Text>
        </View>
        <View>
            <TouchableOpacity onPress={() => Alert.alert('Logo Pressed')}>
              <Logo style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#424040ff',
    paddingHorizontal: 15,
    paddingBottom: 10, // da un poco de espacio extra
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Header;
