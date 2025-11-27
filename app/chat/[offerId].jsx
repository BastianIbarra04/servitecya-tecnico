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

  export default function ChatScreen() {
    const { offerId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef();
    
    const [offer, setOffer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userType, setUserType] = useState(null); // 'client' or 'technician'

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
        // Detectar tipo de usuario
        const clientId = await AsyncStorage.getItem('userId');
        const technicianId = await AsyncStorage.getItem('technicianId');
        
        if (clientId) {
          setUserId(clientId);
          setUserType('client');
        } else if (technicianId) {
          setUserId(technicianId);
          setUserType('technician');
        }

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
          senderId: Number(userId)
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

    const getChatTitle = () => {
      if (!offer) return 'Chat';
      
      if (userType === 'client') {
        return `Chat con ${offer.technician?.user?.name || 'Técnico'}`;
      } else {
        return `Chat con ${offer.serviceRequest?.user?.name || 'Cliente'}`;
      }
    };

    const getChatSubtitle = () => {
      if (!offer) return 'Cargando...';
      
      if (userType === 'client') {
        return offer.specialty?.name || 'Servicio solicitado';
      } else {
        return `$${offer.price?.toLocaleString('es-CL')} • ${offer.specialty?.name || 'Servicio'}`;
      }
    };

    if (loading) {
      return (
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4 text-lg">Cargando chat...</Text>
        </View>
      );
    }

    if (!offer) {
      return (
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <FontAwesome name="exclamation-triangle" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
            No se encontró la conversación
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

    return (
<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "padding"}
  className="flex-1 bg-white"
  style={{ paddingTop: insets.top }}
>

        {/* Header Minimalista */}
        
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="mr-3 p-2"
              onPress={() => router.back()}
            >
              <FontAwesome name="chevron-left" size={18} color="#374151" />
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {getChatTitle()}
              </Text>
              <Text className="text-gray-500 text-sm">
                {getChatSubtitle()}
              </Text>
            </View>

            {/* Estado de la oferta */}
            {offer.status === 'ACCEPTED' && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-800 text-xs font-medium">
                  Aceptada
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Área de Chat */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 bg-gray-50"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Mensaje inicial de la oferta */}
          <View className="px-4 mb-4">
            <View className="bg-white rounded-2xl p-4 border border-gray-200">
              <View className="flex-row items-center mb-2">
                <FontAwesome name="file-text" size={14} color="#6B7280" />
                <Text className="text-gray-700 font-medium ml-2">
                  {userType === 'technician' ? 'Tu propuesta' : 'Propuesta del técnico'}
                </Text>
              </View>
              <Text className="text-gray-600 text-base leading-6">
                {offer.message || "No se incluyó un mensaje adicional"}
              </Text>
              <Text className="text-gray-400 text-xs mt-2">
                {offer.createdAt ? format(new Date(offer.createdAt), "dd 'de' MMMM 'a las' HH:mm", { locale: es }) : ''}
              </Text>
            </View>
          </View>

          {/* Mensajes del chat */}
          {messages.length === 0 ? (
            <View className="items-center justify-center py-8 px-4">
              <FontAwesome name="comments-o" size={40} color="#D1D5DB" />
              <Text className="text-gray-400 text-center mt-3">
                Inicia la conversación{'\n'}
                <Text className="text-gray-300">Envía el primer mensaje</Text>
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View 
                key={message.id} 
                className={`px-4 mb-3 ${message.senderId == userId ? 'items-end' : 'items-start'}`}
              >
                <View 
                  className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    message.senderId == userId 
                      ? 'bg-blue-500 rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <Text 
                    className={`text-base font-medium ${
                      message.senderId == userId ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {message.content}
                  </Text>
                  <Text 
                    className={`text-xs mt-1 font-medium ${
                      message.senderId == userId ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {format(new Date(message.createdAt), 'HH:mm', { locale: es })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input de Mensaje */}
        <View 
          style={{ paddingBottom: insets.bottom  }}
          className="bg-white border-t border-gray-200 px-4 py-3"
        >
          <View className="flex-row items-center">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3 text-gray-900 text-base"
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
          
          {/* Indicador de estado */}
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-gray-400 text-xs">
              {messages.length > 0 ? `${messages.length} mensaje${messages.length !== 1 ? 's' : ''}` : 'Sin mensajes'}
            </Text>
            <Text className="text-gray-400 text-xs">
              {offer.status === 'ACCEPTED' ? '✅ Oferta aceptada' : '💬 Conversación activa'}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }