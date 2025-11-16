import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../../components/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TechnicianOfferDetail() {
  const { offerId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();
  
  const [offer, setOffer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [technicianId, setTechnicianId] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, [offerId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (offerId) {
        fetchMessages();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [offerId]);

  const loadInitialData = async () => {
    try {
      const techId = await AsyncStorage.getItem('technicianId');
      setTechnicianId(techId);
      
      const [offerRes, messagesRes] = await Promise.all([
        axios.get(`${API_URL}/technician-offer/${offerId}`),
        axios.get(`${API_URL}/messages/${offerId}`)
      ]);

      setOffer(offerRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/${offerId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await axios.post(`${API_URL}/messages`, {
        content: newMessage.trim(),
        offerId: Number(offerId),
        senderId: Number(technicianId) // El técnico envía como sender
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const getOfferStatusConfig = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: 'check-circle',
          iconColor: '#059669',
          text: 'Oferta Aceptada',
          description: 'El cliente aceptó tu oferta. Coordina los detalles para realizar el servicio.'
        };
      case 'REJECTED':
        return {
          bgColor: 'bg-red-50', 
          borderColor: 'border-red-200',
          icon: 'times-circle',
          iconColor: '#DC2626',
          text: 'Oferta Rechazada',
          description: 'El cliente rechazó tu oferta.'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200', 
          icon: 'clock-o',
          iconColor: '#3B82F6',
          text: 'Oferta Pendiente',
          description: 'Esperando respuesta del cliente.'
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4 p-2 bg-gray-100 rounded-full"
            onPress={() => router.back()}
          >
            <FontAwesome name="chevron-left" size={16} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Mi Oferta</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Conversación con el cliente
            </Text>
          </View>
        </View>
      </View>

      {/* Información de la Oferta */}
      <View className={`border-b  px-6 py-1 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-lg">
              {offer.serviceRequest?.user?.name} {offer.serviceRequest?.user?.lastname}
            </Text>
            <Text className="text-gray-600">Cliente</Text>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold text-green-600">
              ${offer.price?.toLocaleString('es-CL')}
            </Text>
            <Text className="text-gray-500 text-sm">Tu oferta</Text>
          </View>
        </View>

      </View>

      {/* Chat (igual que la versión del cliente) */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Mensaje de la oferta */}
        <View className="bg-gray-100 rounded-2xl p-4 my-3 mx-2">
          <View className="flex-row items-center mb-2">
            <FontAwesome name="file-text" size={14} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-2">Tu propuesta:</Text>
          </View>
          <Text className="text-gray-600 text-base leading-6">
            {offer.message || "No incluiste un mensaje adicional"}
          </Text>
          <Text className="text-gray-400 text-xs mt-2">
            {offer.createdAt ? format(new Date(offer.createdAt), "dd 'de' MMMM 'a las' HH:mm", { locale: es }) : ''}
          </Text>
        </View>

        {/* Mensajes del chat */}
        {messages.map((message) => (
          <View 
            key={message.id} 
            className={`my-1 mx-2 ${message.senderId == technicianId ? 'items-end' : 'items-start'}`}
          >
            <View 
              className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                message.senderId == technicianId 
                  ? 'bg-blue-500 rounded-br-none' 
                  : 'bg-gray-200 rounded-bl-none'
              }`}
            >
              <Text 
                className={`text-base ${
                  message.senderId == technicianId ? 'text-white' : 'text-gray-800'
                }`}
              >
                {message.content}
              </Text>
              <Text 
                className={`text-xs mt-1 ${
                  message.senderId == technicianId ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {format(new Date(message.createdAt), 'HH:mm', { locale: es })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input de Mensaje */}
      <View style={{ paddingBottom: insets.bottom }} className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={
              offer.status === 'ACCEPTED' 
                ? "Coordina los detalles con el cliente..." 
                : "Escribe tu mensaje al cliente..."
            }
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3 text-gray-900"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            className={`w-12 h-12 rounded-full items-center justify-center ${
              newMessage.trim() && !sending ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <FontAwesome name="send" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-gray-400 text-xs text-center mt-2">
          {offer.status === 'ACCEPTED' 
            ? '✅ Oferta aceptada - Coordina la visita con el cliente' 
            : 'Los mensajes se actualizan automáticamente cada 3 segundos'
          }
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}