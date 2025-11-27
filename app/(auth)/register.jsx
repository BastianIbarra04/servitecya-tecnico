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

          </View>

          {/* Botón Registrar */}
          <TouchableOpacity
            className={`w-full rounded-2xl py-4 mt-8 ${
              !selectedSpecialty ? 'bg-orange-300' : 'bg-orange-500'
            }`}
            disabled={!selectedSpecialty}
            onPress={handleRegister}
          >
            <Text className="text-center text-white font-bold text-lg">
              {loading ? 'Procesando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});
