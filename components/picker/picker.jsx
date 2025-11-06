import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, StyleSheet, Button } from 'react-native';
// Asegúrate de usar la versión de la comunidad:
import { Picker } from '@react-native-picker/picker'; 

// ... tus datos services

const CustomPicker = ({ services, selectedServiceId, setSelectedServiceId, selectedServiceName, setSelectedServiceName }) => {

    const [isModalVisible, setModalVisible] = useState(false);
    const [tempServiceId, setTempServiceId] = useState(selectedServiceId);

    const handleConfirm = () => {
        setSelectedServiceId(tempServiceId);
        const service = services.find(s => s.id === tempServiceId);
        setSelectedServiceName(service ? service.name : "");
        setModalVisible(false);
    };

    const handleCancel = () => {
        setTempServiceId(selectedServiceId); 
        setModalVisible(false);
    };

    if (Platform.OS === 'ios') {
        const displayText = selectedServiceName || "Selecciona un servicio";

        return (
            <View>
                <TouchableOpacity 
                    onPress={() => setModalVisible(true)}
                    style={styles.inputField}
                >
                    <Text style={{ color: selectedServiceName ? '#000' : '#888' }}>
                        {displayText}
                    </Text>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={handleCancel}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.toolbar}>
                                <Button title="Cancelar" onPress={handleCancel} />
                                <Button title="Aceptar" onPress={handleConfirm} />
                            </View>
                            
                            <Picker
                                selectedValue={tempServiceId}
                                onValueChange={(itemValue) => setTempServiceId(itemValue)}
                            >
                                <Picker.Item label="Selecciona un servicio" value={null} />
                                {services.map((service) => (
                                    <Picker.Item 
                                        key={service.id} 
                                        label={service.name} 
                                        value={service.id} 
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // Android directo
    return (
        <View className="border border-gray-300 rounded-lg bg-white h-12 justify-center text-gray-100">  
            <Picker
                selectedValue={selectedServiceId}
                onValueChange={(itemValue) => {
                    setSelectedServiceId(itemValue);
                    const service = services.find(s => s.id === itemValue);
                    setSelectedServiceName(service ? service.name : "");
                }}
            >
                <Picker.Item label="Selecciona un servicio" value={null} />
                {services.map((service) => (
                    <Picker.Item  key={service.id} label={service.name} value={service.id} />
                ))}
            </Picker>
        </View>
    );
};


// ----------------------------------------------------------------------
// ESTILOS
// ----------------------------------------------------------------------

const styles = StyleSheet.create({
    inputField: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // Pega el modal al fondo
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Espacio inferior para iOS
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f9f9f9',
    }
});

export default CustomPicker;