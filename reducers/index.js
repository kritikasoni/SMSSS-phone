import { combineReducers } from 'redux';
import sceneReducer from './scene.reducer';
import appointmentReducer from './appointment.reducer';
import authReducer from './auth.reducer';
import medicineReducer from './medicine.reducer';

export const makeRootReducer = () => {
  return combineReducers({
    scene: sceneReducer,
    appointment: appointmentReducer,
    auth: authReducer,
    med: medicineReducer
  });
};

export default makeRootReducer;
