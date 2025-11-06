import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../components/config/api.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


export default function Register() {
  const [birthDate, setBirthDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth(); // 👈 usamos el contexto global para actualizar sesión

  const handleRegister = async () => {
    if (!email || !password || !name || !phone || !lastname || !birthDate) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    try {
      await AsyncStorage.multiSet([
        ['email', email],
        ['password', password],
        ['name', name],
        ['lastname', lastname],
        ['phone', phone],
        ['birthDate', birthDate.toISOString()],
      ]);

      // Redirigir a la vista de subir archivos
      router.replace('/files');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al guardar los datos.');
    }
  };

  const goToLogin = () => {
    router.replace('/login'); // 👈 redirige con Expo Router
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#F8F9FB] px-6">
      <Text className="text-2xl text-[#7a797a] font-bold mb-4">Crear Cuenta</Text>

      <View style={styles.rowContainer}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Nombre"
          placeholderTextColor="#7a797a"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Apellido"
          placeholderTextColor="#7a797a"
          value={lastname}
          onChangeText={setLastname}
        />
      </View>

      <View style={{ width: '100%'}}>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={[
            styles.input,
            { justifyContent: 'center', height: 45, paddingVertical: 0 },
          ]}
        >
          <Text style={{ color: birthDate ? '#7a797a' : '#7a797a' }}>
            {birthDate
              ? format(birthDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
              : 'Fecha de nacimiento'}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={birthDate || new Date(2000, 0, 1)} // fecha por defecto
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()} // no permite fechas futuras
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setBirthDate(selectedDate);
            }}
          />
        )}
      </View>


      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#7a797a"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.phoneContainer}>
        <Text style={styles.phoneCode}>+56 9</Text>
        <TextInput
          style={{ color: '#7a797a', height: '100%', flex: 1 }}
          placeholder="Número de teléfono"
          placeholderTextColor="#7a797a"
          keyboardType="phone-pad"
          maxLength={8}
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#7a797a"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Siguiente'}</Text>
      </TouchableOpacity>

      <View style={styles.register}>
        <Text className="text-[#7a797a] font-bold" style={styles.loginText}>¿Ya tienes cuenta?</Text>
        <TouchableOpacity onPress={goToLogin}>
          <Text style={styles.loginLink}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#7a797a',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    height: 40,
    color: '#7a797a',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#fc7f20',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  loginLink: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fc7f20',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderRadius: 5,
    borderColor: '#7a797a',
    color: '#7a797a',
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  phoneCode: {
    color: '#7a797a',
    fontSize: 15,
    marginRight: 10,
    borderRightColor: '#7a797a',
    borderRightWidth: 1,
    paddingRight: 10,
  },
  halfInput: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  register: {
    alignItems: 'center',
    marginTop: 20,
  },
});
