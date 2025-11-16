import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../components/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function MyOffers() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      fetchMyOffers();
    }, [])
  );

  const fetchMyOffers = async () => {
    try {
      const technicianId = await AsyncStorage.getItem('technicianId');
      console.log('Fetching offers for technicianId:', technicianId);
      const response = await axios.get(`${API_URL}/technician/my-offers`, {
        params: {
         technicianId: Number(technicianId),
        },
      });
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 border-green-300';
      case 'REJECTED': return 'bg-red-100 border-red-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'Aceptada';
      case 'REJECTED': return 'Rechazada';
      default: return 'Pendiente';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'check-circle';
      case 'REJECTED': return 'times-circle';
      default: return 'clock-o';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4 text-lg">Cargando ofertas...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{paddingTop: insets.top}}>
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Mis Ofertas</Text>
        <Text className="text-gray-500 mt-1">
          {offers.length} oferta{offers.length !== 1 ? 's' : ''} enviada{offers.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-6">
            <FontAwesome name="inbox" size={48} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-500 text-center mt-4 mb-2">
              No has enviado ofertas
            </Text>
            <Text className="text-gray-400 text-center">
              Tus ofertas aparecerán aquí cuando las envíes
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            className={`bg-white rounded-2xl p-4 mb-3 border-2 ${getStatusColor(item.status)} shadow-sm`}
            onPress={() => router.push(`/offer-detail/${item.id}`)}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-lg" numberOfLines={2}>
                  {item.serviceRequest?.description || 'Solicitud de servicio'}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  Cliente: {item.serviceRequest?.user?.name || 'No especificado'}
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full flex-row items-center ${
                item.status === 'ACCEPTED' ? 'bg-green-500' : 
                item.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-500'
              }`}>
                <FontAwesome 
                  name={getStatusIcon(item.status)} 
                  size={12} 
                  color="white" 
                />
                <Text className="text-white font-semibold text-xs ml-1">
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-bold text-green-600">
                ${item.price?.toLocaleString('es-CL')}
              </Text>
              
              <View className="flex-row items-center">
                <FontAwesome name="comment" size={14} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  {item._count?.messages || 0} mensajes
                </Text>
              </View>
            </View>

            <Text className="text-gray-400 text-xs mt-2">
              Enviada el {new Date(item.createdAt).toLocaleDateString('es-CL')}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}