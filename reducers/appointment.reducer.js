import { ToastAndroid } from 'react-native';
import Storage from './../util/Storage';
import FCM from 'react-native-fcm';
import moment from 'moment';
import { backendUrl } from './../config';
import Http from './../util/Http';
// ------------------------------------
// Constants
// ------------------------------------
export const LOAD_APPOINTMENT_ALARMS_FROM_STORAGE = 'LOAD_APPOINTMENT_FROM_STORAGE';
export const INSERT_OR_UPDATE_APPOINTMENT_ALARM = 'INSERT_OR_UPDATE_APPOINTMENT_ALARM';
export const CLEAR_ALL_APPOINTMENT_ALARMS = 'CLEAR_ALL_APPOINTMENT_ALARMS';
export const REMOVE_ONE_APPOINTMENT = 'REMOVE_ONE_APPOINTMENT';

export const LOAD_APPOINTMENT = 'LOAD_APPOINTMENT';

// Utils

// ------------------------------------
// Actions
// ------------------------------------
//

export function getScheduleNotificationId(appointment) {
  if (appointment && appointment.id){
    //TODO: refactor this stupid id generator
    return `appointment${appointment.id}`;
  }
  else {
    throw new Error('cannot get schedule id of null or undefined');
  }
}

export function createNewAlarm(id, isActive, date) {
  return {id, isActive, date};
}
export function createNotification(scheduleNotificationId, sendAt, appointmentDateTime, appointmentId, userId) {
  if (!sendAt){
    throw new Error('must has sendAt');
  }
  return {
    fire_date: moment(sendAt).toDate().getTime(),
    id: scheduleNotificationId,    //REQUIRED! this is what you use to lookup and delete notification. In android notification with same ID will override each other
    title: 'You have an appointment!',
    body: `You have an appointment at ${moment(appointmentDateTime).format('YYYY/MM/DD HH:mm')}`,
    payload: {
      appointmentId: appointmentId,
      userId: userId,
      type: 'appointment'
    },
    count: 1,
    sound: 'thrown',
    priority: 'high',
    click_action: 'NOTIF',
    number: 10,
    icon: 'ic_launcher',
    vibrate: 300,
    group: 'appointment',
    show_in_foreground: true
  };
}
export function loadAppointmentAlarmsFromStorage(userId) {
  return async (dispatch) => {
    try {
      let appointmentAlarms = await Storage.getItem(`user${userId}:appointmentAlarms`);
      appointmentAlarms = JSON.parse(appointmentAlarms);
      if (appointmentAlarms && appointmentAlarms.length > 0){
        appointmentAlarms = appointmentAlarms
          .filter(alarm => alarm.isActive)
          .filter(alarm => moment().isBefore(moment(alarm.date)));
        const filteredAlarms = JSON.stringify([...appointmentAlarms]);
        await Storage.setItem(`user${userId}:appointmentAlarms`, filteredAlarms);

        dispatch({
          type: LOAD_APPOINTMENT_ALARMS_FROM_STORAGE,
          payload: appointmentAlarms
        });

      }
      else {
        dispatch({
          type: LOAD_APPOINTMENT_ALARMS_FROM_STORAGE,
          payload: []
        });
      }
    }
    catch (e) {
      console.log(e.message || e);
    }
  };
}

