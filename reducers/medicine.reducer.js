import FCM from 'react-native-fcm';
import moment from 'moment';
import Storage from './../util/Storage';
import { defaultTimeToTake, tttParse } from './../util/TimeToTakeParser';
import { backendUrl } from './../config';
import Http from './../util/Http';
// ------------------------------------
// Constants
// ------------------------------------


export const LOAD_PRESCRIPTIONS = 'LOAD_PRESCRIPTIONS';

export const LOAD_MED_USAGE_FROM_STORAGE = 'LOAD_MED_USAGE_FROM_STORAGE ';
export const ALREADY_TAKEN_MED = 'ALREADY_TAKEN_MED';
export const STOP_TAKING_MED = 'STOP_TAKING_MED';

export const LOAD_TIME_TO_TAKE = 'LOAD_TIME_TO_TAKE';
export const CLEAR_ALL_MED_REMINDERS = 'CLEAR_ALL_MED_REMINDERS';
export const LOAD_MED_REMINDERS_FROM_STORAGE = 'LOAD_MED_REMINDERS_FROM_STORAGE';

export const OPEN_MED_REMINDER_SETTING = 'OPEN_MED_REMINDER_SETTING';
export const CLOSE_MED_REMINDER_SETTING = 'CLOSE_MED_REMINDER_SETTING';
export const RESET_MED_REMINDER_SETTING = 'RESET_MED_REMINDER_SETTING';
export const SET_MED_REMINDER_SETTING = 'SET_MED_REMINDER_SETTING';

export const SET_MED_REMINDER = 'SET_MED_REMINDER';
export const REMOVE_MED_REMINDER = 'REMOVE_MED_REMINDER';
export const RESCHEDULE_MED_REMINDERS_NOTIFICATION = 'RESCHEDULE_MED_REMINDERS_NOTIFICATION';

export const LOAD_MED_PRES = 'LOAD_MED_PRES';
export const UPDATE_MED_PRES = 'UPDATE_MED_PRES';
// Utils

// ------------------------------------
// Actions
// ------------------------------------
//

export function getScheduleNotificationId(timeToTakeId) {
  if (timeToTakeId){
    //TODO: refactor this stupid id generator
    return `timeToTake${timeToTakeId}`;
  }
  else {
    throw new Error('cannot get schedule id of null or undefined');
  }
}

