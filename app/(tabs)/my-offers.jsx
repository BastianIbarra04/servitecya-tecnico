import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../components/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyOffers() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'active', 'completed'
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      fetchMyOffers();
    }, [])
  );

  const fetchMyOffers = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const technicianId = await AsyncStorage.getItem('technicianId');
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
      setRefreshing(false);
    }
  };

  // Filtrar ofertas según el filtro activo
  const filteredOffers = offers.filter(offer => {
    switch (activeFilter) {
      case 'pending':
        return offer.status === 'PENDING';
      case 'active':
        return ['ACCEPTED', 'IN_PROGRESS'].includes(offer.status);
      case 'completed':
        return ['COMPLETED', 'PAID', 'REJECTED'].includes(offer.status);
      default:
        return true; // 'all'
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 border-green-300';
      case 'IN_PROGRESS': return 'bg-purple-100 border-purple-300';
      case 'COMPLETED': return 'bg-gray-100 border-gray-300';
      case 'PAID': return 'bg-emerald-100 border-emerald-300';
      case 'REJECTED': return 'bg-red-100 border-red-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'Aceptada';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completada';
      case 'PAID': return 'Pagada';
      case 'REJECTED': return 'Rechazada';
      default: return 'Pendiente';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'check-circle';
      case 'IN_PROGRESS': return 'play-circle';
      case 'COMPLETED': return 'check-square-o';
      case 'PAID': return 'money';
      case 'REJECTED': return 'times-circle';
      default: return 'clock-o';
    }
  };

  const getStatusIconColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return '#059669';
      case 'IN_PROGRESS': return '#7C3AED';
      case 'COMPLETED': return '#6B7280';
      case 'PAID': return '#047857';
      case 'REJECTED': return '#DC2626';
      default: return '#3B82F6';
    }
  };

  const getFilterCount = (filterType) => {
    switch (filterType) {
      case 'pending': return offers.filter(o => o.status === 'PENDING').length;
      case 'active': return offers.filter(o => ['ACCEPTED', 'IN_PROGRESS'].includes(o.status)).length;
      case 'completed': return offers.filter(o => ['COMPLETED', 'PAID', 'REJECTED'].includes(o.status)).length;
      default: return offers.length;
    }
  };

  const handleOfferPress = (offer) => {
    if (['ACCEPTED', 'IN_PROGRESS'].includes(offer.status)) {
      // Navegar a gestión de servicio activo
      router.push(`/offer-detail/${offer.id}`);
    } else {
      // Navegar a vista normal de oferta
      router.push(`/offer-detail/${offer.id}`);
    }
  };

  const FilterButton = ({ filter, label, count, isActive }) => (
    <TouchableOpacity
      className={`px-2 rounded-lg flex-row items-center mr-2 min-h-[44px] max-h-[44px] justify-center ${
        isActive 
          ? 'bg-blue-500 border-2 border-blue-600' 
          : 'bg-white border-2 border-gray-300'
      }`}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        className={`font-semibold text-sm ${
          isActive ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
      <View 
        className={`ml-2 rounded-full min-w-[24px] items-center justify-center ${
          isActive ? 'bg-blue-600' : 'bg-gray-100'
        }`}
      >
        <Text 
          className={`text-xs font-bold ${
            isActive ? 'text-white' : 'text-gray-600'
          }`}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4 text-lg font-bold">Cargando ofertas...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header Mejorado */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Mis Ofertas</Text>
        <Text className="text-gray-500 mt-1 text-base">
          Gestiona tus servicios y ofertas
        </Text>
      </View>

      {/* Filtros - CORREGIDO */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        className=" min-h-[70px] max-h-[70px] px-4 py-3"
      >
        <FilterButton
          filter="all"
          label="Todas"
          count={getFilterCount('all')}
          isActive={activeFilter === 'all'}
        />
        <FilterButton
          filter="pending"
          label="Pendientes"
          count={getFilterCount('pending')}
          isActive={activeFilter === 'pending'}
        />
        <FilterButton
          filter="active"
          label="Activas"
          count={getFilterCount('active')}
          isActive={activeFilter === 'active'}        
        />
        <FilterButton
          filter="completed"
          label="Finalizadas"
          count={getFilterCount('completed')}
          isActive={activeFilter === 'completed'}        
        />
      </ScrollView>

      <FlatList
        data={filteredOffers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => fetchMyOffers(true)}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-6">
            <FontAwesome 
              name={activeFilter === 'all' ? "inbox" : "filter"} 
              size={48} 
              color="#9CA3AF" 
            />
            <Text className="text-xl font-semibold text-gray-500 text-center mt-4 mb-2">
              {activeFilter === 'all' 
                ? 'No has enviado ofertas' 
                : `No hay ofertas ${getFilterLabel(activeFilter)}`
              }
            </Text>
            <Text className="text-gray-400 text-center text-base">
              {activeFilter === 'all' 
                ? 'Tus ofertas aparecerán aquí cuando las envíes' 
                : 'Intenta con otro filtro o crea nuevas ofertas'
              }
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            className={`bg-white rounded-2xl p-4 mb-3 border-2 ${getStatusColor(item.status)} shadow-sm`}
            onPress={() => handleOfferPress(item)}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-lg" numberOfLines={2}>
                  {item.serviceRequest?.description || 'Solicitud de servicio'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <FontAwesome name="user" size={12} color="#6B7280" />
                  <Text className="text-gray-600 text-sm ml-1 font-medium">
                    {item.serviceRequest?.user?.name || 'Cliente no especificado'}
                  </Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full flex-row items-center ${
                item.status === 'ACCEPTED' ? 'bg-green-500' : 
                item.status === 'IN_PROGRESS' ? 'bg-purple-500' :
                item.status === 'COMPLETED' ? 'bg-gray-500' :
                item.status === 'PAID' ? 'bg-emerald-500' :
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

            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-2xl font-bold text-green-600">
                ${item.price?.toLocaleString('es-CL')}
              </Text>
              
              <View className="flex-row items-center space-x-3">
                <View className="flex-row items-center">
                  <FontAwesome name="comment" size={12} color="#6B7280" />
                  <Text className="text-gray-500 text-xs ml-1">
                    {item._count?.messages || 0}
                  </Text>
                </View>
                
                {/* Indicador de acción disponible */}
                {item.status === 'PENDING' && (
                  <View className="flex-row items-center bg-orange-100 px-2 py-1 rounded-full">
                    <FontAwesome name="exclamation" size={10} color="#F59E0B" />
                    <Text className="text-orange-700 text-xs font-medium ml-1">
                      Esperando
                    </Text>
                  </View>
                )}
                
                {['ACCEPTED', 'IN_PROGRESS'].includes(item.status) && (
                  <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                    <FontAwesome name="play" size={10} color="#059669" />
                    <Text className="text-green-700 text-xs font-medium ml-1">
                      Activo
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Información adicional */}
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 text-xs font-medium">
                Enviada el {new Date(item.createdAt).toLocaleDateString('es-CL')}
              </Text>
              
              {item.serviceRequest?.specialty?.name && (
                <View className="bg-gray-100 px-2 py-1 rounded-full">
                  <Text className="text-gray-600 text-xs font-medium">
                    {item.serviceRequest.specialty.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Indicador de navegación contextual */}
            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100">
              <Text className="text-blue-500 text-xs font-medium">
                {['ACCEPTED', 'IN_PROGRESS'].includes(item.status) 
                  ? 'Gestionar servicio →' 
                  : 'Ver detalles →'
                }
              </Text>
              <FontAwesome 
                name="chevron-right" 
                size={10} 
                color="#3B82F6" 
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  function getFilterLabel(filter) {
    switch (filter) {
      case 'pending': return 'pendientes';
      case 'active': return 'activas';
      case 'completed': return 'finalizadas';
      default: return '';
    }
  }
}