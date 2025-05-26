// components/CustomDropdown.js
import React, { useState } from 'react';
import {
  Modal,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomDropdown = ({ label, data, selected, onSelect }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setVisible(true)}>
        <Text style={{ color: selected ? '#000' : '#aaa' }}>
          {selected ?? label}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
          activeOpacity={1}>
          <View style={styles.dropdown}>
            <FlatList
              data={data}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000040',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 300,
    paddingVertical: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
