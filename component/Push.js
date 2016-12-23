import React, { Component, PropTypes, DeviceEventEmitter, AppState  } from 'react';
import { connect } from 'react-redux';
import { ToastAndroid } from 'react-native';
import FCM from 'react-native-fcm';
import Storage from './../util/Storage';
import moment from 'moment';
const _ = require('underscore');
import { updateDeviceToken } from './../reducers/auth.reducer';
import { removeOne, loadAppointmentAlarmsFromStorage } from './../reducers/appointment.reducer';
export class Push extends Component {
  constructor(props) {
    super(props);
    this.showUpdate = _.debounce(this.showUpdate,1000);
    this._handleNotification = this._handleNotification.bind(this);
    this.sendRemote = this.sendRemote.bind(this);
  }
  componentDidMount() {
    console.log('Push');
    FCM.getFCMToken().then(deviceToken => {
      console.log('deviceToken:',deviceToken);
      try {
        Storage.setItem('deviceToken', deviceToken);
      } catch (err) {
        console.error(err);
        throw new Error('Cannot save deviceToken to your phone, please check the app permission');
      }
    });
    this.notificationUnsubscribe = FCM.on('notification', (notif) => {
      console.log('listen notification',notif);
        if (notif && notif.local){
          console.log('notification local');
          console.log('notif',notif);
          return;
        }
        // this.sendRemote(notif);
      // }
    });
    this.refreshUnsubscribe = FCM.on('refreshToken', (token) => {
      console.log('refreshToken',token);
      // fcm token may not be available on first load, catch it here
      try {
        Storage.setItem('deviceToken', token);
      } catch (err) {
        console.error(err);
        throw new Error('Cannot save deviceToken to your phone, please check the app permission');
      }
    });
  }

  _handleNotification(e){
    console.log('notification pressed',e.payload);
    const { userId, type } = e.payload;
    switch (type) {
      case 'appointment':
        this.props.loadAppointmentAlarmsFromStorage(userId);
        break;
      case 'medReminder':
        break;
      default:
        console.error('cannot find appropriate handle for notification');
    }
  }

  showUpdate (notif) {
    ToastAndroid.show('Appointment notification', ToastAndroid.SHORT);
  }
  sendRemote(notif) {
    FCM.presentLocalNotification({
      title: notif.title,
      body: notif.body,
      priority: 'high',
      click_action: notif.click_action,
      show_in_foreground: true,
      local: true
    });
  }
  componentWillUnmount() {
    console.log('unmount Push');
    this.refreshUnsubscribe();
    this.notificationUnsubscribe();
  }
  render(){
    return null;
  }
}

Push.propTypes = {
  removeOne: PropTypes.func.isRequired,
  loadAppointmentAlarmsFromStorage: PropTypes.func.isRequired,
  user: PropTypes.any
};
const mapStateToProps = (state) => ({
  user: state.auth.user
});
const mapDispatchToProps = {
  removeOne,
  loadAppointmentAlarmsFromStorage
};

export default connect(mapStateToProps, mapDispatchToProps)(Push);
