import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function InactiveScreen({logout}) {

  return (
        <View className="flex-1 bg-white from-orange-50 to-white justify-center items-center p-6">
        {/* Icono de verificación pendiente */}
        <View className="items-center mb-8">
            <View className="w-24 h-24 bg-orange-100 rounded-full justify-center items-center mb-4">
            <FontAwesome name="hourglass-half" size={48} color="#fb923c" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Verificación en Proceso
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6">
            Tu cuenta está siendo verificada por nuestro equipo. 
            Este proceso puede tomar hasta 24 horas.
            </Text>
        </View>

        {/* Información del estado */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 w-full max-w-sm mb-8">
            <View className="flex-row items-center mb-4">
            <View className="w-3 h-3 bg-orange-500 rounded-full mr-3"></View>
            <Text className="text-sm font-medium text-gray-900">Estado actual</Text>
            </View>
            <Text className="text-lg font-semibold text-orange-600 mb-2">
            Pendiente de verificación
            </Text>
            <Text className="text-sm text-gray-500">
            Recibirás una notificación cuando tu cuenta sea activada.
            </Text>
        </View>

        {/* Acciones */}
        <View className="w-full max-w-sm space-y-4">
            <TouchableOpacity 
            className="bg-orange-500 py-4 rounded-xl shadow-sm"
            onPress={() => {/* Aquí puedes agregar función de contacto */}}
            >
            <Text className="text-white text-center font-semibold text-base">
                Contactar soporte
            </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
            className="py-4 rounded-xl border border-gray-300"
            onPress={logout}
            >
            <Text className="text-gray-700 text-center font-medium text-base">
                Cerrar sesión
            </Text>
            </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View className="absolute bottom-8 left-6 right-6">
            <Text className="text-xs text-gray-400 text-center">
            ServitecYA • {new Date().getFullYear()}
            </Text>
        </View>
        </View>
  );
}