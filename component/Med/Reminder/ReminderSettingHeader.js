import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
//ref https://medium.com/differential/react-native-basics-how-to-use-the-listview-component-a0ec44cf1fe8#.4760pzttm
const styles = StyleSheet.create({
  header: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 35
  }
});

const MedHeader = (props) => (
  <Text style={styles.header}>Time to take Setting</Text>
);

export default MedHeader;