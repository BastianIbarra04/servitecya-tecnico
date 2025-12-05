import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Image,
  Platform,
  TextInput 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../components/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

export default function CompleteService() {
  const router = useRouter();
  const { serviceRequestId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams();
  const { technicianId } = useLocalSearchParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');

  // Solicitar permisos para la cámara y galería
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos permisos para acceder a la cámara y galería.');
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      Alert.alert('Error', 'Por favor agrega al menos una imagen como evidencia');
      return null;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', { 
          uri, 
          name: `service_evidence_${serviceRequestId}_${index}_${filename}`, 
          type 
        });
      });

      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return uploadRes.data.images;
    } catch (error) {
      Alert.alert('Error', 'No se pudieron subir las imágenes');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const completeService = async () => {
    if (images.length === 0) {
      Alert.alert('Error', 'Por favor agrega al menos una imagen como evidencia del trabajo realizado');
      return;
    }

    Alert.alert(
      'Confirmar Completación',
      '¿Estás seguro de que has completado el servicio? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, completar', 
          onPress: handleCompleteConfirmation 
        }
      ]
    );
  };

  const handleCompleteConfirmation = async () => {
    try {
      setLoading(true);

      console.log(offerId, 'offerId'); // DEBUG
      console.log(technicianId, 'technicianId'); // DEBUG

      // 1️⃣ Subir imágenes
      const Images = await uploadImages();
      if (!Images) return;

      // 2️⃣ Actualizar estado del servicio y guardar evidencia
      await axios.post(`${API_URL}/service/complete`, {
        serviceRequestId: Number(serviceRequestId),
        technicianId: Number(technicianId),
        images: Images,
        finalNotes: description.trim() || 'Servicio completado satisfactoriamente',
        offerId: Number(offerId)
      });

      Alert.alert(
        '¡Servicio Completado!',
        'El servicio ha sido marcado como completado exitosamente.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/my-offers') 
          }
        ]
      );

    } catch (error) {
      console.error('Error completing service:', error);
      Alert.alert('Error', 'No se pudo completar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
                    <TouchableOpacity 
                      className="mr-3 p-2"
                      onPress={() => router.back()}
                    >
                      <FontAwesome name="chevron-left" size={18} color="#374151" />
                    </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Completar Servicio</Text>
            <Text className="text-gray-500 mt-1 text-base">
              Agrega evidencia del trabajo realizado
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Información del Servicio */}
        <View className="bg-white rounded-xl mx-4 mt-4 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-3">Servicio #{serviceRequestId}</Text>
          <Text className="text-gray-600 text-sm">
            Sube fotos que demuestren que el servicio fue completado correctamente
          </Text>
        </View>

        {/* Sección de Evidencia con Imágenes */}
        <View className="bg-white rounded-xl mx-4 mt-4 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Evidencia Fotográfica</Text>
          
          {/* Contador de imágenes */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-600">
              {images.length} {images.length === 1 ? 'imagen' : 'imágenes'} seleccionada{images.length !== 1 ? 's' : ''}
            </Text>
            <Text className="text-sm text-gray-500">Mínimo: 1 imagen</Text>
          </View>

          {/* Grid de imágenes */}
          {images.length > 0 && (
            <View className="flex-row flex-wrap -mx-1 mb-4">
              {images.map((uri, index) => (
                <View key={index} className="w-1/3 p-1">
                  <View className="relative">
                    <Image 
                      source={{ uri }} 
                      className="w-full h-24 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                      onPress={() => removeImage(index)}
                    >
                      <FontAwesome name="times" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Botones para agregar imágenes */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center"
              onPress={takePhoto}
              disabled={uploading}
            >
              <FontAwesome name="camera" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Tomar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-purple-500 rounded-xl py-3 flex-row items-center justify-center"
              onPress={pickImage}
              disabled={uploading}
            >
              <FontAwesome name="image" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Galería</Text>
            </TouchableOpacity>
          </View>

          {uploading && (
            <View className="flex-row items-center justify-center mt-4">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 ml-2">Subiendo imágenes...</Text>
            </View>
          )}
        </View>

        {/* Notas Adicionales */}
        <View className="bg-white rounded-xl mx-4 mt-4 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-3">Notas Adicionales (Opcional)</Text>
          <TextInput
            className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-800 min-h-[100px] text-base"
            placeholder="Describe cualquier detalle adicional sobre la finalización del servicio..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
          />
        </View>

        {/* Información Importante */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl mx-4 mt-4 p-4">
          <View className="flex-row items-start">
            <FontAwesome name="exclamation-triangle" size={16} color="#D97706" />
            <Text className="text-yellow-800 ml-2 flex-1 text-sm">
              <Text className="font-semibold">Importante:</Text> Asegúrate de que las fotos muestren claramente el trabajo completado. Esta evidencia será revisada por el cliente.
            </Text>
          </View>
        </View>

        {/* Espacio para el botón fijo */}
        <View className="h-32" />
      </ScrollView>

      {/* Botón Fijo en la Parte Inferior */}
      <View 
        className="bg-white border-t border-gray-200 px-4 py-4 absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity 
          className={`rounded-xl py-4 items-center justify-center shadow-lg ${
            loading || uploading
              ? 'bg-gray-400' 
              : images.length === 0
              ? 'bg-gray-300'
              : 'bg-green-600'
          }`}
          onPress={completeService}
          disabled={loading || uploading || images.length === 0}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white text-lg font-semibold ml-2">
                Completando...
              </Text>
            </View>
          ) : uploading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white text-lg font-semibold ml-2">
                Subiendo evidencia...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <FontAwesome name="check-circle" size={20} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Confirmar Completación
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}