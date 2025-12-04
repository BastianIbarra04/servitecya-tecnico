import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback, use } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../components/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';
import getAddressFromCoords  from '../utils/geocoods';
import { useFocusEffect } from '@react-navigation/native';

export default function TechnicianOfferDetail() {
  const { offerId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [technicianId, setTechnicianId] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [realAddress, setRealAddress] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
      if (offerId) {
        loadInitialData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [])
);

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
      
      setRealAddress(address);
    } catch (error) {
      setRealAddress("Dirección no disponible");
      console.error('Error fetching address:', error);
    }
  };

  const acceptNegotiation = async () => {
    Alert.alert(
      "Confirmar aceptación",
      `¿Aceptar la propuesta de $${offer.proposedPrice?.toLocaleString('es-CL') || '0'}?`,
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel"
        },
        {
          text: "Si, aceptar",
          onPress: async () => {
            try {
              await axios.put(`${API_URL}/negotiation/accept`, {
                offerId,
                userId : offer.technician?.userId
              });
              Alert.alert("Listo", "Has aceptado la negociación");
              loadInitialData();
            } catch (err) {
              Alert.alert("Error", "No se pudo aceptar");
            }
          },
          style: "default"
        }
      ]
    );
  };
  const rejectNegotiation = async () => {
    Alert.alert(
      "Confirmar rechazo",
      `¿Rechazar la propuesta de $${offer.proposedPrice?.toLocaleString('es-CL') || '0'}?`,
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel"
        },
        {
          text: "Si, rechazar",
          onPress: async () => {
            try {
              await axios.put(`${API_URL}/negotiation/reject`, {
                offerId,
                userId : offer.technician?.userId
              });
              Alert.alert("Rechazado", "Has rechazado la negociación");
              loadInitialData();
            } catch (err) {
              Alert.alert("Error", "No se pudo rechazar");
            }
          },
          style: "destructive"
        }
      ]
    );
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
      }
    ],
    { cancelable: true }
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
      case 'COMPLETED':
        return {
          bgColor: 'bg-purple-50',
          icon: 'check-circle',
          iconColor: '#7C3AED',
          text: 'Completada'
        };
      case 'CANCELLED':
        return {
          bgColor: 'bg-gray-100',
          icon: 'ban',
          iconColor: '#6B7280',
          text: 'Cancelada'
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

  const handleRateClient = () => {
    router.push(`/rating/${offer.serviceRequest?.user?.id}?serviceId=${offer.serviceRequest?.id}&offerId=${offerId}`);
  };

  const handleViewCompletionDetails = () => {
    if (serviceDetails) {
      router.push(`/service-completion/${offer.serviceRequest?.id}?offerId=${offerId}`);
    }
  };

  const handleViewInvoice = () => {
    if (serviceDetails?.invoiceUrl) {
      Linking.openURL(serviceDetails.invoiceUrl);
    } else {
      Alert.alert('Factura no disponible', 'La factura aún no está disponible para este servicio.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4 text-lg font-medium">Cargando oferta...</Text>
      </View>
    );
  }

  if (!offer) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <FontAwesome name="exclamation-triangle" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg font-bold mt-4 text-center">
          No se encontró la oferta
        </Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-full mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getOfferStatusConfig(offer.status);
  const isAccepted = offer.status === 'ACCEPTED';
  const isCompleted = offer.status === 'COMPLETED';
  const isPending = offer.status === 'PENDING';

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
              <Text className="text-gray-500 text-sm font-medium">Cliente</Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
            <Text className="text-xs font-bold" style={{ color: statusConfig.iconColor }}>
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
                <Text className="text-gray-500 text-sm font-medium">
                  {isCompleted ? 'Monto recibido' : 'Precio ofertado'}
                </Text>
              </View>
              <View className="flex-row items-center">
                <FontAwesome name={statusConfig.icon} size={16} color={statusConfig.iconColor} />
                <Text className="text-gray-600 text-sm ml-1 font-medium">{statusConfig.text}</Text>
              </View>
            </View>
          </View>

          {/* Información Compacta */}
          <View className="p-4 space-y-3">
            {/* Fechas */}
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-sm font-medium">Fecha de creación</Text>
              <Text className="text-gray-900 text-sm font-medium">
                {offer.createdAt ? format(new Date(offer.createdAt), "dd/MM/yyyy") : 'N/A'}
              </Text>
            </View>

            {isCompleted && serviceDetails?.completedAt && (
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm font-medium">Fecha de completación</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {format(new Date(serviceDetails.completedAt), "dd/MM/yyyy")}
                </Text>
              </View>
            )}

            {/* Descripción */}
            <View>
              <Text className="text-gray-500 text-sm mb-1 font-medium">Solicitud</Text>
              <Text className="text-gray-900 text-base leading-5 font-medium" numberOfLines={3}>
                {offer.serviceRequest?.description || 'Sin descripción'}
              </Text>
            </View>

            {/* Dirección */}
            {(isAccepted) && (
              <View className="flex-row items-start">
                <FontAwesome name="map-marker" size={14} color="#ef4444" className="mt-0.5" />
                <View className="ml-2 flex-1">
                  <Text className="text-gray-500 text-sm mb-1 font-medium">Ubicación del servicio</Text>
                  <Text className="text-gray-900 text-sm leading-4 font-medium">
                    {realAddress || 'Dirección no especificada'}
                  </Text>
                </View>
              </View>
            )}

            {/* Especialidad y Contacto */}
            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-500 text-sm mb-1 font-medium">Especialidad</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {offer.specialty?.name || 'No especificada'}
                </Text>
              </View>
              {offer.serviceRequest?.user?.phone && (
                <View>
                  <Text className="text-gray-500 text-sm mb-1 font-medium">Contacto</Text>
                  <Text className="text-gray-900 text-sm font-medium">
                    {offer.serviceRequest.user.phone}
                  </Text>
                </View>
              )}
            </View>

            {/* Mensaje de la oferta */}
            {offer.message && (
              <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Text className="text-blue-800 font-bold text-sm mb-1">Tu mensaje</Text>
                <Text className="text-blue-700 text-sm leading-4 font-medium">
                  {offer.message}
                </Text>
              </View>
            )}

            {/* Detalles de completación */}
            {isCompleted && serviceDetails && (
              <View className="bg-green-50 rounded-lg p-3 border border-green-200">
                <Text className="text-green-800 font-bold text-sm mb-2">✅ Servicio Completado</Text>
                
                {serviceDetails.finalPrice && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-green-700 text-sm">Precio final:</Text>
                    <Text className="text-green-700 font-bold text-sm">
                      ${serviceDetails.finalPrice.toLocaleString('es-CL')}
                    </Text>
                  </View>
                )}

                
                {serviceDetails.rating && (
                  <View className="flex-row justify-between">
                    <Text className="text-green-700 text-sm">Calificación recibida:</Text>
                    <View className="flex-row items-center">
                      <Text className="text-green-700 font-bold text-sm mr-1">
                        {serviceDetails.rating}/5
                      </Text>
                      <FontAwesome name="star" size={12} color="#F59E0B" />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
          <View className="p-4 border-b border-gray-100">
            <Text className="font-bold text-gray-900">Acciones</Text>
          </View>
          
          <View className="p-2">
            {/* Chat - DISPONIBLE PARA TODOS EXCEPTO RECHAZADO */}
            {offer.status !== 'REJECTED' && (
              <TouchableOpacity 
                className="flex-row items-center p-3 rounded-lg active:bg-gray-50 mb-2"
                onPress={handleOpenChat}
              >
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <FontAwesome name="comments" size={16} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">Abrir chat</Text>
                  <Text className="text-gray-500 text-xs font-medium">
                    {isCompleted 
                      ? 'Ver historial de conversación' 
                      : isAccepted 
                      ? 'Coordinar detalles del servicio'
                      : 'Conversar sobre la oferta'
                    }
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
              </TouchableOpacity>
            )}
            {isAccepted ? (
              /* ACCIONES PARA SERVICIO ACEPTADO (NO COMPLETADO) */
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
                    <Text className={`font-bold ${offer.serviceRequest?.latitude ? 'text-gray-900' : 'text-gray-400'}`}>
                      Ver ubicación
                    </Text>
                    <Text className="text-gray-500 text-xs font-medium">
                      {offer.serviceRequest?.latitude ? 'Abrir en mapa' : 'Ubicación no disponible'}
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Completar servicio */}
                <TouchableOpacity 
                  className="flex-row items-center p-3 rounded-lg active:bg-gray-50"
                  onPress={() => router.push(`/service-management/${offer.serviceRequest?.id}?offerId=${offer.id}&technicianId=${technicianId}`)}
                >
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <FontAwesome name="check-circle" size={16} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">
                      Completar servicio
                    </Text>
                    <Text className="text-gray-500 text-xs font-medium">
                      Marcar como finalizado
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
                </TouchableOpacity>
              </>
            ) : offer.status === 'REJECTED' ? (
              <View className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <Text className="text-gray-500 text-sm text-center font-medium">
                  No hay acciones disponibles - Oferta rechazada
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        {/* Botones de Aceptar/Rechazar - SOLO SI ESTÁ PENDIENTE */}
        {isPending && offer.negotiationStatus === 'ACCEPTED' ? (
          <View className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden shadow-sm">
            <View className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-2">
                    <FontAwesome 
                      name="check-circle" 
                      size={16} 
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-md font-bold text-gray-900">Negociación Aceptada</Text>
                </View>
                <View className="px-2 py-1 bg-green-100 rounded-full">
                  <Text className="text-xs font-semibold text-green-800">Completada</Text>
                </View>
              </View>
            </View>
            
            <View className="p-4">
              {/* Estado principal */}
              <View className="flex-row items-start mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-500 mb-1">Estado actual</Text>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                    <Text className="text-base font-semibold text-green-700">
                      ✅ Negociación aceptada
                    </Text>
                  </View>
                </View>
                
                {/* Precio acordado */}
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-semibold">
                    ${offer.proposedPrice?.toLocaleString('es-CL') || offer.price?.toLocaleString('es-CL') || '0'}
                  </Text>
                </View>
              </View>
              
              {/* Precios comparativos */}
              <View className="space-y-3">
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-sm font-medium text-gray-500 mb-2">Precio acordado</Text>
                  
                  <View className="space-y-2">
                    {/* Precio original de la oferta */}
                    <View className="flex-row justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <View className="flex-row items-center">
                        <FontAwesome name="tag" size={14} color="#6B7280" />
                        <Text className="text-gray-600 ml-2 text-sm">Precio original</Text>
                      </View>
                      <Text className="text-gray-900 font-semibold">
                        ${offer.originalPrice?.toLocaleString('es-CL') || '0'}
                      </Text>
                    </View>
                    
                    {/* Precio negociado final */}
                    <View className="flex-row justify-between items-center p-2 bg-green-50 rounded-lg border border-green-100">
                      <View className="flex-row items-center">
                        <FontAwesome name="handshake-o" size={14} color="#10B981" />
                        <Text className="text-green-800 ml-2 text-sm">Precio acordado</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-green-900 font-bold text-base">
                          ${offer.price?.toLocaleString('es-CL') || '0'}
                        </Text>
                        {offer.originalPrice && offer.price && offer.price !== offer.originalPrice && (
                          <Text className={`text-xs ml-2 ${
                            offer.price > offer.originalPrice ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {offer.price > offer.originalPrice ? '▲' : '▼'} 
                            {Math.abs(((offer.price - offer.originalPrice) / offer.originalPrice) * 100).toFixed(0)}%
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {/* Diferencia de precios */}
                    {offer.price && offer.proposedPrice && offer.proposedPrice !== offer.price && (
                      <View className={`p-2 rounded-lg ${
                        offer.proposedPrice > offer.price ? 'bg-red-50' : 'bg-green-50'
                      }`}>
                        <View className="flex-row justify-between">
                          <Text className={`text-sm font-medium ${
                            offer.proposedPrice > offer.price ? 'text-red-700' : 'text-green-700'
                          }`}>
                            {offer.proposedPrice > offer.price ? 'Aumento final' : 'Descuento final'}
                          </Text>
                          <Text className={`font-bold ${
                            offer.proposedPrice > offer.price ? 'text-red-700' : 'text-green-700'
                          }`}>
                            ${Math.abs(offer.proposedPrice - offer.price).toLocaleString('es-CL')}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Información de la negociación completada */}
                <View className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <View className="flex-row items-start">
                    <FontAwesome name="check-circle" size={16} color="#10B981" style={{marginTop: 2}} />
                    <View className="ml-2 flex-1">
                      <Text className="text-green-800 font-medium text-sm">
                        ✅ Negociación completada exitosamente
                      </Text>
                      <Text className="text-green-600 text-xs mt-1">
                        Ambos han aceptado el precio acordado. Este será el precio final del trabajo.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Acciones - Estado finalizado */}
              <View className="border-t border-gray-100 pt-4 mt-4">
                <Text className="text-sm font-medium text-gray-500 mb-3">Estado</Text>
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-gray-600 text-sm text-center">
                    ✅ Negociación completada - Precio acordado
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden shadow-sm">
            <View className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2">
                    <FontAwesome 
                      name="handshake-o" 
                      size={16} 
                      color={
                        offer.negotiationStatus === 'ACCEPTED' ? '#10B981' : 
                        offer.negotiationStatus === 'REJECTED' ? '#EF4444' : 
                        offer.negotiationStatus === 'COUNTER_OFFER' ? '#F59E0B' : 
                        '#6B7280'
                      } 
                    />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Negociación de Precio</Text>
                </View>
                {offer.negotiationStatus === 'COUNTER_OFFER' && (
                  <View className="px-2 py-1 bg-yellow-100 rounded-full">
                    <Text className="text-xs font-semibold text-yellow-800">Activa</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View className="p-4">
              {/* Estado principal */}
              <View className="flex-row items-start mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-500 mb-1">Estado actual</Text>
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-2 ${
                      offer.negotiationStatus === 'ACCEPTED' ? 'bg-green-500' :
                      offer.negotiationStatus === 'REJECTED' ? 'bg-red-500' :
                      offer.negotiationStatus === 'COUNTER_OFFER' ? 'bg-yellow-500 animate-pulse' :
                      'bg-gray-300'
                    }`} />
                    <Text className={`text-base font-semibold ${
                      offer.negotiationStatus === 'ACCEPTED' ? 'text-green-700' :
                      offer.negotiationStatus === 'REJECTED' ? 'text-red-700' :
                      offer.negotiationStatus === 'COUNTER_OFFER' ? 'text-yellow-700' :
                      'text-gray-700'
                    }`}>
                      {offer.negotiationStatus === 'ACCEPTED' ? '✅ Negociación aceptada' :
                      offer.negotiationStatus === 'REJECTED' ? '❌ Negociación rechazada' :
                      offer.negotiationStatus === 'COUNTER_OFFER' ? '⚖️ En negociación' :
                      '📝 Sin negociación iniciada'}
                    </Text>
                  </View>
                </View>
                
                {/* Badge de turno si aplica - Si hay propuesta y NO soy yo quien la hizo */}
                {offer.negotiationStatus === 'COUNTER_OFFER' && 
                offer.proposedBy && 
                offer.proposedBy === Number(technicianId) && (
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 text-xs font-semibold">Tu turno</Text>
                  </View>
                )}
              </View>
              
              {/* Precios comparativos - Solo si hay negociación y NO está rechazada */}
              {offer.negotiationStatus && offer.negotiationStatus !== 'ACCEPTED' ? (
                <View className="space-y-3">
                  <View className="border-t border-gray-100 pt-3">
                    <Text className="text-sm font-medium text-gray-500 mb-2">Detalles de precios</Text>
                    
                    <View className="space-y-2">
                      {/* Solo mostrar precio original si NO es COUNTER_OFFER */}
                      {offer.negotiationStatus !== 'COUNTER_OFFER' && offer.negotiationStatus !== 'REJECTED' && (
                        <View className="flex-row justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <View className="flex-row items-center">
                            <FontAwesome name="tag" size={14} color="#6B7280" />
                            <Text className="text-gray-600 ml-2 text-sm">Precio original</Text>
                          </View>
                          <Text className="text-gray-900 font-semibold">
                            ${offer.price?.toLocaleString('es-CL') || '0'}
                          </Text>
                        </View>
                      )}
                      
                      {/* Precio actual */}
                      {offer.negotiationStatus !== 'REJECTED' && (
                        <View className="flex-row justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <View className="flex-row items-center">
                            <FontAwesome name="tag" size={14} color="#6B7280" />
                            <Text className="text-gray-600 ml-2 text-sm">
                              {offer.negotiationStatus === 'COUNTER_OFFER' ? 'Precio actual' : 'Precio ofertado'}
                            </Text>
                          </View>
                          <Text className="text-gray-900 font-semibold">
                            ${offer.price?.toLocaleString('es-CL') || '0'}
                          </Text>
                        </View>
                      )}
                      
                      {/* Precio propuesto si existe y NO está rechazado */}
                      {offer.proposedPrice && offer.negotiationStatus !== 'REJECTED' && (
                        <View className="flex-row justify-between items-center p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                          <View className="flex-row items-center">
                            <FontAwesome name="exchange" size={14} color="#F59E0B" />
                            <Text className="text-yellow-800 ml-2 text-sm">Propuesta actual</Text>
                          </View>
                          <View className="flex-row items-center">
                            <Text className="text-yellow-900 font-bold text-base">
                              ${offer.proposedPrice?.toLocaleString('es-CL') || '0'}
                            </Text>
                            {offer.price && offer.proposedPrice !== offer.price && (
                              <Text className={`text-xs ml-2 ${
                                offer.proposedPrice > offer.price ? 'text-red-500' : 'text-green-500'
                              }`}>
                                {offer.proposedPrice > offer.price ? '▲' : '▼'} 
                                {Math.abs(((offer.proposedPrice - offer.price) / offer.price) * 100).toFixed(0)}%
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
                      
                      {/* Diferencia de precios y NO está rechazado */}
                      {offer.price && offer.proposedPrice && offer.proposedPrice !== offer.price && offer.negotiationStatus !== 'REJECTED' && (
                        <View className={`p-2 rounded-lg ${
                          offer.proposedPrice > offer.price ? 'bg-red-50' : 'bg-green-50'
                        }`}>
                          <View className="flex-row justify-between">
                            <Text className={`text-sm font-medium ${
                              offer.proposedPrice > offer.price ? 'text-red-700' : 'text-green-700'
                            }`}>
                              {offer.proposedPrice > offer.price ? 'Aumento' : 'Descuento'}
                            </Text>
                            <Text className={`font-bold ${
                              offer.proposedPrice > offer.price ? 'text-red-700' : 'text-green-700'
                            }`}>
                              ${Math.abs(offer.proposedPrice - offer.price).toLocaleString('es-CL')}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Información de quién propuso */}
                  {offer.negotiationStatus === 'COUNTER_OFFER' && (
                    <View className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <View className="flex-row items-start">
                        <FontAwesome name="user" size={16} color="#3B82F6" style={{marginTop: 2}} />
                        <View className="ml-2 flex-1">
                          <Text className="text-blue-800 font-medium text-sm">
                            {offer.proposedBy !== Number(technicianId) 
                              ? '📤 Tú hiciste esta propuesta' 
                              : '📬 Te hicieron una propuesta'}
                          </Text>
                          <Text className="text-blue-600 text-xs mt-1">
                            {offer.proposedBy !== Number(technicianId)
                              ? 'Esperando respuesta de la contraparte...'
                              : 'Puedes aceptar o rechazar esta propuesta.'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ): (
                <View className="space-y-3">
                  <View className="border-t border-gray-100 pt-3">
                    <Text className="text-sm font-medium text-gray-500 mb-2">Detalles de precios</Text>
                    
                    <View className="space-y-2">
                      {/* Precio original de la oferta */}
                      <View className="flex-row justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <View className="flex-row items-center">
                          <FontAwesome name="tag" size={14} color="#6B7280" />
                          <Text className="text-gray-600 ml-2 text-sm">Precio original</Text>
                        </View>
                        <Text className="text-gray-900 font-semibold">
                          ${offer.originalPrice?.toLocaleString('es-CL') || '0'}
                        </Text>
                      </View>
                      
                      {/* Precio propuesto si existe */}
                      {offer.price && (
                        <View className="flex-row justify-between items-center p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                          <View className="flex-row items-center">
                            <FontAwesome name="exchange" size={14} color="#F59E0B" />
                            <Text className="text-yellow-800 ml-2 text-sm">Propuesta actual</Text>
                          </View>
                          <View className="flex-row items-center">
                            <Text className="text-yellow-900 font-bold text-base">
                              ${offer.price?.toLocaleString('es-CL') || '0'}
                            </Text>
                            {offer.originalPrice && offer.price !== offer.originalPrice && (
                              <Text className={`text-xs ml-2 ${
                                offer.price > offer.originalPrice ? 'text-red-500' : 'text-green-500'
                              }`}>
                                {offer.price > offer.originalPrice ? '▲' : '▼'} 
                                {Math.abs(((offer.price - offer.originalPrice) / offer.originalPrice) * 100).toFixed(0)}%
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
                      
                      {/* Diferencia de precios */}
                      {offer.price && offer.proposedPrice && offer.proposedPrice !== offer.price && (
                        <View className={`p-2 rounded-lg ${
                          offer.proposedPrice > offer.price ? 'bg-red-50' : 'bg-green-50'
                        }`}>
                          <View className="flex-row justify-between">
                            <Text className={`text-sm font-medium ${
                              offer.proposedPrice > offer.price ? 'text-red-700' : 'text-green-700'
                            }`}>
                              {offer.proposedPrice > offer.price ? 'Aumento' : 'Descuento'}
                            </Text>
                            <Text className={`font-bold ${
                              offer.proposedPrice > offer.price ? 'text-red-700' : 'text-green-700'
                            }`}>
                              ${Math.abs(offer.proposedPrice - offer.price).toLocaleString('es-CL')}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Información de quién propuso */}
                  {offer.negotiationStatus === 'COUNTER_OFFER' && (
                    <View className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <View className="flex-row items-start">
                        <FontAwesome name="user" size={16} color="#3B82F6" style={{marginTop: 2}} />
                        <View className="ml-2 flex-1">
                          <Text className="text-blue-800 font-medium text-sm">
                            {offer.proposedBy !== Number(technicianId) 
                              ? '📤 Tú hiciste esta propuesta' 
                              : '📬 Te hicieron una propuesta'}
                          </Text>
                          <Text className="text-blue-600 text-xs mt-1">
                            {offer.proposedBy !== Number(technicianId)
                              ? 'Esperando respuesta de la contraparte...'
                              : 'Puedes aceptar o rechazar esta propuesta.'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              )}
              
              {/* Acciones disponibles */}
              <View className="border-t border-gray-100 pt-4 mt-4">
                <Text className="text-sm font-medium text-gray-500 mb-3">Acciones</Text>
                
                {offer.negotiationStatus === 'COUNTER_OFFER' && 
                offer.proposedBy && 
                offer.proposedBy === Number(technicianId) ? (
                  // Si hay propuesta y NO soy yo quien la hizo, puedo responder
                  <View className="space-y-2">
                    <TouchableOpacity 
                      className="flex-row items-center justify-center bg-green-500 py-3 rounded-lg"
                      onPress={() => {
                        // Llamar a función para aceptar negociación
                        acceptNegotiation();
                      }}
                    >
                      <FontAwesome name="check" size={16} color="white" />
                      <Text className="text-white font-semibold ml-2">Aceptar propuesta</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      className="flex-row items-center justify-center bg-red-500 py-3 rounded-lg"
                      onPress={() => {
                        // Llamar a función para rechazar negociación
                        rejectNegotiation();
                      }}
                    >
                      <FontAwesome name="times" size={16} color="white" />
                      <Text className="text-white font-semibold ml-2">Rechazar propuesta</Text>
                    </TouchableOpacity>
                  </View>
                ) : offer.negotiationStatus === 'NONE' || !offer.negotiationStatus ? (
                  // Si no hay negociación, puedo iniciar una
                  <TouchableOpacity 
                    className="flex-row items-center justify-center bg-blue-500 py-3 rounded-lg"
                    onPress={handleOpenChat}
                  >
                    <FontAwesome name="handshake-o" size={16} color="white" />
                    <Text className="text-white font-semibold ml-2">Iniciar negociación</Text>
                  </TouchableOpacity>
                ) : offer.negotiationStatus === 'COUNTER_OFFER' && 
                      offer.proposedBy !== Number(technicianId) ? (
                  // Si yo hice la propuesta, esperando respuesta
                  <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <Text className="text-yellow-800 text-sm text-center">
                      ⏳ Esperando respuesta de la contraparte...
                    </Text>
                  </View>
                ) : (
                  // Estado finalizado
                  <View className="bg-gray-50 p-3 rounded-lg">
                    <Text className="text-gray-600 text-sm text-center">
                      {offer.negotiationStatus === 'ACCEPTED' 
                        ? '✅ Negociación completada - Precio acordado'
                        : '❌ Negociación finalizada'}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Consejo contextual para negociación */}
              {offer.negotiationStatus === 'COUNTER_OFFER' && offer.proposedBy === Number(technicianId) && (
                <View className="mt-3 p-2 bg-purple-50 rounded-lg">
                  <Text className="text-purple-700 text-xs text-center">
                    💡 Recuerda: Si aceptas esta propuesta, se convertirá en el precio final de la oferta.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Mensaje de estado */}
        {isCompleted ? (
          <View className="bg-purple-50 rounded-xl p-3 border border-purple-200 mt-4">
            <Text className="text-purple-800 text-sm text-center font-bold">
              ✅ Servicio completado exitosamente
            </Text>
            {serviceDetails?.paymentStatus === 'PAID' && (
              <Text className="text-purple-700 text-xs text-center mt-1 font-medium">
                Pago recibido - ${serviceDetails.finalPrice?.toLocaleString('es-CL')}
              </Text>
            )}
          </View>
        ) : isAccepted ? (
          <View className="bg-green-50 rounded-xl p-3 border border-green-200 mt-4">
            <Text className="text-green-800 text-sm text-center font-bold">
              ✅ Servicio aceptado - Contacta al cliente para coordinar
            </Text>
          </View>
        ) : isPending ? (
          <View className="bg-blue-50 rounded-xl p-3 border border-blue-200 mt-4">
            <Text className="text-blue-800 text-sm text-center font-bold">
              ⏳ Esperando respuesta del cliente
            </Text>
          </View>
        ) : (
          <View className="bg-red-50 rounded-xl p-3 border border-red-200 mt-4">
            <Text className="text-red-800 text-sm text-center font-bold">
              ❌ Oferta rechazada por el cliente
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}