import React, {Component} from "react";
import {connect} from "react-redux";
import {Modal, View, Text, StyleSheet, Dimensions, ToastAndroid} from "react-native";
import {changeRoute} from "./../reducers/scene.reducer";
import Login from "./../container/Login";
import Storage from "./../util/Storage";
import EIcon from "react-native-vector-icons/EvilIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import MedReminderSetting from './Med/Reminder/ReminderSetting';
import { openMedReminderSetting } from './../reducers/medicine.reducer';
import FCM from 'react-native-fcm'

export class Setting extends Component {

  constructor(props) {
    super(props);
    this._logout = this._logout.bind(this);
    this._menus = this._menus.bind(this);
    this._showMedReminder = this._showMedReminder.bind(this);
  }

  async _logout() {
    try {
      // await clearAllAppointmentAlarms();
      await Storage.removeItem('token');
      await Storage.removeItem('user');
      this.props.changeRoute('login');
      this.props.closeSetting();
      this.props.navigator.push({
        title: 'Login',
        component: Login
      });
      FCM.cancelAllLocalNotifications();
    }
    catch (e) {
      console.error(e);
      ToastAndroid.show('Something wrong while logging out, please report this', ToastAndroid.LONG);
    }
  }
  _menus (){
    return (<View>
        <View style={styles.item}>
            <Ionicons
              name="md-log-out"
              size={40}
              style={[styles.icon,styles.logoutIcon]}
              onPress={this._logout}
            >
                <Text style={styles.itemText}>Logout</Text>
            </Ionicons>
        </View>
        <View style={styles.item}>
            <Ionicons
              name="md-clock"
              size={40}
              style={styles.icon}
              onPress={() => this.props.openMedReminderSetting() }
            >
                <Text style={styles.itemTextSmall}>Medicine Reminder setting</Text>
            </Ionicons>
        </View>
    </View>);
  }
  _showMedReminder () {
    return (<MedReminderSetting />);
  }

  render() {
    let view;
    if (this.props.showMedicineReminderSetting){
      view = this._showMedReminder();
    }
    else {
      view = this._menus();
    }
    return (
      <Modal
        animationType={"slide"}
        transparent={true}
        style={styles.container}
        visible={this.props.visible}
        onRequestClose={() => {}}
      >
          <View style={styles.modalBackgroundStyle}>
              <View style={styles.modalInner}>
                <EIcon
                  name="close-o"
                  size={55}
                  color={'#212121'}
                  style={styles.closeIcon}
                  onPress={this.props.closeSetting}
                />
                {view}
              </View>
          </View>
      </Modal>
    );
  }
}
let ScreenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#FFFFFF',
    flexDirection:'column',
    alignItems:'center',
    marginTop: 30
  },
  modalBackgroundStyle: {
    flex:1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection:'column',
    alignItems:'center',
  },
  modalInner: {
    borderRadius: 0.2,
    paddingTop: 0,
    paddingLeft: 50,
    paddingRight:50,
    backgroundColor: '#FFFFFF'
  },
  item: {
    flex:1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20
  },
  itemText: {
    fontSize: 30,
    margin: 5
  },
  itemTextSmall: {
    fontSize: 14,
    margin: 5,
    paddingBottom: 5
  },
  icon: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginRight: 10
  },
  closeIcon: {
    flex:1,
    marginRight: -50,
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  }
});
const mapStateToProps = (state) => ({
  showMedicineReminderSetting: state.med.showSetting
});
const mapDispatchToProps = {
  changeRoute,
  openMedReminderSetting
};

export default connect(mapStateToProps, mapDispatchToProps)(Setting);
