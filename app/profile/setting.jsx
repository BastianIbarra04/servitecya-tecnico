import {View, Text, TouchableOpacity, Image, TextInput} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { API_URL } from '../../components/config/api.js';
import { Alert } from "react-native";
import { StyleSheet } from "react-native";
import { useRouter } from 'expo-router';


export default function Settings(){

    const [user, setUser] = useState(null);
    const [edit, setEdit] = useState(false);
    const router = useRouter();

      useEffect(() => {
        const fetchUser = async () => {
        try {
            const id = await AsyncStorage.getItem("userId");
            if (!id) return;
            const { data } = await axios.get(`${API_URL}/user/${id}`);
            setUser(data);
            
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo obtener el usuario.");

        }
        };

            fetchUser();
        }, []);

    const handleSave = async () => {
        try {
        const id = await AsyncStorage.getItem("userId");
        if (!id) return;
        await axios.put(`${API_URL}/user/${id}`, user);
        Alert.alert("Éxito", "Perfil actualizado correctamente.");
        router.replace('/profile');
        } catch (error) {
        console.error(error);
        Alert.alert("Error", "No se pudo actualizar el perfil.");
        }
    }

    const handleEdit = () => {
        setEdit(true);
    }

    return(
        
        <View className="flex-1 justify-center px-6 items-center bg-gray-50">
            <TextInput
           placeholder="Nombre"
            placeholderTextColor={"#7a797a"}
           style={styles.input}
           value={user?.name}
           onChangeText={(text) => setUser({ ...user, name: text })}
           />
           <TextInput
           style={styles.input}
           placeholder="Apellido"
           placeholderTextColor={"#7a797a"}
           value={user?.lastname}
           onChangeText={(text) => setUser({ ...user, lastname: text })}
           />
           <TextInput
           style={styles.input}
           placeholder="Correo electrónico"
           placeholderTextColor={"#7a797a"}
           value={user?.email}
           onChangeText={(text) => setUser({ ...user, email: text })}
           />
        <View style={styles.phoneContainer}>
            <Text style={styles.phoneCode}>+56 9</Text>
            <TextInput
            style={{ width: '100%', height: '100%', color: '#7a797a' }}
            placeholder="Número de teléfono"
            placeholderTextColor="#7a797a"
            keyboardType="phone-pad"
            maxLength={8}
            value={user?.phone}
            onChangeText={(text) => setUser({ ...user, phone: text })}
            />
        </View>
           <TouchableOpacity className="bg-blue-500 rounded-lg p-2 mb-4 w-full" onPress={handleSave}>
           <Text className="text-white text-center">Guardar Cambios</Text>
           </TouchableOpacity>
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
