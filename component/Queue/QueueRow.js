import React, { PropTypes } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
//reference https://medium.com/differential/react-native-basics-how-to-use-the-listview-component-a0ec44cf1fe8#.2oklr52wg
const styles = StyleSheet.create({
  containerColumn: {
    flex: 1,
    padding: 2,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  containerRow: {
    flex: 1,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  text: {
    marginLeft: 10,
    fontSize: 12,
  },
  highlight: {
    backgroundColor: '#FFFF8B'
  }
});

const QueueRow = (props) => {
  const shouldHighLight = props.userQueueId === props.id ? styles.highlight : null;
  console.log('queueId', props.userQueueId, 'userId', props.id);
  return (
    <View style={[styles.containerColumn, shouldHighLight]}>
      <View style={styles.containerRow}>
        <Text style={styles.text}>
          Queue ID: {props.id}
        </Text>
      </View>
      <View style={styles.containerRow}>
        <Text style={styles.text}>
          Status: {props.status}
        </Text>
      </View>
    </View>
  );
};
QueueRow.propTypes = {
  id: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  userQueueId: PropTypes.number.isRequired
};

export default QueueRow;