export function insertOrUpdateAppointmentAlarm(appointmentId, appointmentDate, isActive, alarmDateTime, userId) {
  return async (dispatch) => {
    try {
      const scheduleNotificationId = getScheduleNotificationId({id: appointmentId});
      const newAlarm = createNewAlarm(appointmentId, isActive, alarmDateTime);
      let alarms = await Storage.getItem(`user${userId}:appointmentAlarms`);
      alarms = JSON.parse(alarms);
      alarms = alarms ? alarms : [];
      let targetAppointmentAlarm = alarms.find(a => a.id === appointmentId);
      // if has alarm is storage, then update
      if (targetAppointmentAlarm) {
        alarms = alarms.map(a => {
          if (a.id === appointmentId) {
            return newAlarm;
          }
          return a;
        });
      }
      else {
        alarms.push(newAlarm);
      }
      await Storage.setItem(`user${userId}:appointmentAlarms`, JSON.stringify(alarms)); //save!
      if (isActive) {
        const notificationBody = createNotification(scheduleNotificationId, alarmDateTime, appointmentDate, appointmentId, userId);
        await FCM.scheduleLocalNotification(notificationBody);
        dispatch({
          type: INSERT_OR_UPDATE_APPOINTMENT_ALARM,
          payload: newAlarm
        });
      }
      else {
        await FCM.cancelLocalNotification(scheduleNotificationId);
        dispatch({
          type: INSERT_OR_UPDATE_APPOINTMENT_ALARM,
          payload: newAlarm
        });
      }
      dispatch({
        type: INSERT_OR_UPDATE_APPOINTMENT_ALARM,
        payload: newAlarm
      });
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}
export function removeOne(appointmentId) {
  return async (dispatch) => {
    try {
      let user = await Storage.getItem('user');
      user = JSON.parse(user);
      let alarms = await Storage.getItem(`user${user.id}:appointmentAlarms`);
      alarms = JSON.parse(alarms);
      let newAlarms = alarms.filter(a => a.id != appointmentId);
      await Storage.setItem(`user${user.id}:appointmentAlarms`, JSON.stringify(newAlarms));
      await FCM.cancelLocalNotification(getScheduleNotificationId({id: appointmentId}));
      dispatch({
        type: REMOVE_ONE_APPOINTMENT,
        payload: newAlarms
      });
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}
export function clearAllAppointmentAlarms() {
  return async (dispatch) => {
    try {
      let user = await Storage.getItem('user');
      user = JSON.parse(user);
      let alarms = await Storage.getItem(`user${user.id}:appointmentAlarms`);
      for (let alarm of alarms) {
        await FCM.cancelLocalNotification(getScheduleNotificationId(alarm));
      }
      dispatch({
        type: CLEAR_ALL_APPOINTMENT_ALARMS,
        payload: {}
      });
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}

export function loadAppointment(userId) {
  return async (dispatch) => {
    try {
      let appointments = await Http.get(`${backendUrl}/appointments/patient/${userId}`);
      dispatch({
        type: LOAD_APPOINTMENT,
        payload: [...appointments]
      });
    }
    catch (e) {
      ToastAndroid.show("Error loading appointments", ToastAndroid.SHORT);
      console.error(e.message || e);
    }
  };
}
// ------------------------------------
// ------------------------------------
// Action Handlers
// ------------------------------------

const APPOINTMENT_ACTION_HANDLERS = {
  [LOAD_APPOINTMENT_ALARMS_FROM_STORAGE]: (state, action) => {
    return ({...state, alarms: [...action.payload]});
  },
  [INSERT_OR_UPDATE_APPOINTMENT_ALARM]: (state, action) => {
    let alarms = [...state.alarms]; // copy alarms state
    const oldAlarm = state.alarms.find(alarm => alarm.id === action.payload.id);
    if (oldAlarm) { // if has old, then remove it from state
      alarms = alarms.filter(alarm => alarm.id !== action.payload.id);
    }
    const newAlarm = action.payload;
    return ({ ...state, alarms: [...alarms, newAlarm]});
  },
  [CLEAR_ALL_APPOINTMENT_ALARMS]: (state) => {
    return ({...state, alarms: [] });
  },
  [REMOVE_ONE_APPOINTMENT]: (state, action) => {
    return ({...state, alarms: [...action.payload] });
  },
  [LOAD_APPOINTMENT]: (state, action) => {
    return ({...state, appointments: [...action.payload]});
  }
};

// ------------------------------------
// Reducers
// ------------------------------------
const initialState = {
  alarms: [],
  appointments: []
};
export default function appointmentReducer(state = initialState, action) {
  const handler = APPOINTMENT_ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
