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

const MedRow = (props) => (
  <View style={styles.containerColumn}>
    <View style={styles.containerRow}>
      <Image source={{ uri: props.medicine.image}} style={styles.image} />
      <View style={styles.containerColumn}>
        <Text style={styles.text}>
          Scientific name: {props.medicine.scientificName}
        </Text>
        <Text style={styles.text}>
          Informal name: {props.medicine.informalName}
        </Text>
        <Text style={styles.text}>
          Date: {props.createdAt}
        </Text>
        <Text style={styles.text}>
          Initial amount: {props.amount}
        </Text>
        <Text style={styles.text}>
          Amount left: {props.amountLeft}
        </Text>
        <Text style={styles.text}>
          Dosage: {props.dosage}
        </Text>
        <Text style={styles.text}>
          Time to take:
          {props.timeToTake.period}
        </Text>
        <Text style={styles.text}>
          Remark:
          {props.remark ? props.remark : ' -' }
        </Text>
      </View>
    </View>
    <View style={[styles.containerRow, styles.actionContainer]}>
      <View style={styles.actionContainer}>
        <Button
          text="Stop taking"
          primary={'paperRed'}
          raised={true}
          styleDisabled={{ color: 'grey' }}
          onPress={() => props.stopTaking(props.id)  }
          disabled={props.fetching} />
      </View>
      <View style={styles.actionContainer}>
        <Button
          text="Already taken"
          primary={'paperCyan'}
          raised={true}
          style={styles.actionButton}
          styleDisabled={{ color: 'grey' }}
          onPress={() => props.alreadyTake(props.id, props.dosage)  }
          disabled={props.fetching} />
      </View>
    </View>
  </View>
);
MedRow.propTypes = {
  id: PropTypes.number.isRequired,
  medicine: PropTypes.shape({
    image: PropTypes.string,
    informalName: PropTypes.string,
    scientificName: PropTypes.string
  }),
  createdAt: PropTypes.string,
  amount: PropTypes.number,
  dosage: PropTypes.number,
  fetching: PropTypes.bool,
  alreadyTake: PropTypes.func.isRequired,
  stopTaking: PropTypes.func.isRequired,
  used: PropTypes.number,
  amountLeft: PropTypes.number,
  timeToTake: PropTypes.object.isRequired,
  remark: PropTypes.string
};

export default MedRow;
