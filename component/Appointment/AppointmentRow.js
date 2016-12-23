import React, { PropTypes } from 'react';
import { View, Text, StyleSheet, Image, Switch } from 'react-native';
import { Button } from 'react-native-material-design';
import moment from 'moment';
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
    marginTop: 5,
    marginLeft: 12,
    fontSize: 16,
  },
  textDate: {
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 15
  },
  subdue: {
    fontWeight: '200',
    fontSize: 12,
    marginTop: 15,
    marginLeft: 12
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 20
  },
  appointmentIsPassed: {
    backgroundColor: '#C0BFBF'
  },
  appointmentIsNotPassed: {
    backgroundColor: '#0097A7'
  },
  appointmentIsToday: {
    backgroundColor: '#76FD76'
  },
  switch: {
    alignSelf: 'flex-end',
    marginRight: 10
  }
});

const AppointmentRow = (props) => {
  const isFutureOrToday = moment().diff(moment(props.date),'minutes') <= 0;
  const isToday =  moment().startOf('day').isSame(moment(props.date).startOf('day'));
  let dayFromNow = null;
  if (isFutureOrToday){
    if (isToday){
      dayFromNow = (
        <Text>
          Today you have an appointment
        </Text>
      );
    }
    else {
      dayFromNow = (
        <Text style={styles.text}>
          { -moment().diff(moment(props.date),'days')} day from now
        </Text>
      );
    }
  } // passed
  else {
    dayFromNow = (
      <Text style={styles.text}>
        Appointment is passed
      </Text>
    );
  }
  const shouldShowAlarmDateTime = (isFutureOrToday && (!!props.alarmDateTime && props.isActive));
  const alarmDateTime = shouldShowAlarmDateTime ?
    (<Text style={[styles.text,styles.subdue]}>
      Alarm date time: {moment(props.alarmDateTime).format('YYYY/MM/DD HH:mm')}
    </Text>) : null;
  const appointmentColor = !isFutureOrToday ? styles.appointmentIsPassed : isToday ? styles.appointmentIsToday : styles.appointmentIsNotPassed ;
  return (
    <View style={styles.containerColumn}>
      <View style={styles.containerRow}>
        <View style={styles.containerColumn}>
          <View style={[styles.statusDot, appointmentColor]} />
          <Text style={styles.textDate}>
            Date: {moment(props.date).format('YYYY/MM/DD HH:mm')}
          </Text>
        </View>
        <View style={styles.containerColumn}>
          {
            isFutureOrToday ?
              (<Switch value={props.isActive} onValueChange={(value) => props.onSwitch(props.id, props.date, value)} style={styles.switch}/>)
              :
              null
          }
        </View>
      </View>
      <View style={styles.containerRow}>
        { alarmDateTime }
      </View>
      <View style={styles.containerRow}>
        { dayFromNow }
      </View>
    </View>
  );
};
AppointmentRow.propTypes = {
  id: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onSwitch: PropTypes.func.isRequired,
  alarmDateTime: PropTypes.any
};

export default AppointmentRow;
