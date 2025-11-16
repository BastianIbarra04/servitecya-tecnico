import {View, Text, TouchableOpacity, Image, TextInput, ScrollView} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { API_URL } from '../../components/config/api.js';
import { Alert } from "react-native";
import { StyleSheet } from "react-native";
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function Settings(){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const id = await AsyncStorage.getItem("userId");
                if (!id) return;
                const { data } = await axios.get(`${API_URL}/user/${id}`);
                setUser(data);
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "No se pudo obtener la información del usuario.");
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        if (!user?.name || !user?.lastname || !user?.email) {
            Alert.alert("Error", "Por favor completa todos los campos obligatorios.");
            return;
        }

        setLoading(true);
        try {
            const id = await AsyncStorage.getItem("userId");
            if (!id) return;
            
            await axios.put(`${API_URL}/user/${id}`, user);
            Alert.alert("Éxito", "Perfil actualizado correctamente.");
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo actualizar el perfil.");
        } finally {
            setLoading(false);
        }
    }

    return(
      
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
                {/* Header */}
                <View className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm flex-row ">
                    <TouchableOpacity className="mr-2 py-1 " onPress={() => router.back()}>
                      <FontAwesome name="chevron-left" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  <View className="flex-col items-left ">
                    <Text className="text-xl font-bold text-gray-900">Configura tu Perfil</Text>
                      <Text className="text-gray-600 mt-1 text-sm">
                      Completa los detalles de tu perfil
                      </Text>
                  </View>
                </View>

            <ScrollView 
                className="flex-1 px-6 py-6"
                showsVerticalScrollIndicator={false}
            >
                {/* Información Personal */}
                <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Información Personal</Text>
                    
                    <View className="flex-row space-x-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Nombre *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu nombre"
                                placeholderTextColor={"#9CA3AF"}
                                value={user?.name}
                                onChangeText={(text) => setUser({ ...user, name: text })}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Apellido *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu apellido"
                                placeholderTextColor={"#9CA3AF"}
                                value={user?.lastname}
                                onChangeText={(text) => setUser({ ...user, lastname: text })}
                            />
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Correo Electrónico *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="tu@email.com"
                            placeholderTextColor={"#9CA3AF"}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={user?.email}
                            onChangeText={(text) => setUser({ ...user, email: text })}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Teléfono</Text>
                        <View style={styles.phoneContainer}>
                            <View style={styles.phoneCodeContainer}>
                                <Text style={styles.phoneCode}>+56 9</Text>
                            </View>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="1234 5678"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                maxLength={8}
                                value={user?.phone}
                                onChangeText={(text) => setUser({ ...user, phone: text })}
                            />
                        </View>
                    </View>
                </View>
                {/* Campos obligatorios */}
                <View className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
                    <Text className="text-amber-800 text-sm">
                        <Text className="font-bold">*</Text> Campos obligatorios
                    </Text>
                </View>
            </ScrollView>

            {/* Botón Guardar Fijo */}
            <View className="px-6 pb-6 pt-4 bg-white border-t border-gray-200">
                <TouchableOpacity 
                    className={`rounded-xl p-4 w-full ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
    phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderRadius: 5,
    borderColor: '#7a797a',
    color: '#7a797a',
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  phoneCode: {
    color: '#7a797a',
    fontSize: 15,
    marginRight: 10,
    borderRightColor: '#7a797a',
    borderRightWidth: 1,
    paddingRight: 10,
  },
});
