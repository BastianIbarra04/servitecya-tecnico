import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../components/config/api.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Register() {
  const [birthDate, setBirthDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false, lastname: false, email: false, phone: false, password: false
  });

  const router = useRouter();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    if (!email || !password || !name || !phone || !lastname || !birthDate) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    try {
      setLoading(true);
      await AsyncStorage.multiSet([
        ['email', email],
        ['password', password],
        ['name', name],
        ['lastname', lastname],
        ['phone', phone],
        ['birthDate', birthDate.toISOString()],
      ]);

      router.replace('/files');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al guardar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/login');
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const isFormValid = email && password && name && phone && lastname && birthDate;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
          <ScrollView 
            className="flex-1 px-6"
            contentContainerStyle={{ 
              flexGrow: 1,
              paddingTop: 40,
              paddingBottom: insets.bottom + 100 // 🔥 Espacio extra para el botón
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-gray-800 mb-2">
                Crear Cuenta
              </Text>
              <Text className="text-base text-gray-500 text-center">
                Completa tus datos para comenzar
              </Text>
            </View>

            {/* Formulario */}
            <View className="space-y-5">
              {/* Nombre y Apellido */}
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Nombre
                  </Text>
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 ${
                      isFocused.name 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Tu nombre"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Apellido
                  </Text>
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 ${
                      isFocused.lastname 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Tu apellido"
                    placeholderTextColor="#9CA3AF"
                    value={lastname}
                    onChangeText={setLastname}

                    editable={!loading}
                  />
                </View>
              </View>

              {/* Fecha de Nacimiento */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Nacimiento
                </Text>
                <TouchableOpacity
                  className={`border-2 rounded-xl px-4 py-4 flex-row items-center justify-between ${
                    birthDate 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  onPress={() => setShowPicker(true)}
                  disabled={loading}
                >
                  <Text className={`text-base ${birthDate ? 'text-gray-800' : 'text-gray-500'}`}>
                    {birthDate
                      ? format(birthDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
                      : 'Selecciona tu fecha de nacimiento'}
                  </Text>
                  <FontAwesome name="calendar" size={18} color="#6B7280" />
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={birthDate || new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowPicker(false);
                      if (selectedDate) setBirthDate(selectedDate);
                    }}
                  />
                )}
              </View>

              {/* Email */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico
                </Text>
                <TextInput
                  className={`border-2 rounded-xl px-4 py-4 ${
                    isFocused.email 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>

              {/* Teléfono */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </Text>
                <View className={`flex-row items-center border-2 rounded-xl px-4 py-4 ${
                  isFocused.phone 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <Text className="text-gray-600 font-medium mr-2">+56 9</Text>
                  <View className="w-px h-6 bg-gray-300 mr-2" />
                  <TextInput
                    className="flex-1 text-gray-800"
                    placeholder="1234 5678"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    maxLength={8}
                    value={phone}
                    onChangeText={setPhone}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Contraseña */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </Text>
                <TextInput
                  className={`border-2 rounded-xl px-4 py-4 ${
                    isFocused.password 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="Crea una contraseña segura"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}

                  editable={!loading}
                />
              </View>
            </View>

            {/* Botón de Registro - Fijo en la parte inferior */}
            <View className="mt-8 pt-6 border-t border-gray-200">
              <TouchableOpacity 
                className={`rounded-xl py-4 items-center justify-center shadow-lg ${
                  loading 
                    ? 'bg-orange-400' 
                    : isFormValid 
                    ? 'bg-orange-500' 
                    : 'bg-gray-300'
                }`}
                onPress={handleRegister}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <View className="flex-row items-center">
                    <Text className="text-white text-lg font-semibold">
                      Procesando...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-white text-lg font-semibold mr-2">
                      Continuar
                    </Text>
                    <FontAwesome name="arrow-right" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Enlace para login */}
              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-gray-600 text-base">
                  ¿Ya tienes una cuenta?
                </Text>
                <TouchableOpacity onPress={goToLogin} disabled={loading}>
                  <Text className="text-orange-500 font-semibold text-base ml-2">
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});