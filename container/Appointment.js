import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  ListView,
  View,
  ToastAndroid,
  DatePickerAndroid,
  TimePickerAndroid
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import AppointmentRow from './../component/Appointment/AppointmentRow';
import moment from 'moment';
import { loadAppointmentAlarmsFromStorage, loadAppointment, removeOne, insertOrUpdateAppointmentAlarm } from './../reducers/appointment.reducer';
export class Appointment extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      data: [],
      dataSource: this.ds.cloneWithRows([]),
      fetching: false
    };
    this._setAlarm = this._setAlarm.bind(this);
    this._generateDataSource = this._generateDataSource.bind(this);
  }
  async _setAlarm(appointmentId, date, isActive){
    if (!isActive){
      this.props.removeOne(appointmentId);
    }
    else {
      try {
        // set date
        let pickDate = moment();
        let isSelectedDate = false;
        let appointment = this.props.appointments.filter(a => a.id == appointmentId).pop();
        const datePickerOptions = {
          maxDate: moment(date).toDate(), // appointment day
          minDate: moment().toDate(), // today
          date: moment().add(1,'minutes').toDate() // today
        };
        const {datePickerAction, year, month, day} = await DatePickerAndroid.open(datePickerOptions);
        if (datePickerAction === DatePickerAndroid.dismissedAction) {
          return;
        } else {
          pickDate = moment({year, month, day});
          isSelectedDate = true;
        }
        // set time if date is selected
        if (isSelectedDate){
          const appointmentPresetHour = moment().get('hours');
          const appointmentPresetMinute = moment().get('minutes');
          const {action, minute, hour} = await TimePickerAndroid.open({
            hour: appointmentPresetHour,
            minute: appointmentPresetMinute,
            is24Hour: true
          });
          if (action === TimePickerAndroid.timeSetAction) {
            console.log('set appointment time to',hour,minute);
            if (pickDate.set({hour, minute}).diff(moment(date)) < 0) {
              if (pickDate.diff(moment()) > 0 ){
                console.log('pick date time ', pickDate.format('YYYY/MM/DD HH:mm'));
                console.log('insert appointment id', appointmentId,',', moment(appointment.date).format('YYYY/MM/DD HH:mm'),',active:',isActive,', pick date:', pickDate.format('YYYY/MM/DD HH:mm'), ', user id',this.props.user.id);
                this.props.insertOrUpdateAppointmentAlarm(appointmentId, appointment.date,isActive, pickDate.toDate(), this.props.user.id);
              }
              else {
                ToastAndroid.show('Not allowed to set alarm before current time', ToastAndroid.LONG);
              }
            }
            else {
              console.log('invalid pick date time',pickDate.format('YYYY/MM/DD HH:mm'));
              ToastAndroid.show('Not allowed to set alarm after appointment time', ToastAndroid.LONG);
            }
          } else if (action === TimePickerAndroid.dismissedAction) {
            console.log('dismiss time select');
          }
        }
      } catch ({code, message}) {
        console.warn('select appointment alarm time error:', message);
      }
    }
  }
  _generateDataSource(){
    let appointments = [...this.props.appointments];
    let alarms = [...this.props.alarms];
    // sort latest
    appointments.sort((a, b) => moment(b.date).toDate() - moment(a.date).toDate());
    appointments = appointments.map(appointment => {
      const alarm = alarms.find(a => a.id === appointment.id);
      if (alarm) {
        appointment.alarmDateTime = alarm.date;
        appointment.isActive = alarm.isActive && moment().isBefore(moment(alarm.date)); //active and before alarm then true
      }
      else {
        appointment.isActive = false;
      }
      return appointment;
    });
    // bring today first
    let todayAppointment = [];
    appointments = appointments.filter(appointment => {
      if (moment().startOf('day').isSame(moment(appointment.date).startOf('day'))) {
        todayAppointment.push({...appointment});
        return false;
      }
      else {
        return true;
      }
    });
    return [...todayAppointment, ...appointments];
  }
  componentWillMount() {
    this.setState({fetching: true});
    this.props.loadAppointmentAlarmsFromStorage(this.props.user.id);
    this.props.loadAppointment(this.props.user.id);
    this.setState({ fetching: false });
  }
  render() {
    const listViewDataSource = this.ds.cloneWithRows(this._generateDataSource());
    if (this.state.fetching){
      return (
        <View style={ styles.container }>
          <Icon
            name="spinner"
            size={100}
            color={'#212121'}
            style={styles.icon}
            onPress={() => this._changeRoute('appointment')}
          />
        </View>
      );
    }
    return (
      <View style={ styles.container }>
        <ListView
          style={styles.listView}
          dataSource={listViewDataSource}
          renderRow={(rowData) => <AppointmentRow {...rowData} onSwitch={this._setAlarm} />}
          renderSeparator={(sectionId, rowId) => (<View key={`${sectionId}-${rowId}`} style={styles.separator} />)}
          enableEmptySections={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'white'
  },
  navigator: {
    flex: 1
  },
  separator: {
    height: 1,
    backgroundColor: '#8E8E8E',
  },
  listView: {
    flex: 1,
    alignSelf: 'stretch',
    marginBottom: 60
  },
  icon: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  }
});

const mapStateToProps = (state) => ({
  alarms: state.appointment.alarms,
  appointments: state.appointment.appointments,
  user: state.auth.user
});

const mapDispatchToProps = {
  insertOrUpdateAppointmentAlarm,
  loadAppointmentAlarmsFromStorage,
  loadAppointment,
  removeOne
};
Appointment.propTypes = {
  appointments: PropTypes.array.isRequired,
  alarms: PropTypes.array.isRequired,
  loadAppointmentAlarmsFromStorage: PropTypes.func.isRequired,
  loadAppointment: PropTypes.func.isRequired,
  removeOne: PropTypes.func.isRequired,
  insertOrUpdateAppointmentAlarm: PropTypes.func.isRequired
};
export default connect(mapStateToProps, mapDispatchToProps)(Appointment);
