import React, { Component, PropTypes } from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  ToastAndroid,
  StyleSheet
} from 'react-native';
import { connect } from 'react-redux';
import { Button } from 'react-native-material-design';
import { changeRoute } from './../reducers/scene.reducer';
import { saveUser, loadUserFromStorage, updateDeviceToken } from './../reducers/auth.reducer';
import { loadMedRemindersFromStorage, loadTimeToTake } from './../reducers/medicine.reducer';
import Queue from './Queue';
import { backendUrl } from './../config';
import Http from './../util/Http';
import Storage from './../util/Storage';
// import { loadAppointmentAlarmsFromStorage } from '../util/AppointmentNotificationUtils';

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    };
    this._navigate = this._navigate.bind(this);
    this._login = this._login.bind(this);
  }

  componentWillMount() {
    this.props.loadUserFromStorage();
    const { user } = this.props;
    this.setState({email: user ? user.email : ''});
  }
  componentWillReceiveProps (nextState) {
    try {
      const { user, token } = nextState;
      if (token && user) {
        this.props.loadMedRemindersFromStorage(user.id);
        this.props.loadTimeToTake(user.id);
        this._navigate();
      }
    }
    catch (error) {
      console.error(error);
      ToastAndroid.show('Your phone storage has something wrong, please check app permission', ToastAndroid.SHORT);
    }
  }

  _navigate(type = 'Normal') {
    this.props.changeRoute('queue', 'Queue');
    this.props.navigator.push({
      component: Queue,
      type: type,
      title: 'Queue'
    });
  }
  async _login() {
    const self = this;
    this.setState({ fetching: true });
    try {
      let response = await fetch(`${backendUrl}/authentication/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: self.state.email,
          password: self.state.password
        })
      });
      if (response.ok){
        response = await response.json();
        const deviceToken = await Storage.getItem('deviceToken');
        if (deviceToken && response.user){
          try {
            await Http.put(`${backendUrl}/patients/${response.user.id}`, JSON.stringify({deviceToken}));
            console.log('update device token ', deviceToken);
          }
          catch (err){
            ToastAndroid.show('cannot update device token, you might not receive notification. Please allow storage permission', ToastAndroid.LONG);
          }
        }
        this.props.saveUser(response.user, response.token);
      }
      else {
        response = await response.json();
        throw new Error(response.message);
      }
    }
    catch (error) {
      console.log('error:', error.message || error);
      ToastAndroid.show(`${error.message || error}`, ToastAndroid.LONG);
    }
    finally {
      this.setState({ fetching: false });
    }
  }

  render() {
      const user = this.props.user || {};
    return (
      <View style={styles.container}>
        <Image source={require('./../img/logo.png')} />
        <Text style={styles.welcome}>
          Login
        </Text>
        <TextInput style={styles.username}
                   placeholder="Email"
                   onChangeText={(email) => this.setState({ email }) }
                   value={this.state.email || user.email }
        />
        <TextInput style={styles.password}
                   placeholder="password"
                   onChangeText={(password) => this.setState({ password }) }
                   secureTextEntry={true}
                   value={this.state.password}
        />
        <Button
          text="Login"
          primary={'paperCyan'}
          raised={true}
          styleDisabled={{ color: 'grey' }}
          onPress={() => this._login(this.state.email, this.state.password) }
          disabled={this.state.fetching} />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcome: {
    fontSize: 50,
    textAlign: 'center',
    margin: 10,
  },
  username: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
    height: 50,
    width: 180
  },
  password: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
    height: 50,
    width: 120
  },
  loginButton: {
    fontSize: 20,
    color: 'green'
  }
});
Login.propTypes = {
  deviceToken: PropTypes.string,
  user: PropTypes.object,
  token: PropTypes.string,
  loadMedRemindersFromStorage: PropTypes.func.isRequired,
  saveUser: PropTypes.func.isRequired,
  loadUserFromStorage: PropTypes.func.isRequired,
  updateDeviceToken: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
  deviceToken: state.auth.deviceToken,
  user: state.auth.user,
  token: state.auth.token
});
const mapDispatchToProps = {
  changeRoute,
  saveUser,
  loadUserFromStorage,
  loadMedRemindersFromStorage,
  loadTimeToTake,
  updateDeviceToken
};
export default connect(mapStateToProps, mapDispatchToProps)(Login);
