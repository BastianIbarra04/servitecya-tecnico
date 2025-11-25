import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, Modal } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../components/config/api.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [experienceYears, setExperienceYears] = useState('');

  const router = useRouter();
  const { login } = useAuth();
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

  const handleAddSpecialty = () => {
    if (!selectedSpecialty || !experienceYears) {
      Alert.alert('Error', 'Por favor selecciona una especialidad y los años de experiencia');
      return;
    }

    const newSpecialty = {
      id: selectedSpecialty.id,
      name: selectedSpecialty.name,
      experienceYears: parseInt(experienceYears),
      since: new Date(new Date().getFullYear() - parseInt(experienceYears), 0, 1)
    };

    setSelectedSpecialties(prev => [...prev, newSpecialty]);
    setSelectedSpecialty(null);
    setExperienceYears('');
    setShowSpecialtyModal(false);
  };

  const removeSpecialty = (id) => {
    setSelectedSpecialties(prev => prev.filter(s => s.id !== id));
  };

  const handleRegister = async () => {
    if (!email || !password || !name || !phone || !lastname || !birthDate) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    if (selectedSpecialties.length === 0) {
      Alert.alert('Error', 'Por favor agrega al menos una especialidad');
      return;
    }

    try {
      setLoading(true);
      
      // Guardar datos en AsyncStorage
      await AsyncStorage.multiSet([
        ['email', email],
        ['password', password],
        ['name', name],
        ['lastname', lastname],
        ['phone', phone],
        ['birthDate', birthDate.toISOString()],
        ['specialties', JSON.stringify(selectedSpecialties)]
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

  const isFormValid = email && password && name && phone && lastname && birthDate && selectedSpecialties.length > 0;

  const availableSpecialties = specialties.filter(spec => 
    !selectedSpecialties.find(selected => selected.id === spec.id)
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
    <KeyboardAwareScrollView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
          <ScrollView 
            className="flex-1 px-6"
            contentContainerStyle={{ 
              flexGrow: 1,
              paddingTop: 20,
              paddingBottom: insets.bottom + 120
            }}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={goToLogin} className="absolute top-4 left-1">
              <FontAwesome name="close" size={28} color="gray" />
            </TouchableOpacity>
            {/* Header */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-orange-500 rounded-2xl items-center justify-center mb-3 shadow-lg">
                <FontAwesome name="wrench" size={28} color="white" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                Únete como Técnico
              </Text>
              <Text className="text-base text-gray-500 text-center">
                Completa tu perfil profesional
              </Text>
            </View>

            {/* Progress Indicator */}
            <View className="flex-row justify-center mb-6">
              <View className="w-3 h-3 bg-orange-500 rounded-full mx-1"></View>
              <View className="w-3 h-3 bg-gray-300 rounded-full mx-1"></View>
            </View>

            {/* Formulario */}
            <View className="space-y-4">
              {/* Información Personal */}
              <View className=" rounded-xl p-4 mb-2">
                <Text className="text-orange-800 font-semibold text-sm mb-3">
                  📝 INFORMACIÓN PERSONAL
                </Text>
                
                {/* Nombre y Apellido */}
                <View className="flex-row space-x-3 mb-4">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </Text>
                    <TextInput
                      className={`border rounded-xl px-4 py-3 ${
                        isFocused.name 
                          ? 'border-orange-500 bg-white shadow-sm' 
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Tu nombre"
                      placeholderTextColor="#9CA3AF"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </Text>
                    <TextInput
                      className={`border rounded-xl px-4 py-3 ${
                        isFocused.lastname 
                          ? 'border-orange-500 bg-white shadow-sm' 
                          : 'border-gray-300 bg-white'
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
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento *
                  </Text>
                  <TouchableOpacity
                    className={`border rounded-xl px-4 py-3 flex-row items-center justify-between border-gray-300 bg-white $
                    }`}
                    onPress={() => setShowPicker(true)}
                    disabled={loading}
                  >
                    <Text className={`text-base ${birthDate ? 'text-gray-800' : 'text-gray-500'}`}>
                      {birthDate
                        ? format(birthDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
                        : 'Selecciona tu fecha'}
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

                {/* Email y Teléfono */}
                <View className="flex">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </Text>
                    <TextInput
                      className={`border rounded-xl px-4 py-3 mb-2 ${
                        isFocused.email 
                          ? 'border-orange-500 bg-white shadow-sm' 
                          : 'border-gray-300 bg-white'
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
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </Text>
                    <View className={`flex-row items-center border rounded-xl px-4 py-3 ${
                      isFocused.phone 
                        ? 'border-orange-500 bg-white shadow-sm' 
                        : 'border-gray-300 bg-white'
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
                </View>

                {/* Contraseña */}
                <View className="mt-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </Text>
                  <TextInput
                    className={`border rounded-xl px-4 py-3 text-base ${
                      isFocused.password 
                        ? 'border-orange-500 bg-white shadow-sm' 
                        : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Especialidades */}
              <View className="bg-blue-50 rounded-xl p-4">
                <Text className="text-blue-800 font-semibold text-sm mb-3">
                  🔧 ESPECIALIDADES PROFESIONALES
                </Text>
                
                <Text className="text-sm text-gray-600 mb-3">
                  Agrega tus especialidades y años de experiencia
                </Text>

                {/* Especialidades seleccionadas */}
                {selectedSpecialties.map((specialty, index) => (
                  <View key={specialty.id} className="bg-white rounded-xl p-3 mb-2 border border-blue-200 flex-row justify-between items-center">
                    <View>
                      <Text className="font-medium text-gray-800">{specialty.name}</Text>
                      <Text className="text-sm text-gray-500">
                        {specialty.experienceYears} año{specialty.experienceYears !== 1 ? 's' : ''} de experiencia
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeSpecialty(specialty.id)}
                      className="p-2"
                    >
                      <FontAwesome name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Botón para agregar especialidad */}
                <TouchableOpacity 
                  className="border-2 border-dashed border-blue-300 rounded-xl p-4 items-center mt-2"
                  onPress={() => setShowSpecialtyModal(true)}
                  disabled={loading}
                >
                  <FontAwesome name="plus" size={20} color="#3B82F6" />
                  <Text className="text-blue-600 font-medium mt-1">
                    Agregar Especialidad
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón de Registro */}
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

          {/* Modal para agregar especialidad */}
          <Modal
            visible={showSpecialtyModal}
            animationType="slide"
            transparent={true}
          >
            <View className="flex-1 justify-center items-center bg-black/50 px-6">
              <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <Text className="text-xl font-bold text-gray-900 mb-4">
                  Agregar Especialidad
                </Text>
                
                {/* Selector de especialidad */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Especialidad *
                  </Text>
                  <ScrollView className="max-h-40">
                    {availableSpecialties.map(specialty => (
                      <TouchableOpacity
                        key={specialty.id}
                        className={`p-3 rounded-xl mb-2 ${
                          selectedSpecialty?.id === specialty.id 
                            ? 'bg-orange-100 border border-orange-500' 
                            : 'bg-gray-100 border border-gray-200'
                        }`}
                        onPress={() => setSelectedSpecialty(specialty)}
                      >
                        <Text className={`font-medium ${
                          selectedSpecialty?.id === specialty.id 
                            ? 'text-orange-700' 
                            : 'text-gray-700'
                        }`}>
                          {specialty.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Años de experiencia */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Años de experiencia *
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-base"
                    placeholder="Ej: 3"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                    maxLength={2}
                  />
                </View>

                {/* Botones del modal */}
                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    className="flex-1 border border-gray-300 rounded-xl py-3"
                    onPress={() => setShowSpecialtyModal(false)}
                  >
                    <Text className="text-gray-700 text-center font-medium">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 bg-orange-500 rounded-xl py-3"
                    onPress={handleAddSpecialty}
                    disabled={!selectedSpecialty || !experienceYears}
                  >
                    <Text className="text-white text-center font-medium">Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}