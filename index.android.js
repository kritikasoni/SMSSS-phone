// @flow

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
} from 'react-native';
import { Provider } from 'react-redux';
import createStore from './store/createStore';
import App from './container/App';

const store = createStore();

class smsssPhone extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'powderblue'
  },
  navigator: {
    flex: 1
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#30849C',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  navContainer: {
    position: 'absolute',
    flex:0.1,
    left: 0,
    right: 0,
    bottom: -10,
    backgroundColor:'green',
    flexDirection:'row',
    height:80,
    alignItems:'center',
  }
});

AppRegistry.registerComponent('smsssPhone', () => smsssPhone);
