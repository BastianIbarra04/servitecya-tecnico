import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from '../../components/config/api.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Request() {
  const { id, distancia } = useLocalSearchParams();
  const distanciaKM = distancia ? parseFloat(distancia).toFixed(1) : null;
  const [hasOffer, setHasOffer] = useState(false);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const fetchRequest = async () => {
        try {
          const res = await axios.get(`${API_URL}/service-request/${id}`);
          setRequest(res.data);
          const technicianId = await AsyncStorage.getItem("technicianId");

          const check = await axios.get(`${API_URL}/technician-offer/check`, {
            params: {
              technicianId,
              serviceRequestId: id
            }
          });
          setHasOffer(check.data.exists);
        } catch (err) {
          console.error("Error fetching request:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }, [id])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4 text-lg font-medium">Cargando solicitud...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <FontAwesome name="exclamation-triangle" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
          No se encontró la solicitud
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

  const fecha = new Date(request.createdAt);
  const fechaFormateada = fecha.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Detalles del Trabajo</Text>
          {distanciaKM && (
            <View className="flex-row items-center bg-blue-50 px-3 py-2 rounded-full">
              <FontAwesome name="map-marker" size={14} color="#3B82F6" />
              <Text className="text-blue-600 font-medium ml-1">{distanciaKM} km</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Galería de Fotos */}
          {request.photos?.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {request.photos.map((photo, idx) => (
                <View key={idx} className="mr-4">
                  <Image
                    source={{ uri: `${API_URL}${photo}` }}
                    className="w-80 h-64 rounded-xl"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-gray-100 w-full h-48 rounded-xl justify-center items-center mb-6 border-2 border-dashed border-gray-300">
              <FontAwesome name="image" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg mt-3 font-medium">Sin fotos</Text>
            </View>
          )}

          {/* Información Principal */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            {/* Cliente */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="bg-blue-100 p-3 rounded-full">
                <FontAwesome name="user" size={20} color="#3B82F6" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-sm text-gray-500 font-medium">Cliente</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {request.user?.name || 'Usuario'} {request.user?.lastname}
                </Text>
              </View>
            </View>

            {/* Especialidad */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="bg-orange-100 p-3 rounded-full">
                <FontAwesome name="wrench" size={20} color="#F59E0B" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-sm text-gray-500 font-medium">Especialidad</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {request.specialty?.name || 'No especificada'}
                </Text>
              </View>
            </View>

            {/* Fecha */}
            <View className="flex-row items-center">
              <View className="bg-gray-100 p-3 rounded-full">
                <FontAwesome name="calendar" size={20} color="#6B7280" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-sm text-gray-500 font-medium">Fecha de creación</Text>
                <Text className="text-base font-medium text-gray-900">{fechaFormateada}</Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <FontAwesome name="file-text" size={20} color="#6B7280" />
              <Text className="text-lg font-bold text-gray-900 ml-3">Descripción</Text>
            </View>
            <Text className="text-gray-700 text-base leading-6">
              {request.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón de Acción */}
      <View 
        style={{ paddingBottom: insets.bottom + 16 }}
        className="px-6 pt-4 bg-white border-t border-gray-200"
      >
        {hasOffer ? (
          <View className="bg-gray-100 p-5 rounded-2xl items-center border border-gray-300">
            <View className="flex-row items-center">
              <FontAwesome name="check-circle" size={20} color="#10B981" />
              <Text className="text-gray-700 font-bold text-lg ml-2">Oferta Enviada</Text>
            </View>
            <Text className="text-gray-500 text-sm mt-1">
              Esperando respuesta del cliente
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-blue-500 p-5 rounded-2xl items-center shadow-lg"
            onPress={() => {
              router.push(`/request/${id}/offer?specialtyId=${request.specialtyId}`);
            }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <FontAwesome name="paper-plane" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Enviar Oferta</Text>
            </View>
            <Text className="text-blue-100 text-sm mt-1">
              Presiona para hacer tu propuesta
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}