import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";

const CustomPicker = ({
  services,
  selectedServiceId,
  setSelectedServiceId,
  selectedServiceName,
  setSelectedServiceName,
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (service) => {
    setSelectedServiceId(service.id);
    setSelectedServiceName(service.name);
    setVisible(false);
  };

  const displayText =
    selectedServiceName && selectedServiceName.length > 0
      ? selectedServiceName
      : "Selecciona un servicio";

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.inputField}
      >
        <Text style={{ color: selectedServiceName ? "#000" : "#888" }}>
          {displayText}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            
            {/* SCROLL para soportar 15+ opciones */}
            <ScrollView style={{ maxHeight: 300 }}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => handleSelect(service)}
                >
                  <Text style={styles.option}>{service.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Cancelar */}
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={[styles.option, { color: "red" }]}>Cancelar</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputField: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  option: {
    padding: 15,
    fontSize: 18,
    textAlign: "center",
  },
});

export default CustomPicker;
