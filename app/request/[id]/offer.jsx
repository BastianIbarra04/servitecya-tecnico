import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../components/config/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Offer() {
  const { id, specialtyId } = useLocalSearchParams();
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const enviarOferta = async () => {
    if (monto.trim() === "" || descripcion.trim() === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    if (Number(monto) <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    setLoading(true);
    const tecId = await AsyncStorage.getItem('technicianId');

    try {
      const res = await axios.post(`${API_URL}/technician-offer`, {
        technicianId: Number(tecId),
        price: Number(monto),
        message: descripcion,
        specialtyId: Number(specialtyId),
        serviceRequestId: Number(id)
      });

      alert("✅ Oferta enviada con éxito");
      router.back();
    } catch (err) {
      console.error(err);
      alert("❌ Error al enviar la oferta");
    } finally {
      setLoading(false);
    }
  };

  const formatMonto = (text) => {
    // Remover todo excepto números
    const numericText = text.replace(/[^0-9]/g, '');
    setMonto(numericText);
  };

  const getFormattedMonto = () => {
    if (!monto) return "";
    return `$${parseInt(monto).toLocaleString('es-CL')}`;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm flex-row ">
          <TouchableOpacity className="mr-2 py-1 " onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#3B82F6" />
          </TouchableOpacity>
        <View className="flex-col items-left ">
          <Text className="text-xl font-bold text-gray-900">Enviar Oferta</Text>
            <Text className="text-gray-600 mt-1 text-sm">
            Completa los detalles de tu propuesta
            </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-6">
          {/* Tarjeta de Información */}
          <View className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-200">
            <View className="flex-row items-start">
              <FontAwesome name="lightbulb-o" size={20} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-blue-800 font-semibold text-base">
                  Consejo para tu oferta
                </Text>
                <Text className="text-blue-600 text-sm mt-1">
                  Incluye detalles específicos sobre cómo resolverás el problema y justifica tu precio.
                </Text>
              </View>
            </View>
          </View>

          {/* Campo Monto */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-center mb-3">
              <FontAwesome name="dollar" size={18} color="#059669" />
              <Text className="text-gray-700 font-semibold text-lg ml-2">Monto de la oferta</Text>
            </View>
            
            <View className="relative">
              <TextInput
                value={monto}
                onChangeText={formatMonto}
                placeholder="50000"
                keyboardType="numeric"
                style={{ fontSize: 18 }}
                className="border-2 border-gray-200 p-4 rounded-xl font-semibold bg-gray-50"
                placeholderTextColor="#9CA3AF"
              />
              {monto && (
                <View className="absolute right-4 top-4">
                  <Text className="text-gray-500 font-semibold">
                    {getFormattedMonto()}
                  </Text>
                </View>
              )}
            </View>
            
            <Text className="text-gray-400 text-sm mt-2">
              Ingresa solo números, sin puntos ni comas
            </Text>
          </View>

          {/* Campo Descripción */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <FontAwesome name="file-text" size={18} color="#7C3AED" />
              <Text className="text-gray-700 font-semibold text-lg ml-2">Descripción de la oferta</Text>
            </View>
            
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe detalladamente tu propuesta, materiales que usarás, tiempo estimado, garantía, etc."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="border-2 border-gray-200 p-4 rounded-xl text-gray-700 bg-gray-50 min-h-[120px]"
              placeholderTextColor="#9CA3AF"
              
            />
            
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-400 text-sm">
                {descripcion.length}/500 caracteres
              </Text>
              {descripcion.length > 0 && (
                <Text className={`text-sm ${
                  descripcion.length > 500 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {descripcion.length > 500 ? 'Máximo excedido' : 'Correcto'}
                </Text>
              )}
            </View>
          </View>

          {/* Información Adicional */}
          <View className="bg-gray-100 rounded-2xl p-4 mt-6 flex-row items-start">
            <FontAwesome name="info-circle" size={18} color="#6B7280" />
            <Text className="text-gray-600 text-sm text-center">
            Esta oferta será visible para el cliente. Una vez enviada no podrás modificarla.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón de Envío */}
      <View 
        style={{ paddingBottom: insets.bottom + 16 }}
        className="px-6 pt-4 bg-white border-t border-gray-200"
      >
        <TouchableOpacity
          className={`p-5 rounded-2xl items-center shadow-lg ${
            loading || monto === "" || descripcion === "" || descripcion.length > 500
              ? 'bg-gray-400'
              : 'bg-green-500'
          }`}
          onPress={enviarOferta}
          disabled={loading || monto === "" || descripcion === "" || descripcion.length > 500}
          activeOpacity={0.8}
        >
          {loading ? (
            <View className="flex-row items-center">
              <FontAwesome name="spinner" size={20} color="white" className="animate-spin" />
              <Text className="text-white font-bold text-lg ml-2">Enviando...</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <FontAwesome name="paper-plane" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Enviar Oferta</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {(monto === "" || descripcion === "" || descripcion.length > 500) && (
          <Text className="text-red-500 text-sm text-center mt-2">
            {descripcion.length > 500 
              ? 'La descripción no puede exceder los 500 caracteres'
              : 'Completa todos los campos requeridos'
            }
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}