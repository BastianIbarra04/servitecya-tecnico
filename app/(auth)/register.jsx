import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform, ScrollView, KeyboardAvoidingView, Modal } from 'react-native';
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
      
      // Guardar datos en AsyncStorage para usar en el siguiente paso
      await AsyncStorage.multiSet([
        ['email', email],
        ['password', password],
        ['name', name],
        ['lastname', lastname],
        ['phone', phone],
        ['birthDate', birthDate.toISOString()],
        ['specialties', JSON.stringify(selectedSpecialties)]
      ]);

      // Navegar a la pantalla de documentos
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

  const availableSpecialties = specialties.filter(spec => 
    !selectedSpecialties.find(selected => selected.id === spec.id)
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="px-6 py-8">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              className="p-2 mr-2"
              onPress={goToLogin}
            >
              <FontAwesome name="chevron-left" size={16} color="#374151" />
            </TouchableOpacity>
          </View>
          <View className="items-center mb-8">
            <View className="bg-orange-100 w-16 h-16 rounded-full items-center justify-center mb-4">
              <FontAwesome name="wrench" size={24} color="#FF6600" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Registro Técnico</Text>
            <Text className="text-gray-500 text-center">
              Completa tu perfil profesional
            </Text>
          </View>

          {/* Form Container */}
          <View className="space-y-4">
            
            {/* Nombre y Apellido */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2 text-sm">Nombre *</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <FontAwesome name="user" size={16} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900"
                    placeholder="Tu nombre"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
              
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2 text-sm">Apellido *</Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <FontAwesome name="user" size={16} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900"
                    placeholder="Tu apellido"
                    placeholderTextColor="#9CA3AF"
                    value={lastname}
                    onChangeText={setLastname}
                  />
                </View>
              </View>
            </View>

            {/* Fecha de Nacimiento */}
            <View>
              <Text className="text-gray-700 font-medium mb-2 text-sm">Fecha de Nacimiento *</Text>
              <TouchableOpacity
                onPress={() => setShowPicker(true)}
                className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3"
              >
                <FontAwesome name="calendar" size={16} color="#9CA3AF" />
                <Text className={`ml-3 ${birthDate ? 'text-gray-900' : 'text-gray-400'}`}>
                  {birthDate
                    ? format(birthDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
                    : 'Selecciona tu fecha de nacimiento'}
                </Text>
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
              <Text className="text-gray-700 font-medium mb-2 text-sm">Correo Electrónico *</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <FontAwesome name="envelope" size={16} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="tu@email.com"
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
              <Text className="text-gray-700 font-medium mb-2 text-sm">Teléfono *</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <FontAwesome name="phone" size={16} color="#9CA3AF" />
                <Text className="text-gray-500 ml-3">+56 9</Text>
                <TextInput
                  className="flex-1 ml-2 text-gray-900"
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
              <Text className="text-gray-700 font-medium mb-2 text-sm">Contraseña *</Text>
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
                  <FontAwesome 
                    name={showPassword ? "eye-slash" : "eye"} 
                    size={16} 
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Especialidades */}
            <View className="bg-blue-50 rounded-2xl p-4 mt-4">
              <Text className="text-blue-800 font-semibold text-sm mb-3">
                🔧 ESPECIALIDADES PROFESIONALES *
              </Text>
              
              <Text className="text-gray-600 text-sm mb-3">
                Agrega tus especialidades y años de experiencia
              </Text>

              {/* Especialidades seleccionadas */}
              {selectedSpecialties.map((specialty) => (
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
                className="border-2 border-dashed border-blue-300 rounded-2xl p-4 items-center mt-2"
                onPress={() => setShowSpecialtyModal(true)}
              >
                <FontAwesome name="plus" size={20} color="#3B82F6" />
                <Text className="text-blue-600 font-medium mt-1">
                  Agregar Especialidad
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity
            style={{ marginBottom: 32 }}
            className={`w-full rounded-2xl py-4 mt-8 ${
              loading || selectedSpecialties.length === 0 ? 'bg-orange-400' : 'bg-orange-500'
            } shadow-lg`}
            onPress={handleRegister}
            disabled={loading || selectedSpecialties.length === 0}
          >
            <View className="flex-row items-center justify-center">
              {loading && (
                <FontAwesome name="spinner" size={20} color="white" />
              )}
              <Text className="text-white font-bold text-lg text-center ml-2">
                {loading ? 'Procesando...' : 'Continuar'}
              </Text>
            </View>
          </TouchableOpacity>

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
                className="border border-gray-300 rounded-2xl px-4 py-3 bg-white"
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
                className="flex-1 border border-gray-300 rounded-2xl py-3"
                onPress={() => setShowSpecialtyModal(false)}
              >
                <Text className="text-gray-700 text-center font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-orange-500 rounded-2xl py-3"
                onPress={handleAddSpecialty}
              >
                <Text className="text-white text-center font-medium">Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});