import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../components/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ServiceManagement() {
  const router = useRouter();
  const { serviceRequestId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceRequestId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const technicianId = await AsyncStorage.getItem('technicianId');
      const response = await axios.get(`${API_URL}/service-detail/${serviceRequestId}`)
      console.log('Service details response:', response.data);
      setService(response.data);
      
    } catch (error) {
      console.error('Error fetching service details:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del servicio');
    } finally {
      setLoading(false);
    }
  };

  const updateServiceStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const technicianId = await AsyncStorage.getItem('technicianId');
      
      await axios.patch(`${API_URL}/technician/update-service-status`, {
        serviceRequestId: Number(id),
        technicianId: Number(technicianId),
        status: newStatus
      });

      // Actualizar el estado local
      setService(prev => ({
        ...prev,
        status: newStatus
      }));

      Alert.alert('Éxito', `Estado actualizado a ${getStatusText(newStatus)}`);
      
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const completeService = async () => {
    Alert.alert(
      'Completar Servicio',
      '¿Estás seguro de que has completado el servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, completar', 
          onPress: () => updateServiceStatus('COMPLETED')
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-500';
      case 'IN_PROGRESS': return 'bg-purple-500';
      case 'COMPLETED': return 'bg-gray-500';
      case 'PAID': return 'bg-emerald-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'Aceptada';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completada';
      case 'PAID': return 'Pagada';
      default: return 'Pendiente';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'check-circle';
      case 'IN_PROGRESS': return 'play-circle';
      case 'COMPLETED': return 'check-square-o';
      case 'PAID': return 'money';
      default: return 'clock-o';
    }
  };

  const getActionButtons = () => {
    switch (service?.serviceRequest?.status) {
      case 'ACCEPTED':
        return (
          <TouchableOpacity
            className="bg-purple-500 rounded-xl py-4 px-6 flex-row items-center justify-center mb-3"
            onPress={() => updateServiceStatus('IN_PROGRESS')}
            disabled={updating}
          >
            <FontAwesome name="play" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              {updating ? 'Actualizando...' : 'Comenzar Servicio'}
            </Text>
          </TouchableOpacity>
        );
      
      case 'IN_PROGRESS':
        return (
          <TouchableOpacity
            className="bg-green-600 rounded-xl py-4 px-6 flex-row items-center justify-center mb-3"
            onPress={completeService}
            disabled={updating}
          >
            <FontAwesome name="check" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              {updating ? 'Actualizando...' : 'Completar Servicio'}
            </Text>
          </TouchableOpacity>
        );
      
      case 'COMPLETED':
        return (
          <View className="bg-gray-500 rounded-xl py-4 px-6 flex-row items-center justify-center mb-3">
            <FontAwesome name="check-circle" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Servicio Completado
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4 text-lg">Cargando servicio...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50" style={{ paddingTop: insets.top }}>
        <FontAwesome name="exclamation-triangle" size={48} color="#6B7280" />
        <Text className="text-gray-500 mt-4 text-lg text-center">No se encontró el servicio</Text>
        <TouchableOpacity 
          className="bg-blue-500 rounded-lg px-6 py-3 mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Gestión de Servicio</Text>
            <View className="flex-row items-center mt-1">
              <View className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor(service.serviceRequest?.status)}`}>
                <FontAwesome 
                  name={getStatusIcon(service.serviceRequest?.status)} 
                  size={12} 
                  color="white" 
                />
                <Text className="text-white font-semibold text-xs ml-1">
                  {getStatusText(service.serviceRequest?.status)}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            className="bg-gray-100 p-2 rounded-full"
            onPress={fetchServiceDetails}
          >
            <FontAwesome name="refresh" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Información del Servicio */}
        <View className="bg-white rounded-xl mx-4 mt-4 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-3">Descripción del Servicio</Text>
          <Text className="text-gray-700 text-base leading-6">
            {service.serviceRequest?.description || 'No hay descripción disponible'}
          </Text>
          
          <View className="border-t border-gray-200 mt-4 pt-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">Detalles</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <FontAwesome name="user" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-3 flex-1">Cliente:</Text>
                <Text className="text-gray-900 font-semibold">
                  {service.serviceRequest?.user?.name || 'No especificado'}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <FontAwesome name="phone" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-3 flex-1">Contacto:</Text>
                <Text className="text-gray-900 font-semibold">
                  {service.serviceRequest?.user?.phone || 'No disponible'}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <FontAwesome name="tag" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-3 flex-1">Especialidad:</Text>
                <Text className="text-gray-900 font-semibold">
                  {service.serviceRequest?.specialty?.name || 'No especificada'}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <FontAwesome name="calendar" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-3 flex-1">Solicitado:</Text>
                <Text className="text-gray-900 font-semibold">
                  {new Date(service.serviceRequest?.createdAt).toLocaleDateString('es-CL')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información de la Oferta */}
        <View className="bg-white rounded-xl mx-4 mt-4 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-3">Tu Oferta</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 text-lg">Precio ofertado:</Text>
              <Text className="text-green-600 font-bold text-2xl">
                ${service.finalPrice?.toLocaleString('es-CL')}
              </Text>
            </View>
            
            <View className="flex-row items-center py-2">
              <FontAwesome name="clock-o" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-3 flex-1">Oferta enviada:</Text>
              <Text className="text-gray-900 font-semibold">
                {new Date(service.createdAt).toLocaleDateString('es-CL')}
              </Text>
            </View>
            
            {service.message && (
              <View className="bg-blue-50 rounded-lg p-3 mt-2">
                <Text className="text-blue-800 font-semibold mb-1">Tu mensaje al cliente:</Text>
                <Text className="text-blue-700">{service.message}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Ubicación (si está disponible) */}
        {service.serviceRequest?.location && (
          <View className="bg-white rounded-xl mx-4 mt-4 p-5 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Ubicación</Text>
            <View className="flex-row items-start">
              <FontAwesome name="map-marker" size={20} color="#EF4444" />
              <Text className="text-gray-700 ml-3 flex-1 text-base leading-6">
                {service.serviceRequest.location}
              </Text>
            </View>
          </View>
        )}

        {/* Acciones */}
        <View className="bg-white rounded-xl mx-4 mt-4 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-3">Acciones</Text>
          
          {getActionButtons()}
          
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 px-6 flex-row items-center justify-center mb-3"
            onPress={() => router.push(`/chat/${service.offerId}`)}
          >
            <FontAwesome name="comments" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Chat con Cliente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="border-2 border-gray-300 rounded-xl py-4 px-6 flex-row items-center justify-center"
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#6B7280" />
            <Text className="text-gray-700 font-semibold text-lg ml-2">Volver a Mis Ofertas</Text>
          </TouchableOpacity>
        </View>

        {/* Espacio al final */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}