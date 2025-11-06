import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { API_URL } from '../../components/config/api.js';
import CustomPicker from '../../components/picker/picker';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function FilesScreen() {
  const [technicianData, setTechnicianData] = useState(null);
  const [images, setImages] = useState([]);
  const [secNumber, setSecNumber] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState("");
    const insets = useSafeAreaInsets();

  // 🔹 Cargar datos guardados del registro anterior
  useEffect(() => {
    const loadData = async () => {
      const values = await AsyncStorage.multiGet([
        'email', 'password', 'name', 'lastname', 'phone', 'birthDate'
      ]);
      const data = Object.fromEntries(values);
      setTechnicianData(data);
      console.log('Loaded technician data:', data);
    };
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/specialties`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
    loadData();
  }, []);


  // 🔹 Seleccionar imágenes o documentos
  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...selected]);
    }
  };

  // 🔹 Enviar datos al backend
  const handleSubmit = async () => {
    if (!secNumber || !city || images.length === 0) {
      Alert.alert('Faltan datos', 'Completa todos los campos y sube al menos una imagen.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      // datos del técnico
      formData.append('email', technicianData.email);
      formData.append('password', technicianData.password);
      formData.append('name', technicianData.name);
      formData.append('lastname', technicianData.lastname);
      formData.append('phone', technicianData.phone);
      formData.append('birthDate', technicianData.birthDate);
      formData.append('secNumber', secNumber);
      formData.append('city', city);
      formData.append('description', description);
        formData.append('specialtyId', selectedServiceId);


      // imágenes
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('files', { uri, name: filename, type });
      });

        const response = await axios.post(`${API_URL}/auth/registerTec`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });


      if (response.status === 200) {
        Alert.alert('Éxito', 'Técnico registrado correctamente');
        await AsyncStorage.clear();
        router.replace('/home');
      } else {
        Alert.alert('Error', 'No se pudo registrar el técnico');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al registrar el técnico');
    } finally {
      setLoading(false);
    }
  };

  if (!technicianData) {
    return <ActivityIndicator size="large" color="#0000ff" className="flex-1" />;
  }

  return (
    <View className="flex-1 bg-white p-5 justify-center" >

        <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/register')}>
            <FontAwesome name="close" size={24} color="black" />
        </TouchableOpacity>
      <Text className="text-2xl text-[#7a797a] font-bold mb-4 text-center">Ingresa tus datos de tecnico</Text>
      
        {/* Selector de especialidad */}
        <View>
            <Text className="text-gray-700 mb-2">Selecciona tu especialidad:</Text>
            <CustomPicker 
                services={services}
                selectedServiceId={selectedServiceId}
                setSelectedServiceId={setSelectedServiceId}
                selectedServiceName={selectedServiceName}
                setSelectedServiceName={setSelectedServiceName}
            />
        </View>
    
    {/* Número SEC */}
      <TextInput
        placeholder="Folio SEC"
        value={secNumber}
        onChangeText={setSecNumber}
        className="border border-gray-300 rounded-lg p-3 mb-3 mt-3"
        style={styles.input}
      />

      {/* Ciudad */}
      <TextInput
        placeholder="Ciudad"
        value={city}
        onChangeText={setCity}
        className="border border-gray-300 rounded-lg p-3 mb-3"
        style={styles.input}
      />

      {/* Descripción */}
      <TextInput
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        className="border border-gray-300 rounded-lg p-3 mb-3"
        multiline
        numberOfLines={4}
        color="#7a797a"
        style={[styles.input, { height: 100 }]}
      />

      {/* Subida de imágenes */}
      <TouchableOpacity
        onPress={handleImageUpload}
        className="bg-gray-100 border border-dashed border-gray-400 rounded-lg h-24 items-center justify-center mb-4"
      >
        <Text className="text-gray-600">Seleccionar archivos o fotos</Text>
      </TouchableOpacity>

      {/* Vista previa de imágenes */}
      <View className="flex-row flex-wrap justify-center mb-4">
        {images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={{ width: 80, height: 80, margin: 5, borderRadius: 10 }}
          />
        ))}
      </View>

      {/* Botón de envío */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className="bg-[#fc7f20] p-4 rounded-xl"
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? 'Registrando...' : 'Finalizar Registro'}
        </Text>
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
    color: '#000000',
  },closeButton: {
    position: 'absolute',
    top: 60 ,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
});
