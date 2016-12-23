import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
//ref https://medium.com/differential/react-native-basics-how-to-use-the-listview-component-a0ec44cf1fe8#.4760pzttm
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0097A7',
  },
  input: {
    height: 30,
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});

const QueueHeader = (props) => (
  <View style={styles.container}>
    <Text>Queue List</Text>
  </View>
);

export default QueueHeader;