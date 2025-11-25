import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { API_URL } from '../../components/config/api.js';
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
  const insets = useSafeAreaInsets();

  // Especialidades que requieren SEC
  const SEC_REQUIRED_SPECIALTIES = ['gasfitería', 'electricidad', 'gasfiteria', 'electricista'];
  
  const [requiresSEC, setRequiresSEC] = useState(false);

  // 🔹 Cargar datos guardados del registro anterior
  useEffect(() => {
    const loadData = async () => {
      try {
        const values = await AsyncStorage.multiGet([
          'email', 'password', 'name', 'lastname', 'phone', 'birthDate', 'specialties'
        ]);
        const data = Object.fromEntries(values);
        setTechnicianData(data);
        
        // Verificar si alguna especialidad requiere SEC
        if (data.specialties) {
          const specialties = JSON.parse(data.specialties);
          const hasSECSpecialty = specialties.some(specialty => 
            SEC_REQUIRED_SPECIALTIES.some(secSpec => 
              specialty.name.toLowerCase().includes(secSpec.toLowerCase())
            )
          );
          setRequiresSEC(hasSECSpecialty);
          console.log('Requires SEC:', hasSECSpecialty);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
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
    // Validaciones básicas
    if (!city || images.length === 0) {
      Alert.alert('Faltan datos', 'Completa la ciudad y sube al menos una imagen.');
      return;
    }

    // Validación específica para SEC
    if (requiresSEC && !secNumber) {
      Alert.alert('Número SEC requerido', 'Para tu especialidad es necesario ingresar tu número SEC.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      // datos del técnico desde AsyncStorage
      formData.append('email', technicianData.email);
      formData.append('password', technicianData.password);
      formData.append('name', technicianData.name);
      formData.append('lastname', technicianData.lastname);
      formData.append('phone', technicianData.phone);
      formData.append('birthDate', technicianData.birthDate);
      formData.append('city', city);
      formData.append('description', description || '');

      // Solo agregar SEC si es requerido
      if (requiresSEC) {
        formData.append('secNumber', secNumber);
      }

      // Agregar especialidades
      if (technicianData.specialties) {
        const specialties = JSON.parse(technicianData.specialties);
        // Tomar la primera especialidad como principal (puedes ajustar esto)
        if (specialties.length > 0) {
          formData.append('specialtyId', specialties[0].id);
        }
      }

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
        router.replace('/login');
      } else {
        Alert.alert('Error', 'No se pudo registrar el técnico');
      }

    } catch (error) {
      if(error.response?.status === 400){
        Alert.alert("Error", "El correo ya está registrado.");
      } else {
        console.error(error);
        Alert.alert('Error', 'Hubo un problema al registrar el técnico');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!technicianData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#fc7f20" />
        <Text className="text-gray-600 mt-4">Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-orange-500 rounded-2xl items-center justify-center mb-3 shadow-lg">
            <FontAwesome name="id-card" size={28} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Información Profesional
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Completa tus datos profesionales
          </Text>
        </View>

        {/* Progress Indicator */}
        <View className="flex-row justify-center mb-6">
          <View className="w-3 h-3 bg-gray-300 rounded-full mx-1"></View>
          <View className="w-3 h-3 bg-orange-500 rounded-full mx-1"></View>
        </View>

        {/* SEC Number - Solo si es requerido */}
        {requiresSEC && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Número SEC *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-base"
              placeholder="Ingresa tu número SEC"
              placeholderTextColor="#9CA3AF"
              value={secNumber}
              onChangeText={setSecNumber}
              keyboardType="number-pad"
              maxLength={20}
            />
            <Text className="text-xs text-orange-600 mt-1">
              Requerido para tu especialidad
            </Text>
          </View>
        )}

        {/* Ciudad */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Ciudad *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-base"
            placeholder="Ciudad donde trabajas"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Descripción */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-base"
            placeholder="Describe tu experiencia y servicios..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
        </View>

        {/* Subida de imágenes */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Documentos de certificación *
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            {requiresSEC 
              ? "Sube tu certificado SEC y otros documentos que respalden tu experiencia"
              : "Sube documentos que respalden tu experiencia y certificaciones"
            }
          </Text>
          
          <TouchableOpacity
            onPress={handleImageUpload}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50"
          >
            <FontAwesome name="cloud-upload" size={32} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2 text-center">
              Toca para seleccionar archivos o fotos
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              Máximo 5 archivos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vista previa de imágenes */}
        {images.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Archivos seleccionados ({images.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                {images.map((uri, index) => (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <TouchableOpacity 
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                      onPress={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <FontAwesome name="times" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Botón de envío */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-xl py-4 items-center justify-center ${
            loading 
              ? 'bg-orange-400' 
              : 'bg-orange-500'
          } shadow-lg`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Registrando...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-semibold">
              Finalizar Registro
            </Text>
          )}
        </TouchableOpacity>

        {/* Información adicional */}
        {requiresSEC && (
          <View className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-blue-800 text-sm">
              💡 El número SEC es tu identificación oficial para ejercer como técnico certificado.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}