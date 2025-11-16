import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../components/config/api.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

export default function RequestsBySpecialty() {
  const [specialtyId, setSpecialtyId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const getUserSpecialtyIds = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return [];
      const res = await axios.get(`${API_URL}/tecSpecialty/${userId}`);
      const specialties = res.data.specialties;
      return specialties.map((s) => s.id);
    } catch (error) {
      console.error('Error obteniendo las especialidades del usuario:', error);
      return [];
    }
  };

  const fetchNearbyRequests = async () => {
    setRefreshing(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso denegado para acceder a la ubicación');
      setRefreshing(false);
      return;
    }

    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      const specialtyIds = await getUserSpecialtyIds();
      
      if (specialtyIds.length === 0) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const res = await axios.post(`${API_URL}/service-requests/nearby`, {
        lat: latitude,
        lon: longitude,
        specialties: specialtyIds[0],
      });
      
      setRequests(res.data);
    } catch (err) {
      console.error('Error obteniendo solicitudes cercanas:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchNearbyRequests();
  }, []);

  useEffect(() => {
    fetchNearbyRequests();
  }, []);

  const formatDistance = (distance) => {
    return parseFloat(distance).toFixed(1);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      
      {/* Header Mejorado */}
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 text-center">
          Solicitudes Cercanas
        </Text>
        <Text className="text-sm text-gray-600 text-center mt-1">
          Trabajos disponibles en tu área
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6600" />
          <Text className="text-gray-500 mt-4 text-lg">Buscando solicitudes...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF6600']}
              tintColor="#FF6600"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-6">
              <FontAwesome name="map-marker" size={48} color="#9CA3AF" />
              <Text className="text-lg text-gray-500 text-center mt-4 font-medium">
                No hay solicitudes cercanas en este momento
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-2">
                Las nuevas solicitudes aparecerán aquí automáticamente
              </Text>
              <TouchableOpacity 
                onPress={fetchNearbyRequests}
                className="bg-orange-500 px-6 py-3 rounded-full mt-6"
              >
                <Text className="text-white font-semibold">Intentar de nuevo</Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            requests.length > 0 && (
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-800">
                  {requests.length} solicitud{requests.length !== 1 ? 'es' : ''} encontrada{requests.length !== 1 ? 's' : ''}
                </Text>
                <TouchableOpacity 
                  onPress={fetchNearbyRequests}
                  className="flex-row items-center bg-orange-500 px-4 py-2 rounded-lg"
                >
                  <FontAwesome name="refresh" size={16} color="white" />
                  <Text className="text-white font-medium ml-2">Actualizar</Text>
                </TouchableOpacity>
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100"
              onPress={() => router.push(`/request/${item.id}?distancia=${item.distancia}`)}
              activeOpacity={0.7}
            >
              {/* Imágenes del servicio con indicador */}
              {item.photos?.length > 0 && (
                <View className="relative">
                  <FlatList
                    horizontal
                    data={item.photos}
                    keyExtractor={(photo, idx) => idx.toString()}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item: photo }) => (
                      <Image
                        source={{ uri: `${API_URL}${photo}` }}
                        className="w-32 h-32 mr-2"
                        resizeMode="cover"
                      />
                    )}
                    contentContainerStyle={{ padding: 12 }}
                  />
                  {item.photos.length > 1 && (
                    <View className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-medium">
                        +{item.photos.length - 1}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Contenido de la tarjeta */}
              <View className="p-4">
                {/* Header de la tarjeta */}
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">
                    {item.description}
                  </Text>
                  {item.distancia && (
                    <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                      <FontAwesome name="location-arrow" size={12} color="#3B82F6" />
                      <Text className="text-blue-600 text-sm font-medium ml-1">
                        {formatDistance(item.distancia)} km
                      </Text>
                    </View>
                  )}
                </View>

                {/* Información del cliente */}
                <View className="flex-row items-center mb-3">
                  <FontAwesome name="user" size={14} color="#3B82F6" />
                  <Text className="text-gray-600 ml-2 text-base">
                    {item.user?.name || 'Cliente'}
                  </Text>
                </View>

                {/* Especialidad */}
                <View className="flex-row items-center mb-3">
                  <FontAwesome name="wrench" size={14} color="#F59E0B" />
                  <Text className="text-gray-600 ml-2 text-base">
                    {item.specialty?.name || 'Especialidad no especificada'}
                  </Text>
                </View>

                {/* Footer de la tarjeta */}
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <FontAwesome name="calendar" size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {new Date(item.createdAt).toLocaleDateString('es-CL')}
                    </Text>
                    <Text className="text-gray-500 text-sm ml-1">
                      {new Date(item.createdAt).toLocaleTimeString('es-CL')}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-orange-500 font-semibold text-base">
                      Ver detalles
                    </Text>
                    <FontAwesome name="chevron-right" size={12} color="#FF6600" className="ml-1" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}