import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform, ScrollView, KeyboardAvoidingView, Modal, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../components/config/api.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox'; // Importamos el checkbox

export default function TechnicianRegister() {
  const [birthDate, setBirthDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // Estado para términos
  const [showTermsModal, setShowTermsModal] = useState(false); // Modal para ver términos

  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [experienceYears, setExperienceYears] = useState('');
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const response = await axios.get(`${API_URL}/specialties`);
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error loading specialties:', error);
    }
  };

  const handleSetSpecialty = () => {
    if (!selectedSpecialty || !experienceYears) {
      Alert.alert('Error', 'Selecciona una especialidad y años de experiencia');
      return;
    }

    setShowSpecialtyModal(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !name || !phone || !lastname || !birthDate) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!selectedSpecialty || !experienceYears) {
      Alert.alert('Error', 'Debes seleccionar UNA especialidad');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Términos y Condiciones', 'Debes aceptar los términos y condiciones para continuar');
      return;
    }

    try {
      setLoading(true);

      // Guardar datos
      await AsyncStorage.multiSet([
        ['email', email],
        ['password', password],
        ['name', name],
        ['lastname', lastname],
        ['phone', phone],
        ['birthDate', birthDate.toISOString()],
        ['specialtyId', String(selectedSpecialty.id)],
        ['specialtyName', selectedSpecialty.name],
        ['experienceYears', String(experienceYears)],
      ]);

      router.push('/files');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al guardar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.replace('/login');

  const handleOpenTerms = () => {
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowTermsModal(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 py-8">
          
          {/* Volver */}
          <TouchableOpacity className="p-2 mb-4" onPress={goToLogin}>
            <FontAwesome name="chevron-left" size={18} color="#374151" />
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-orange-100 w-16 h-16 rounded-full items-center justify-center mb-4">
              <FontAwesome name="wrench" size={24} color="#FF6600" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Registro Técnico</Text>
            <Text className="text-gray-500 text-center">Completa tu perfil profesional</Text>
          </View>

          {/* Campos */}
          <View className="space-y-4">

            {/* Nombre */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 text-sm">Nombre *</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <FontAwesome name="user" size={16} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3"
                    placeholder="Tu nombre"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Apellido */}
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 text-sm">Apellido *</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <FontAwesome name="user" size={16} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3"
                    placeholder="Tu apellido"
                    placeholderTextColor="#9CA3AF"
                    value={lastname}
                    onChangeText={setLastname}
                  />
                </View>
              </View>
            </View>

            {/* Fecha Nacimiento */}
            <View>
              <Text className="text-gray-700 mb-2 text-sm">Fecha de Nacimiento *</Text>
              <TouchableOpacity
                onPress={() => setShowPicker(true)}
                className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3"
              >
                <FontAwesome name="calendar" size={16} color="#9CA3AF" />
                <Text className={`ml-3  font-medium ${birthDate ? "text-gray-900" : "text-gray-400"}`}>
                  {birthDate ? format(birthDate, "dd 'de' MMMM 'de' yyyy", { locale: es }) : "Selecciona tu fecha"}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                value={birthDate || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                  onChange={(e, date) => {
                    setShowPicker(false);
                    if (date) setBirthDate(date);
                  }}
                />
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-gray-700 mb-2 text-sm">Correo Electrónico *</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <FontAwesome name="envelope" size={16} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3"
                  placeholder="email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Teléfono */}
            <View>
              <Text className="text-gray-700 mb-2 text-sm">Teléfono *</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <FontAwesome name="phone" size={16} color="#9CA3AF" />
                <Text className="ml-3 text-gray-500">+56 9</Text>
                <TextInput
                  className="flex-1 ml-2"
                  placeholder="1234 5678"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={8}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View>
              <Text className="text-gray-700 mb-2 text-sm">Contraseña *</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <FontAwesome name="lock" size={16} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Especialidad (solo una) */}
            <View className="bg-blue-50 rounded-2xl p-4 mt-4">
              <Text className="text-blue-800 font-semibold text-sm mb-3">
                🔧 Especialidad Profesional *
              </Text>

              {selectedSpecialty ? (
                <View className="bg-white p-4 rounded-xl border border-blue-200 mb-3">
                  <Text className="text-gray-900 font-medium">{selectedSpecialty.name}</Text>
                  <Text className="text-gray-500 text-sm">
                    {experienceYears} año(s) de experiencia
                  </Text>

                  <TouchableOpacity
                    className="mt-2 p-2"
                    onPress={() => {
                      setSelectedSpecialty(null);
                      setExperienceYears('');
                    }}
                  >
                    <Text className="text-red-600 font-medium">Eliminar selección</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="border-2 border-dashed border-blue-300 rounded-2xl p-4 items-center"
                  onPress={() => setShowSpecialtyModal(true)}
                >
                  <FontAwesome name="plus" size={20} color="#3B82F6" />
                  <Text className="text-blue-600 font-medium mt-1">Seleccionar Especialidad</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Checkbox de Términos y Condiciones */}
            <View className="mt-4">
              <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
                <Checkbox
                  style={styles.checkbox}
                  value={acceptedTerms}
                  onValueChange={setAcceptedTerms}
                  color={acceptedTerms ? '#FF6600' : undefined}
                />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-700 text-sm">
                    Acepto los{' '}
                    <Text 
                      className="text-orange-500 font-semibold"
                      onPress={handleOpenTerms}
                    >
                      Términos y Condiciones
                    </Text>
                    {' '}y la{' '}
                    <Text 
                      className="text-orange-500 font-semibold"
                      onPress={handleOpenTerms}
                    >
                      Política de Privacidad
                    </Text>
                  </Text>
                  
                  {!acceptedTerms && (
                    <Text className="text-red-500 text-xs mt-1">
                      * Debes aceptar los términos para continuar
                    </Text>
                  )}
                </View>
              </View>
            </View>

          </View>

          {/* Botón Registrar */}
          <TouchableOpacity
            className={`w-full rounded-2xl py-4 mt-6 ${
              !selectedSpecialty || !acceptedTerms ? 'bg-orange-300' : 'bg-orange-500'
            }`}
            disabled={!selectedSpecialty || !acceptedTerms}
            onPress={handleRegister}
          >
            <Text className="text-center text-white font-bold text-lg">
              {loading ? 'Procesando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>

          {/* Texto de Login */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text className="text-orange-500 font-semibold">Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal Especialidad */}
      <Modal visible={showSpecialtyModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold mb-4">Seleccionar Especialidad</Text>

            <ScrollView className="max-h-40 mb-4">
              {specialties.map(spec => (
                <TouchableOpacity
                  key={spec.id}
                  className={`p-3 rounded-xl mb-2 ${
                    selectedSpecialty?.id === spec.id
                      ? "bg-orange-100 border border-orange-500"
                      : "bg-gray-100 border border-gray-200"
                  }`}
                  onPress={() => setSelectedSpecialty(spec)}
                >
                  <Text className={`font-medium ${
                    selectedSpecialty?.id === spec.id ? "text-orange-700" : "text-gray-700"
                  }`}>
                    {spec.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-sm font-medium mb-2">Años de experiencia *</Text>
            <TextInput
              className="border border-gray-300 rounded-2xl px-4 py-3 mb-6"
              placeholder="Ej: 3"
              keyboardType="number-pad"
              value={experienceYears}
              onChangeText={setExperienceYears}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 border border-gray-300 rounded-2xl py-3"
                onPress={() => setShowSpecialtyModal(false)}
              >
                <Text className="text-center text-gray-700">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-orange-500 rounded-2xl py-3"
                onPress={handleSetSpecialty}
              >
                <Text className="text-center text-white font-medium">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal de Términos y Condiciones */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        {/* Contenedor que ocupa toda la pantalla: overlay + modal en la parte inferior */}
        <View className="flex-1 justify-end">
          {/* Fondo semitransparente (overlay). Al tocarlo, cierra modal */}
          <TouchableWithoutFeedback onPress={() => setShowTermsModal(false)}>
            <View className="absolute inset-0 bg-black/50" />
          </TouchableWithoutFeedback>

          {/* Caja blanca del modal */}
          <View
            className="bg-white rounded-t-3xl"
            // altura fija relativa (más fiable que utilidades no soportadas)
            style={{
              height: '85%', // ocupa el 85% de la pantalla — ajústalo si quieres más o menos
            }}
          >
            {/* Barra superior (drag handle) */}
            <View className="items-center pt-3">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="border-b border-gray-200 p-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-bold text-gray-900">Términos y Condiciones</Text>
                <TouchableOpacity onPress={() => setShowTermsModal(false)} className="p-2">
                  <FontAwesome name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Contenido */}
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={true}>
        
        <Text className="text-lg font-bold text-gray-900 mb-4">
          TÉRMINOS Y CONDICIONES DE USO – SERVITECYA
        </Text>

        {/* Sección 1 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            1. Aceptación de los Términos
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Al registrarse, acceder o utilizar la aplicación móvil ServitecYa,
            el Usuario (cliente o técnico) acepta expresamente estos Términos y
            Condiciones. Quien no esté de acuerdo deberá abstenerse de usar el servicio.
          </Text>
        </View>

        {/* Sección 2 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            2. Naturaleza del Servicio
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            ServitecYa actúa únicamente como intermediario tecnológico,
            facilitando la conexión entre usuarios que requieren servicios técnicos
            y técnicos independientes que los ofrecen. ServitecYa no presta servicios
            técnicos, no emplea a los técnicos y no garantiza la calidad del servicio realizado.
          </Text>
        </View>

        {/* Sección 3 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            3. Registro de Usuario
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Para utilizar la plataforma, el Usuario debe:{"\n\n"}
            • Proporcionar información verdadera y verificable.{"\n"}
            • Mantener la confidencialidad de su contraseña.{"\n"}
            • Ser mayor de 18 años.{"\n\n"}
            La plataforma puede suspender cuentas con actividad dudosa, uso indebido
            o datos falsos.
          </Text>
        </View>

        {/* Sección 4 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            4. Registro y Obligaciones del Técnico
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            El técnico debe:{"\n\n"}
            • Proveer información real sobre su identidad, experiencia y certificaciones.{"\n"}
            • Subir documentación válida cuando sea requerida.{"\n"}
            • Cumplir los estándares mínimos de calidad y comportamiento profesional.{"\n"}
            • Responder oportunamente a las solicitudes de los usuarios.{"\n\n"}
            ServitecYa puede validar certificados, rechazar perfiles o revocar accesos
            por incumplimiento.
          </Text>
        </View>

        {/* Sección 5 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            5. Solicitud y Ejecución del Servicio
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            El Usuario publica una solicitud con descripción, ubicación e imágenes (opcional).{"\n"}
            Los técnicos pueden aceptar, ignorar o rechazar solicitudes.{"\n"}
            El Usuario recibe notificaciones del progreso.{"\n"}
            El Técnico debe realizar el servicio cumpliendo lo acordado.{"\n"}
            La plataforma no garantiza disponibilidad inmediata de técnicos.
          </Text>
        </View>

        {/* Sección 6 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            6. Pagos
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Los pagos se procesan mediante servicios externos certificados.{"\n"}
            ServitecYa:{"\n\n"}
            • No almacena datos bancarios.{"\n"}
            • No es responsable por fallos del proveedor de pago.{"\n"}
            • Puede cobrar comisiones por uso de la plataforma.{"\n\n"}
            El costo final del servicio es informado antes de realizar el pago.
          </Text>
        </View>

        {/* Sección 7 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            7. Calificaciones
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Los usuarios pueden calificar y comentar la calidad del servicio.{"\n"}
            ServitecYa podrá moderar o eliminar contenido ofensivo, fraudulento o no relacionado.
          </Text>
        </View>

        {/* Sección 8 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            8. Prohibiciones
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Queda estrictamente prohibido:{"\n\n"}
            • Crear perfiles falsos o suplantar identidad.{"\n"}
            • Utilizar la plataforma para actividades ilegales.{"\n"}
            • Interferir con la operación del sistema.{"\n"}
            • Agredir, insultar o acosar a otros usuarios o técnicos.{"\n\n"}
            El incumplimiento puede resultar en suspensión definitiva.
          </Text>
        </View>

        {/* Sección 9 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            9. Limitación de Responsabilidad
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            ServitecYa no se hace responsable por:{"\n\n"}
            • Daños, pérdidas o perjuicios causados por técnicos.{"\n"}
            • Información falsa entregada por usuarios o técnicos.{"\n"}
            • Retrasos, fallas o interrupciones del servicio.{"\n"}
            • Transacciones fallidas por problemas externos.{"\n\n"}
            El Usuario acepta que contrata directamente con el Técnico.
          </Text>
        </View>

        {/* Sección 10 */}
        <View className="mb-4">
          <Text className="font-semibold text-gray-800 mb-1">
            10. Modificaciones
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            ServitecYa puede actualizar estos Términos en cualquier momento.
            El uso continuo implica aceptación de los cambios.
          </Text>
        </View>

        {/* Sección 11 */}
        <View className="mb-12">
          <Text className="font-semibold text-gray-800 mb-1">
            11. Contacto
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Para consultas:{"\n"}
            📧 soporte@servitecya.cl{"\n"}
            📍 Chile
          </Text>
        </View>

      </ScrollView>

            {/* Footer fijo: ocupamos la parte inferior con botones */}
            <View
              className="px-6 py-4 border-t border-gray-200"
              // sombra pequeña opcional para separar del contenido
              style={{
                backgroundColor: 'white',
              }}
            >
              <TouchableOpacity
                className="bg-orange-500 rounded-2xl py-3"
                onPress={handleAcceptTerms}
              >
                <Text className="text-center text-white font-bold text-lg">
                  Aceptar Términos y Condiciones
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border border-gray-300 rounded-2xl py-3 mt-3"
                onPress={() => setShowTermsModal(false)}
              >
                <Text className="text-center text-gray-700 font-medium">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    margin: 4,
    width: 22,
    height: 22,
    borderRadius: 4,
  },
});