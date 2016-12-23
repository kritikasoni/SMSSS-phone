// @flow
import React, { Component } from 'react';
import Login from './Login';
import {
  AppRegistry,
  StyleSheet,
  Navigator,
  View,
  Text,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { changeRoute } from './../reducers/scene.reducer';
import Footer from './../component/Footer';
import Header from './../component/Header';
import Push from './../component/Push';

export class App extends Component {

    constructor(props) {
        super(props);
        this.renderScene = this.renderScene.bind(this);
        this.configureScene = this.configureScene.bind(this);
    }
    renderScene(route, navigator) {
        return (
          <View style={styles.container}>
              <Header title={route.title} navigator={navigator} currentScene={this.props.currentScene} />
              <ScrollView>
                  <View>
                      <route.component navigator={navigator} {...route.passProps} />
                  </View>
              </ScrollView>
              <Footer navigator={navigator} />
          </View>);
    }

    configureScene(route, routeStack){
        if(route.type == 'Modal') {
            return Navigator.SceneConfigs.FloatFromBottom;
        }
        if(route.type == 'pushFromRight'){
            return Navigator.SceneConfigs.PushFromRight;
        }
        return Navigator.SceneConfigs.PushFromRight;
    }

    render() {
        return (
          <View style={styles.container}>
              <Push style={{width:0, height:0}} />
              <Navigator
                configureScene={ this.configureScene }
                style={styles.navigator}
                initialRoute={{ component: Login, title:'Login' }}
                renderScene={ this.renderScene } />
          </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
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
    }
});

const mapStateToProps = (state) => ({
    currentScene: state.scene.current,
    changeSceneType: state.scene.ChangeSceneType,
    history: state.scene.history,
    title: state.scene.title
});

const mapDispatchToProps = {
    changeRoute
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
