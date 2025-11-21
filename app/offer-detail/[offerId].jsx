import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../components/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAddressFromCoords } from '../utils/geocoods.jsx';

export default function TechnicianOfferDetail() {
  const { offerId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [technicianId, setTechnicianId] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, [offerId]);

const loadInitialData = async () => {
  try {
    const techId = await AsyncStorage.getItem('technicianId');
    setTechnicianId(techId);
    
    const offerRes = await axios.get(`${API_URL}/technician-offer/${offerId}`);
    const offerData = offerRes.data;

    // Mostrar datos inmediatamente
    setOffer({
      ...offerData,
      displayAddress: "Obteniendo dirección..."
    });

    // Cargar dirección en background si está aceptada y tiene coordenadas
    if (offerData.status === 'ACCEPTED' && 
        offerData.serviceRequest?.latitude && 
        offerData.serviceRequest?.longitude) {
      
      loadAddressInBackground(offerData);
    } else {
      setOffer(prev => ({
        ...prev,
        displayAddress: "Dirección disponible al aceptar"
      }));
    }
    setLoading(false);
  } catch (error) {
    console.error('Error loading data:', error);
    setLoading(false);
  }
};

const loadAddressInBackground = async (offerData) => {
  try {
    const address = await getAddressFromCoords(
      offerData.serviceRequest.latitude, 
      offerData.serviceRequest.longitude
    );
    
    setOffer(prev => ({
      ...prev,
      displayAddress: address
    }));
    setLoading(false);
  } catch (error) {
    console.error('Error cargando dirección:', error);
    setOffer(prev => ({
      ...prev,
      displayAddress: `${offerData.serviceRequest.latitude.toFixed(4)}, ${offerData.serviceRequest.longitude.toFixed(4)}`
    }));
  }
};
  const handleViewLocation = () => {
    if (!offer.serviceRequest?.latitude || !offer.serviceRequest?.longitude) {
      Alert.alert('Error', 'No hay ubicación disponible para este servicio');
      return;
    }

    const { latitude, longitude } = offer.serviceRequest;
    
    Alert.alert(
      'Abrir Ubicación',
      '¿Cómo quieres ver la ubicación del cliente?',
      [
        {
          text: 'Google Maps',
          onPress: () => {
            const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            Linking.openURL(url).catch(() => 
              Alert.alert('Error', 'No se pudo abrir Google Maps')
            );
          }
        },
        {
          text: 'Waze',
          onPress: () => {
            const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
            Linking.openURL(url).catch(() => 
              Alert.alert('Error', 'No se pudo abrir Waze')
            );
          }
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const url = `http://maps.apple.com/?q=${latitude},${longitude}`;
            Linking.openURL(url).catch(() => 
              Alert.alert('Error', 'No se pudo abrir Apple Maps')
            );
          }
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const handleCallClient = () => {
    const phoneNumber = offer.serviceRequest?.user?.phone;
    if (!phoneNumber) {
      Alert.alert('Error', 'No hay número de teléfono disponible');
      return;
    }

    Alert.alert(
      'Llamar al cliente',
      `¿Quieres llamar a ${offer.serviceRequest.user.name}?`,
      [
        {
          text: 'Llamar',
          onPress: () => {
            const phoneUrl = `tel:${phoneNumber}`;
            Linking.openURL(phoneUrl).catch(() => 
              Alert.alert('Error', 'No se pudo realizar la llamada')
            );
          }
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const handleOpenChat = () => {
    console.log('Navegando al chat con ofertaId:', offerId);
    router.push(`/chat/${offerId}`);
  };

  const getOfferStatusConfig = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          bgColor: 'bg-green-50',
          icon: 'check-circle',
          iconColor: '#059669',
          text: 'Aceptada'
        };
      case 'REJECTED':
        return {
          bgColor: 'bg-red-50',
          icon: 'times-circle',
          iconColor: '#DC2626',
          text: 'Rechazada'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          icon: 'clock-o',
          iconColor: '#3B82F6',
          text: 'Pendiente'
        };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4 text-lg">Cargando oferta...</Text>
      </View>
    );
  }

  if (!offer) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <FontAwesome name="exclamation-triangle" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
          No se encontró la oferta
        </Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-full mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getOfferStatusConfig(offer.status);
  const isAccepted = offer.status === 'ACCEPTED';

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Header Compacto */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              className="p-2 mr-2"
              onPress={() => router.back()}
            >
              <FontAwesome name="chevron-left" size={16} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                {offer.serviceRequest?.user?.name} {offer.serviceRequest?.user?.lastname}
              </Text>
              <Text className="text-gray-500 text-sm">Cliente</Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
            <Text className="text-xs font-semibold" style={{ color: statusConfig.iconColor }}>
              {statusConfig.text}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Tarjeta Principal Compacta */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
          {/* Precio y Estado */}
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold text-green-600">
                  ${offer.price?.toLocaleString('es-CL')}
                </Text>
                <Text className="text-gray-500 text-sm">Precio ofertado</Text>
              </View>
              <View className="flex-row items-center">
                <FontAwesome name={statusConfig.icon} size={16} color={statusConfig.iconColor} />
                <Text className="text-gray-600 text-sm ml-1">{statusConfig.text}</Text>
              </View>
            </View>
          </View>

          {/* Información Compacta */}
          <View className="p-4 space-y-3">
            {/* Descripción */}
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-sm">Fecha de creación</Text>
              <Text className="text-gray-900 text-sm">
                {offer.createdAt ? format(new Date(offer.createdAt), "dd/MM/yyyy") : 'N/A'}
              </Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm mb-1">Solicitud</Text>
              <Text className="text-gray-900 text-base leading-5" numberOfLines={3}>
                {offer.serviceRequest?.description || 'Sin descripción'}
              </Text>
            </View>

            {/* Dirección - SOLO SI ESTÁ ACEPTADA */}
            {isAccepted && (
              <View className="flex-row items-start">
                <FontAwesome name="map-marker" size={14} color="#ef4444" className="mt-0.5" />
                <View className="ml-2 flex-1">
                  <Text className="text-gray-500 text-sm mb-1">Ubicación del servicio</Text>
                  <Text className="text-gray-900 text-sm leading-4">
                    {offer?.displayAddress || 'Dirección no especificada'}
                  </Text>
                </View>
              </View>
            )}

            {/* Especialidad y Contacto */}
            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-500 text-sm mb-1">Especialidad</Text>
                <Text className="text-gray-900 text-sm">
                  {offer.specialty?.name || 'No especificada'}
                </Text>
              </View>
              {offer.serviceRequest?.user?.phone && (
                <View>
                  <Text className="text-gray-500 text-sm mb-1">Contacto</Text>
                  <Text className="text-gray-900 text-sm">
                    {offer.serviceRequest.user.phone}
                  </Text>
                </View>
              )}
            </View>

            {/* Mensaje de la oferta */}
            {offer.message && (
              <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Text className="text-blue-800 font-medium text-sm mb-1">Tu mensaje</Text>
                <Text className="text-blue-700 text-sm leading-4">
                  {offer.message}
                </Text>
              </View>
            )}
          </View>
        </View>

{/* Acciones Rápidas */}
<View className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
  <View className="p-4 border-b border-gray-100">
    <Text className="font-semibold text-gray-900">Acciones</Text>
  </View>
  
  <View className="p-2">
    {/* Chat - SIEMPRE DISPONIBLE EXCEPTO RECHAZADO */}
    {offer.status !== 'REJECTED' && (
      <TouchableOpacity 
        className="flex-row items-center p-3 rounded-lg active:bg-gray-50 mb-2"
        onPress={handleOpenChat}
      >
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
          <FontAwesome name="comments" size={16} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-900">Abrir chat</Text>
          <Text className="text-gray-500 text-xs">
            {offer.status === 'PENDING' 
              ? 'Conversar con el técnico sobre la oferta' 
              : 'Coordinar detalles del servicio'
            }
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
      </TouchableOpacity>
    )}

    {/* Ubicación y Llamar - SOLO SI ESTÁ ACEPTADA */}
    {isAccepted && (
      <>
        {/* Ubicación */}
        <TouchableOpacity 
          className="flex-row items-center p-3 rounded-lg active:bg-gray-50 mb-2"
          onPress={handleViewLocation}
          disabled={!offer.serviceRequest?.latitude}
        >
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            offer.serviceRequest?.latitude ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <FontAwesome name="map-marker" size={16} color={offer.serviceRequest?.latitude ? "#F59E0B" : "#9CA3AF"} />
          </View>
          <View className="flex-1">
            <Text className={`font-medium ${offer.serviceRequest?.latitude ? 'text-gray-900' : 'text-gray-400'}`}>
              Ver ubicación
            </Text>
            <Text className="text-gray-500 text-xs">
              {offer.serviceRequest?.latitude ? 'Abrir en mapa' : 'Ubicación no disponible'}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Llamar */}
        <TouchableOpacity 
          className="flex-row items-center p-3 rounded-lg active:bg-gray-50"
          onPress={handleCallClient}
          disabled={!offer.serviceRequest?.user?.phone}
        >
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            offer.serviceRequest?.user?.phone ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <FontAwesome name="phone" size={14} color={offer.serviceRequest?.user?.phone ? "#10B981" : "#9CA3AF"} />
          </View>
          <View className="flex-1">
            <Text className={`font-medium ${offer.serviceRequest?.user?.phone ? 'text-gray-900' : 'text-gray-400'}`}>
              Llamar al cliente
            </Text>
            <Text className="text-gray-500 text-xs">
              {offer.serviceRequest?.user?.phone ? 'Contactar por teléfono' : 'Teléfono no disponible'}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
        </TouchableOpacity>
      </>
    )}

    {/* Estado Rechazado - Mensaje informativo */}
    {offer.status === 'REJECTED' && (
      <View className="p-3 rounded-lg bg-gray-50 border border-gray-200">
        <Text className="text-gray-500 text-sm text-center">
          No hay acciones disponibles - Oferta rechazada
        </Text>
      </View>
    )}
  </View>
</View>

        {/* Mensaje de estado */}
        {isAccepted ? (
          <View className="bg-green-50 rounded-xl p-3 border border-green-200 mt-4">
            <Text className="text-green-800 text-sm text-center">
              ✅ Servicio aceptado - Contacta al cliente para coordinar
            </Text>
          </View>
        ) : offer.status === 'PENDING' ? (
          <View className="bg-blue-50 rounded-xl p-3 border border-blue-200 mt-4">
            <Text className="text-blue-800 text-sm text-center">
              ⏳ Esperando respuesta del cliente - La dirección se mostrará cuando sea aceptada
            </Text>
          </View>
        ) : (
          <View className="bg-red-50 rounded-xl p-3 border border-red-200 mt-4">
            <Text className="text-red-800 text-sm text-center">
              ❌ Oferta rechazada por el cliente
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}