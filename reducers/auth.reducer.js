import Storage from './../util/Storage';
import { backendUrl } from './../config';
import Http from './../util/Http';
// ------------------------------------
// Constants
// ------------------------------------
export const LOAD_USER_FROM_STORAGE = 'LOAD_USER_FROM_STORAGE';
export const ERROR_LOAD_USER_FROM_STORAGE = 'ERROR_LOAD_USER_FROM_STORAGE';

export const SAVE_USER = 'SAVE_USER';
export const ERROR_SAVE_USER = 'ERROR_SAVE_USER';

export const UPDATE_DEVICE_TOKEN = 'UPDATE_DEVICE_TOKEN';
export const ERROR_UPDATE_DEVICE_TOKEN = 'ERROR_UPDATE_DEVICE_TOKEN';

// ------------------------------------
// Actions
// ------------------------------------
//
export function loadUserFromStorage() {
  return async (dispatch) => {
    try {
      let user = await Storage.getItem('user');
      user = JSON.parse(user);
      let token = await Storage.getItem('token');
      let deviceToken = await Storage.getItem('deviceToken');
      if (user && deviceToken) {
        await Http.put(`${backendUrl}/patients/${user.id}`, JSON.stringify({deviceToken}));
        console.log('update device token ', deviceToken);
      }
      dispatch({
        type: LOAD_USER_FROM_STORAGE,
        payload: { user: user || null, token: token || '', deviceToken: deviceToken || '' }
      });
    }
    catch (e) {
      console.error(e);
    }
  };
}
export function saveUser(user, token){
  return async (dispatch) => {
    try {
      await Storage.setItem('user', JSON.stringify({...user}));
      await Storage.setItem('token', token);
      dispatch({
        type: SAVE_USER,
        payload: { user, token}
      });
    }
    catch (e) {
      console.error(e);
      throw new Error('Cannot save credential to your phone, please check the app permission');
    }
  };
}

export function updateDeviceToken(deviceToken) {
  return async (dispatch, getState) => {
    try {
      const { user } = getState().auth;
      console.log('state',getState().auth);
      console.log('update device token',user,deviceToken);
      if (user && deviceToken) {
        await Http.put(`${backendUrl}/patients/${user.id}`, JSON.stringify({deviceToken}));
        dispatch({
          type: UPDATE_DEVICE_TOKEN,
          payload : deviceToken
        });
      }
    }
    catch (e) {
      console.error(e);
    }
  };
}
// ------------------------------------
// ------------------------------------
// Action Handlers
// ------------------------------------

const AUTH_ACTION_HANDLERS = {
  [SAVE_USER]: (state, action) => {
    return ({ ...state, user: Object.assign({},action.payload.user), token: action.payload.token });
  },
  [LOAD_USER_FROM_STORAGE]: (state, action) => {
    return ({ ...state, user: action.payload.user, token: action.payload.token, deviceToken: action.payload.deviceToken });
  },
  [UPDATE_DEVICE_TOKEN]: (state) => {
    return ({ ...state});
  }
};

// ------------------------------------
// Reducers
// ------------------------------------
const initialState = {
  user: null,
  token: '',
  deviceToken: ''
};
export default function authReducer(state = initialState, action) {
  const handler = AUTH_ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
