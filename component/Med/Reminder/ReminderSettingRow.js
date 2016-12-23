import React, { PropTypes } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-material-design';
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
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionContainer: {
    alignItems: 'flex-end'
  },
  actionButton: {
    alignSelf: 'flex-end',
    marginTop: 10
  },
  text: {
    marginLeft: 12,
    fontSize: 16,
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
});

const ReminderSettingRow = (props) => (
  <View style={styles.containerColumn}>
    <View style={styles.containerRow}>
      <View style={styles.containerColumn}>
        <Text style={styles.text}>
         Period: {props.period}
        </Text>
        <Text style={styles.text}>
          Time: {props.time}
        </Text>
      </View>
    </View>
    <View style={[styles.containerRow, styles.actionContainer]}>
      <View style={styles.actionContainer}>
        <Button
          text="Reset"
          primary={'paperRed'}
          raised={true}
          styleDisabled={{ color: 'grey' }}
          onPress={() => props.onReset(props.id)  }
        />
      </View>
      <View style={styles.actionContainer}>
        <Button
          text="Set"
          primary={'paperCyan'}
          raised={true}
          style={styles.actionButton}
          styleDisabled={{ color: 'grey' }}
          onPress={() => props.onSet(props.id)  }
        />
      </View>
    </View>
  </View>
);

ReminderSettingRow.propTypes = {
  id: PropTypes.number.isRequired,
  period: PropTypes.string.isRequired,
  time: PropTypes.any.isRequired,
  onSet: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

export default ReminderSettingRow;