export function createNewReminder(id, date) {
  return {id: id, date};
}
export function createNotification(scheduleNotificationId, sendAt, takingPeriod, reminderId, userId, count) {
  if (!sendAt){
    throw new Error('must has sendAt');
  }
  return {
    fire_date: moment(sendAt).toDate().getTime(),
    id: scheduleNotificationId,    //REQUIRED! this is what you use to lookup and delete notification. In android notification with same ID will override each other
    title: 'You have medicine(s) to take!',
    body: `You have to take medicine(s) at ${takingPeriod}`,
    payload: {
      reminderId: reminderId,
      userId: userId,
      type: 'med'
    },
    count: Math.ceil(count),
    repeat_interval: 'day',
    sound: 'thrown',
    priority: 'high',
    click_action: 'NOTIF',
    number: 10,
    icon: 'ic_launcher',
    vibrate: 300,
    group: 'med',
    show_in_foreground: true
  };
}
export function loadPrescriptions(userId) {
  return async (dispatch) => {
    try {
      const result = await Http.get(`${backendUrl}/prescriptions/patient/${userId}`);
      dispatch({
        type: LOAD_PRESCRIPTIONS,
        payload: result
      });
    }
    catch (e) {
      console.error(e);
    }
  };
}
export function loadTimeToTake(userId) {
  return async (dispatch) => {
    try {
      let timeToTake = await Storage.getItem(`user${userId}:timeToTake`);
      timeToTake = JSON.parse(timeToTake);
      if (timeToTake && timeToTake.length){
        const overrideTimeToTake = defaultTimeToTake.map(ttt => {
          const userSetting = timeToTake.find(setting => setting.id === ttt.id);
          return userSetting ? userSetting : ttt;
        });
        dispatch({
          type: LOAD_TIME_TO_TAKE,
          payload: overrideTimeToTake
        });
      }
      else {
        dispatch({
          type: LOAD_TIME_TO_TAKE,
          payload: defaultTimeToTake
        });
      }
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}
export function loadMedRemindersFromStorage(userId) {
  return async (dispatch) => {
    try {
      let medReminders = await Storage.getItem(`user${userId}:medReminders`);
      medReminders = JSON.parse(medReminders);
      if (medReminders && medReminders.length > 0){
        dispatch({
          type: LOAD_MED_REMINDERS_FROM_STORAGE,
          payload: medReminders
        });
      }
      else {
        dispatch({
          type: LOAD_MED_REMINDERS_FROM_STORAGE,
          payload: []
        });
      }
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}

export function loadMedPres(userId) {
  return async (dispatch) => {
    try {
      // load prescription
      const prescriptions = await Http.get(`${backendUrl}/prescriptions/patient/${userId}`);
      dispatch({
        type: LOAD_PRESCRIPTIONS,
        payload: prescriptions
      });
      // load time to take
      let timeToTake = await Storage.getItem(`user${userId}:timeToTake`);
      timeToTake = JSON.parse(timeToTake);
      let overrideTimeToTake = [...defaultTimeToTake];
      if (timeToTake && timeToTake.length){
        overrideTimeToTake = await defaultTimeToTake.map(ttt => {
          const userSetting = timeToTake.find(setting => setting.id === ttt.id);
          return userSetting ? userSetting : ttt;
        });
        dispatch({
          type: LOAD_TIME_TO_TAKE,
          payload: overrideTimeToTake
        });
      }
      else {
        dispatch({
          type: LOAD_TIME_TO_TAKE,
          payload: overrideTimeToTake
        });
      }

      // load medicine usage
      let medicineUsage = await Storage.getItem(`user${userId}:medicineUsage`);
      medicineUsage = JSON.parse(medicineUsage);
      medicineUsage = medicineUsage ? medicineUsage : [];
      dispatch({
        type: LOAD_MED_USAGE_FROM_STORAGE,
        payload: medicineUsage
      });
      // processing med pres
      let medPres = [];
      prescriptions.forEach(prescription => {
        prescription.medicinePrescription = prescription.medicinePrescription.map(element => {
          let targetMedicineUsage = medicineUsage.find(med => med.id === element.id);
          element.used = targetMedicineUsage ? targetMedicineUsage.used : 0;
          element.createdAt = moment(prescription.createdAt).format('YYYY/MM/DD');
          element.amountLeft = targetMedicineUsage ? (element.amount - targetMedicineUsage.used) : element.amount;
          return element;
        });
        medPres = [...medPres, ...prescription.medicinePrescription];
      });
      medPres = medPres.filter(mp => mp.used < mp.amount).filter(mp => mp.isTaking);
      console.log('call reschedule');
      _rescheduleMedPres(medPres, overrideTimeToTake, userId, dispatch);
      dispatch({
        type: LOAD_MED_PRES,
        payload: medPres
      });
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}

export function loadMedUsageFromStorage(userId) {
  return async (dispatch) => {
    try {
      let medicineUsage = await Storage.getItem(`user${userId}:medicineUsage`);
      medicineUsage = JSON.parse(medicineUsage);
      medicineUsage = medicineUsage ? medicineUsage : [];
      dispatch({
        type: LOAD_MED_USAGE_FROM_STORAGE,
        payload: medicineUsage
      });
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}

export function stopTakingMed(id) {
  return async (dispatch) => {
    try {
      const requestBody = JSON.stringify({isTaking: false });
      const result = await Http.put(`${backendUrl}/medicinePrescriptions/${id}`, requestBody);
      dispatch({
        type: STOP_TAKING_MED,
        payload: { id }
      });
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}

export function alreadyTakenMed(userId, id, dosage) {
  return async (dispatch) => {
    try {
      const savePath = `user${userId}:medicineUsage`;
      let medicineUsage = await Storage.getItem(savePath);
      medicineUsage = JSON.parse(medicineUsage);
      medicineUsage = medicineUsage || [];
      //update & save
      let targetMedicine = medicineUsage.find(med => med.id === id);
      if (targetMedicine) {
        targetMedicine.used += dosage;
        medicineUsage = medicineUsage.map(medUsage => {
          if (medUsage.id === id) {
            return targetMedicine;
          }
          else {
            return medUsage;
          }
        });
      }
      else {
        targetMedicine = {id: id, used: dosage};
        medicineUsage.push(targetMedicine);
      }
      medicineUsage = JSON.stringify(medicineUsage);
      await Storage.setItem(savePath, medicineUsage);
      dispatch({
        type: ALREADY_TAKEN_MED,
        payload: targetMedicine
      });
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}
export function openMedReminderSetting() {
  return (dispatch) => {
    dispatch({
      type: OPEN_MED_REMINDER_SETTING
    });
  };
}
export function closeMedReminderSetting() {
  return (dispatch) => {
    dispatch({
      type: CLOSE_MED_REMINDER_SETTING
    });
  };
}
export function resetMedReminderSetting(id, userId) {
  return async (dispatch) => {
    try {
      const targetSetting = defaultTimeToTake.find(ttt => ttt.id === id);
      if (targetSetting) {
        let timeToTake = await Storage.getItem(`user${userId}:timeToTake`);
        timeToTake = JSON.parse(timeToTake) || [];
        let newTimeToTake = [...timeToTake].filter(ttt => ttt.id !== id);
        console.log('going to save newTimeToTake', newTimeToTake);
        let saved = await Storage.setItem(`user${userId}:timeToTake`, JSON.stringify(newTimeToTake));
        dispatch({
          type: RESET_MED_REMINDER_SETTING,
          payload: {...targetSetting}
        });
        console.log('reset medicine reminder success', saved);
        loadMedPres(userId)(dispatch);
      }
      else {
        console.error('resetMedReminderSetting error: id not found');
      }
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}
export function setMedReminderSetting({id, time}) {
  return async (dispatch, getState) => {
    const user = getState().auth.user;
    const targetSetting = defaultTimeToTake.find(ttt => ttt.id === id);
    if (targetSetting) {
      try {
        let timeToTake = await Storage.getItem(`user${user.id}:timeToTake`);
        timeToTake = JSON.parse(timeToTake) || [];
        let newTimeToTake = [...timeToTake];
        if (newTimeToTake.length === 0){
          newTimeToTake.push({...targetSetting, time});
        }
        else {
          if (timeToTake.find(old => old.id === id)){
            newTimeToTake = newTimeToTake.map(ttt => ttt.id === id ? {...targetSetting, time} : ttt);
          }
          else {
            newTimeToTake.push({...targetSetting, time});
          }
        }
        console.log('going to save newTimeToTake', newTimeToTake);
        let saved = await Storage.setItem(`user${user.id}:timeToTake`, JSON.stringify(newTimeToTake));

        dispatch({
          type: SET_MED_REMINDER_SETTING,
          payload: {id, time}
        });
        console.log('set medicine reminder success', saved);
        loadMedPres(user.id)(dispatch);
      }
      catch (e) {
        console.error(e.message || e);
      }
    }
    else {
      console.error('setMedReminderSetting error: id not found');
    }
  };
}

export function setMedReiminders(reminders) {
  return async (dispatch, getState) => {
    const user = getState().auth.user;
    //TODO: remove fixed count
    const count = 1;
    try {
      for (let ttt of defaultTimeToTake){
        const notificationId = getScheduleNotificationId(ttt.id);
        const reminder = reminders.find(r => r.id === ttt.id);
          if (reminder){ // if no notification and reminder are set, then create notification
            const sendAt = moment().hour(ttt.time.split(':')[0]).minute(ttt.time.split(':')[1]);
            const notificationBody = createNotification(notificationId, sendAt, ttt.period, ttt.id, user.id, count);
            await FCM.scheduleLocalNotification(notificationBody);
          }
      }
      dispatch({
        type: SET_MED_REMINDER,
        payload: {}
      });
    }
    catch (e) {
      console.error(e.message || e);
    }
  };
}
function _rescheduleMedPres(medPres, timeToTake, userId, dispatch) {
  medPres.forEach(e => {
    const ttt = tttParse(e.timeToTake, timeToTake);
    console.log('reschedule',ttt);
    for (let t of ttt) {
      const notificationId = getScheduleNotificationId(t.id);
      let sendAt = moment().hour(t.time.split(':')[0]).minute(t.time.split(':')[1]).second(0);
      if (moment().isAfter(sendAt)){
        sendAt = sendAt.add(1,'days');
      }
      const notificationBody = createNotification(notificationId, sendAt, t.time, t.id, userId, e.amountLeft / (e.dosage * ttt.length));
      FCM.scheduleLocalNotification(notificationBody);
      FCM.getScheduledLocalNotifications().then(notif=>{
        console.log('schedule notification',notif);
        console.log('schedule notification body', notificationBody);
      });
    }
  });
  dispatch({
    type: RESCHEDULE_MED_REMINDERS_NOTIFICATION,
    payload: {}
  });
}
export function updateMedPres() {
  return (dispatch, getState) => {
    const { prescriptions, medUsage, timeToTakes } = getState().med;
    const { user } = getState().auth;
    let medPres = [];
    prescriptions.forEach(prescription => {
      prescription.medicinePrescription = prescription.medicinePrescription.map(element => {
        let targetMedicineUsage = medUsage.find(med => med.id === element.id);
        element.used = targetMedicineUsage ? targetMedicineUsage.used : 0;
        element.createdAt = moment(prescription.createdAt).format('YYYY/MM/DD');
        element.amountLeft = targetMedicineUsage ? (element.amount - targetMedicineUsage.used) : element.amount;
        element.count = element.amountLeft / element.dosage;
        return element;
      });
      medPres = [...medPres, ...prescription.medicinePrescription];
    });
    medPres = medPres.filter(mp => mp.used < mp.amount).filter(mp => mp.isTaking);
    _rescheduleMedPres(medPres, timeToTakes, user.id, dispatch);
    dispatch({
      type: UPDATE_MED_PRES,
      payload: {}
    });
  };
}
// ------------------------------------
// ------------------------------------
// Action Handlers
// ------------------------------------

const MEDICINE_ACTION_HANDLER = {
  [LOAD_PRESCRIPTIONS]: (state, action) => {
    return ({...state, prescriptions: [...action.payload]});
  },
  [LOAD_MED_REMINDERS_FROM_STORAGE]: (state, action) => {
    return ({...state, reminders: [...action.payload]});
  },
  [STOP_TAKING_MED] : (state, action) => {
    const prescriptions = [...state.prescriptions].map(prescription => {
      prescription.medicinePrescription = [...prescription.medicinePrescription].map(medPres => {
        if (medPres.id === action.id){
          medPres.isTaking = false;
          return medPres;
        }
        else {
          return medPres;
        }
      });
      return prescription;
    });
    return ({...state, prescriptions });
  },
  [ALREADY_TAKEN_MED] : (state, action) => {
    const targetMed = [...state.medUsage].find(medUsage => medUsage.id === action.payload.id);
    let newMedUsage = [...state.medUsage];
    if (targetMed){
      newMedUsage = [...state.medUsage].map(medUsage => medUsage.id === action.payload.id ? action.payload : medUsage);
      return ({...state, medUsage: newMedUsage });
    }
    else {
      newMedUsage.push({...action.payload});
      return ({...state, medUsage: newMedUsage });
    }
  },
  [LOAD_TIME_TO_TAKE]: (state, action) => {
    return ({...state, timeToTakes: [...action.payload] });
  },
  [LOAD_MED_USAGE_FROM_STORAGE]: (state, action) => {
    return ({...state, medUsage: [...action.payload] });
  },
  [OPEN_MED_REMINDER_SETTING]: (state) => {
    return ({...state, showSetting: true });
  },
  [CLOSE_MED_REMINDER_SETTING]: (state) => {
    return ({...state, showSetting: false });
  },
  [RESET_MED_REMINDER_SETTING]: (state, action) => {
    const newTimeToTakesList = state.timeToTakes.filter(ttt => ttt.id !== action.payload.id);
    return ({...state, timeToTakes: [...newTimeToTakesList, action.payload ]});
  },
  [SET_MED_REMINDER_SETTING]: (state, action) => {
    const oldTimeToTake = state.timeToTakes.find(ttt => ttt.id === action.payload.id);
    const newTimeToTakesList = state.timeToTakes.filter(ttt => ttt.id !== action.payload.id);
    return ({...state, timeToTakes: [...newTimeToTakesList, {...oldTimeToTake, ...action.payload } ]});
  },
  [UPDATE_MED_PRES]: (state, action) => {
    return ({...state});
  }
};

// ------------------------------------
// Reducers
// ------------------------------------
const initialState = {
  timeToTakes: [...defaultTimeToTake],
  reminders: [],
  prescriptions: [],
  medUsage: [],
  showSetting: false,
  medPres: []
};
export default function medicineReducer(state = initialState, action) {
  const handler = MEDICINE_ACTION_HANDLER[action.type];

  return handler ? handler(state, action) : state;
}
