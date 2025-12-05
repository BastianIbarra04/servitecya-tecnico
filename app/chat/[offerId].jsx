import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, Alert, 
  ActivityIndicator, 
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
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
  const [userType, setUserType] = useState(null);

  // ESTADO DE NEGOCIACIÓN
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [negotiationStatus, setNegotiationStatus] = useState(null);

    const fetchNegotiationStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/negotiation/${offerId}`);
      console.log('Estado de negociación:', res.data);
      setNegotiationStatus(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (offerId) {
        fetchNegotiationStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [offerId]);


  const sendNegotiationOffer = async () => {
    if (!negotiationPrice.trim()) return;

    try {
      await axios.put(`${API_URL}/negotiation/send`, {
        offerId,
        senderId: userId,
        price: Number(negotiationPrice)
      });

      Alert.alert("Enviado", "Propuesta enviada correctamente");
      setNegotiationPrice('');
      setShowNegotiationModal(false);
    } catch (err) {
      Alert.alert("Error", "No se pudo enviar la propuesta");
    }
  };

  const acceptNegotiation = async () => {
    Alert.alert(
      "Confirmar",
      "¿Aceptas esta propuesta de precio?",
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Si, aceptar",
          onPress: async () => {
            try {
              await axios.put(`${API_URL}/negotiation/accept`, {
                offerId,
                userId
              });
              Alert.alert("Listo", "Has aceptado la negociación");
              fetchNegotiationStatus();
            } catch (err) {
              Alert.alert("Error", "No se pudo aceptar");
            }
          }
        }
      ]
    );
  };

  const rejectNegotiation = async () => {
    Alert.alert(
      "Confirmar",
      "¿Rechazas esta propuesta de precio?",
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Si, rechazar",
          onPress: async () => {
            try {
              await axios.put(`${API_URL}/negotiation/reject`, {
                offerId,
                userId
              });
              Alert.alert("Rechazado", "Has rechazado la negociación");
              fetchNegotiationStatus();
            } catch (err) {
              Alert.alert("Error", "No se pudo rechazar");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadInitialData();
  }, [offerId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (offerId) {
        fetchMessages();
        fetchNegotiationStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [offerId]);

  const loadInitialData = async () => {
    try {
      const clientId = await AsyncStorage.getItem('userId');
      const technicianId = await AsyncStorage.getItem('technicianId');
      
      console.log('Client ID:', clientId);
      console.log('Technician ID:', technicianId);
      if (clientId) {
        setUserId(clientId);
        setUserType('client');
      } else if (technicianId) {
        setUserId(technicianId);
        setUserType('technician');
      }

      const [offerRes, messagesRes, negotiationRes] = await Promise.all([
        axios.get(`${API_URL}/technician-offer/${offerId}`),
        axios.get(`${API_URL}/messages/${offerId}`),
        axios.get(`${API_URL}/negotiation/${offerId}`)
      ]);

      setOffer(offerRes.data);
      setMessages(messagesRes.data);
      setNegotiationStatus(negotiationRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

    const palabrasNumero = [
    "cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve",
    // variantes y ortografías comunes
    "once","doce","trece","catorce","quince","veinte","treinta","cuarenta","cincuenta"
  ];

  // ---------- Normalizaciones y detectores avanzados ----------
  function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")   // quita tildes
      .replace(/\s+/g, "")               // elimina TODOS los espacios (incl entre letras)
      .replace(/[^a-z0-9]/g, "")         // quita símbolos que no sean letras/dígitos
      .trim();
  }
  
  // Detecta si hay una secuencia de dígitos (aunque esté fragmentada con espacios/guiones/puntos)
  function detectaNumeroFragmentado(texto) {
    if (!texto) return false;
    const soloDigitos = texto.replace(/\D/g, "");
    return soloDigitos.length >= 7; // umbral: 7+ dígitos -> probable teléfono
  }

  // Detecta si hay muchas palabras-numero (ej. "cinco seis nueve ...")
  function detectaNumeroEnPalabras(texto) {
    if (!texto) return false;
    const limpio = texto.toLowerCase();
    let coincidencias = 0;

    for (let p of palabrasNumero) {
      // buscar palabras separadas (ej " cinco ", inicio o fin)
      const re = new RegExp(`\\b${p}\\b`, 'g');
      const m = limpio.match(re);
      if (m) coincidencias += m.length;
    }

    return coincidencias >= 3; // si hay 3+ palabras-numero, sospechoso
  }

  // Detección de emails, redes, direcciones y números con regex
  function contieneDatosProhibidos(texto) {
    if (!texto) return false;
    const patrones = [
      // Teléfonos con espacios, guiones, puntos o juntos
      /(\+?\d[\d\s\-\.]{6,}\d)/g,

      // Emails (incluye variantes con espacios rotos con @ si no se normaliza, por eso regex)
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,

      // Direcciones típicas (palabras clave)
      /\b(av\.?|avenida|calle|pasaje|psj|block|dept|dpto|nro|n°|numero|edificio|torre|villa|condominio)\b/gi,

      // Redes sociales con @ o urls simples
      /@[a-zA-Z0-9._-]+/g,
      /\b(?:instagram|insta|facebook|fb|tiktok|telegram|whatsapp|wapp|wsp)\b/gi,

      // URLs generales
      /\bhttps?:\/\/\S+\b/gi
    ];

    return patrones.some(p => p.test(texto));
  }

  // Detección de solicitudes/discurso que piden datos (normalizado, sin espacios)
  function contieneSolicitudDeDatos(texto) {
    if (!texto) return false;
    const limpio = normalizarTexto(texto);

    // Frases y palabras prohibidas (normalizadas sin espacios)
    const frasesProhibidas = [
      // direcciones / ubicación
      "dametudireccion","tudireccion","pasametudireccion","cualestudireccion","dondevives","tuubicacion","pasametuubicacion","enquepartevives","cualestuubicacion","dimeubicacion",

      // teléfono / whatsapp / contacto directo
      "dametunumero","pasametunumero","tunumero","numerodetelefono","tuwhatsapp","pasametuwhatsapp","pasametuwsp","pasametuwspp","dametuwsp","mandamenu",
      "dameeltef","telefono","telefon","celular","cel","movil","whatsapp","wsp","wspp","wpp",

      // email / correo
      "pasametucorreo","tucorreo","tunemail","gmailcom","hotmailcom","porsiemprecorreo",

      // redes sociales / interno
      "pasameinsta","tuinstagram","pasameinstagram","insta","facebook","fb","tiktok","redsocial","hablemospor","porsiempre","porinterno","mejorporwhatsapp","mejorporwsp","mejorporwspp","dameinsta"
    ];

    // comprobar si alguna frase aparece en el texto normalizado
    const match = frasesProhibidas.some(frase => limpio.includes(frase));
    return match;
  }

  // Detección de intentos de regateo (negociación fuera de la plataforma)
  function isBargainingAttempt(texto) {
    if (!texto) return false;
    const limpio = texto.toLowerCase();

    const patronesRegateo = [
      /\bdescuento\b/i,
      /\brebaja\b/i,
      /\bprecio menor\b/i,
      /\bme lo dejas en\b/i,
      /\bpuedes bajarlo\b/i,
      /\bme lo dejas\b/i,
      /\bnegociar precio\b/i,
      /\bnegociamos\b/i,
      /\bofrezco\b.*\b(?!plataforma)\b/i, // heurística simple
      /\bte doy\b.*\b(porba|por)\b/i
    ];

    return patronesRegateo.some(r => r.test(limpio));
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/${offerId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // ---------- Envío con moderación avanzada ----------
  const sendMessage = async () => {
    const texto = newMessage || "";
    const textoTrim = texto.trim();
    if (!textoTrim) return;

    console.log('Intentando enviar mensaje:', textoTrim);

    // 1) Detección de datos visibles (regex)
    if (contieneDatosProhibidos(textoTrim)) {
      console.log('Bloqueado: contiene datos prohibidos (regex).');
      Alert.alert(
        'Mensaje bloqueado',
        'Por seguridad, no puedes compartir teléfonos, direcciones, correos ni redes sociales. Coordina todo dentro de la plataforma.'
      );
      return;
    }

    // 2) Detección de números fragmentados (ej "5 6 9 1 1 1 2 2 2")
    if (detectaNumeroFragmentado(textoTrim)) {
      console.log('Bloqueado: detecta número fragmentado.');
      Alert.alert(
        'Mensaje bloqueado',
        'Parece que intentas compartir un número telefónico. Por seguridad, no se permite compartir datos de contacto.'
      );
      return;
    }

    // 3) Detección de números escritos en palabras ("cinco seis nueve ...")
    if (detectaNumeroEnPalabras(textoTrim)) {
      console.log('Bloqueado: detecta número escrito en palabras.');
      Alert.alert(
        'Mensaje bloqueado',
        'Parece que intentas compartir un número telefónico en palabras. Por seguridad, no se permite compartir datos de contacto.'
      );
      return;
    }

    // 4) Detección de solicitudes de datos (incluso con espacios entre letras)
    if (contieneSolicitudDeDatos(textoTrim)) {
      console.log('Bloqueado: solicitud de datos detectada.');
      Alert.alert(
        'Mensaje bloqueado',
        'No solicites ni compartas datos personales (dirección, teléfono, correo o redes). Usa las funciones de la plataforma para coordinar.'
      );
      return;
    }


    // Si pasa todos los filtros, enviar
    setSending(true);
    try {
      const response = await axios.post(`${API_URL}/messages`, {
        content: textoTrim,
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
    return 'Chat con ' + (offer.serviceRequest.user.name || offer.technician.user.name);
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
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View className="bg-red-50 border-b border-red-200 px-4 py-3 mb-2">
          <Text className="text-red-900 font-bold text-sm">
            🔒 Chat monitoreado
          </Text>
          <Text className="text-red-800 text-xs mt-1 leading-4">
            Este chat utiliza un sistema automático de seguridad. No compartas datos personales 
            como direcciones, teléfonos, correos o redes sociales. 
            Las conversaciones están sujetas a revisión para proteger tu seguridad.
          </Text>
        </View>

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

              {negotiationStatus?.status === 'PENDING' && (
          <View className="px-4 py-3 border-t border-gray-300 bg-white">
            {/* WIDGET MÍNIMO */}
            <View className="">
              {/* Si hay negociación activa */}
              {negotiationStatus?.negotiationStatus === 'COUNTER_OFFER' ? (
                <View className="mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <FontAwesome 
                  name={negotiationStatus.proposedBy === Number(userId) ? "hourglass-half" : "bell"} 
                  size={16} 
                  color={negotiationStatus.proposedBy === Number(userId) ? "#3B82F6" : "#F59E0B"} 
                />
                <Text className="ml-2 text-gray-700">
                  {negotiationStatus.proposedBy === Number(userId) ? "Esperando..." : "Propuesta nueva"}
                </Text>
              </View>
              <Text className="font-bold">
                ${negotiationStatus.proposedPrice?.toLocaleString("es-CL")}
              </Text>
            </View>
            
            {negotiationStatus.proposedBy !== Number(userId) && (
              <View className="flex-row mt-2 space-x-2">
                <TouchableOpacity 
                  className="flex-1 bg-green-500 py-2 rounded-lg"
                  onPress={acceptNegotiation}
                >
                  <Text className="text-white text-center font-medium">Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 bg-red-500 py-2 rounded-lg"
                  onPress={rejectNegotiation}
                >
                  <Text className="text-white text-center font-medium">Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
                </View>
              ) : null}

              {/* Indicador simple si ya está aceptado */}
              {(negotiationStatus?.negotiationStatus === 'ACCEPTED' || offer.status === 'ACCEPTED') && (
                <View className="py-1">
                  <Text className="text-green-600 text-center text-sm">
                    ✅ Precio acordado
                  </Text>
                </View>
              )}
              {(negotiationStatus?.negotiationStatus === 'REJECTED' || offer.status === 'REJECTED') && (
                <View className="py-1">
                  <Text className="text-red-600 text-center text-sm">
                    ❌ Negociación rechazada
                  </Text>
                </View>
              )}
            </View>


            </View>
              )}
              { offer.status !== 'ACCEPTED' && (
              <View className="px-4 py-2 border-t border-gray-300 bg-white">
                {/* Botón abrir negociación */}
                <TouchableOpacity
                  className="bg-blue-500 px-4 py-2 rounded-full"
                  onPress={() => setShowNegotiationModal(true)}
                >
                  <Text className="text-white text-center font-semibold">
              Negociar precio
                  </Text>
                </TouchableOpacity>
              </View>
              )}
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

    {/* Modal de Negociación */}
    <Modal 
      visible={showNegotiationModal} 
      animationType="fade" 
      transparent={true}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <View className="flex-1 justify-center bg-black/70  px-4">
          <View className="bg-white rounded-xl p-4 mx-4">
            
            {/* Encabezado */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900 text-center">
                Negociar precio
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-1">
                Propón un nuevo valor
              </Text>
            </View>

            {/* Precio actual */}
            <View className="mb-5 p-3 bg-gray-100 rounded-lg">
              <Text className="text-gray-600 text-sm mb-1">Precio actual</Text>
              <Text className="text-gray-900 font-bold text-xl">
                ${offer.price?.toLocaleString('es-CL') || '0'}
              </Text>
            </View>

            {/* Campo para nuevo precio */}
            <View className="mb-1">
              <Text className="text-gray-700 font-medium mb-2">Nuevo precio</Text>
              <View className="relative">
                <Text className="absolute left-3 top-3 text-gray-500 font-bold">$</Text>
                <TextInput
                  placeholder="Ej: 25000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={negotiationPrice}
                  onChangeText={setNegotiationPrice}
                  className="border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 font-semibold"
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Botones */}
            <View className="flex-row space-x-3 mt-6">
              <TouchableOpacity
                className="flex-1 border border-gray-300 py-3 rounded-lg"
                onPress={() => setShowNegotiationModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  Number(negotiationPrice) > 0 ? 'bg-blue-600' : 'bg-gray-400'
                }`}
                onPress={sendNegotiationOffer}
                disabled={Number(negotiationPrice) <= 0}
              >
                <Text className="text-white font-semibold text-center">Enviar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </KeyboardAvoidingView>
  );
}
