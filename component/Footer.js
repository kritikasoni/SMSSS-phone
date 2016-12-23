import React, { Component, PropTypes} from 'react';
import { View, StyleSheet} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import EIcon from 'react-native-vector-icons/EvilIcons';
import OCIcon from 'react-native-vector-icons/Octicons';
import MDIcon from 'react-native-vector-icons/MaterialIcons';
import { changeRoute, pop } from './../reducers/scene.reducer';
import Login from "../container/Login";
import Med from "../container/Med";
import Queue from "../container/Queue";
import Profile from "../container/Profile";
import Appointment from "../container/Appointment";
export class Footer extends Component {
    constructor(props){
        super(props);
        this._changeRoute = this._changeRoute.bind(this);
    }

    _changeRoute(scene){
        if(scene !== this.props.currentScene){
            let nextScene = {
                type: 'pushFromRight',
                title: 'No title',
                component: Login
            };
            switch (scene) {
                case 'medicine':
                    nextScene.component = Med;
                    nextScene.title = 'Medicine';
                    break;
                case 'queue':
                    nextScene.component = Queue;
                    nextScene.title = 'Queue';
                    break;
                case 'profile':
                    nextScene.component = Profile;
                    nextScene.title = 'Profile';
                    break;
                case 'appointment':
                    nextScene.component = Appointment;
                    nextScene.title = 'Appointment';
                    break;
                default:
                    nextScene.component =  Login;
                    nextScene.title = 'Login';
            }
            this.props.changeRoute(scene);
            this.props.navigator.push(nextScene);
        }
    }
    render() {
        const color = '#9E9E9E';
        const activeColor = '#212121';
        const iconSize = 45;
        if(this.props.currentScene === 'login'){
            return <View></View>
        }
        return (
            <View style={styles.navContainer}>
                <View style={styles.footer}>
                    <View style={styles.iconWrapper}>
                        <OCIcon
                            name="calendar"
                            size={iconSize}
                            color={this.props.currentScene === 'appointment' ? activeColor : color}
                            style={styles.icon}
                            onPress={() => this._changeRoute('appointment')}
                        />
                    </View>
                    <View style={styles.iconWrapper}>
                        <Icon
                            name="medkit"
                            size={iconSize}
                            color={this.props.currentScene === 'medicine' ? activeColor : color}
                            style={styles.icon}
                            onPress={() => this._changeRoute('medicine')}
                        />
                    </View>
                    <View style={styles.iconWrapper}>
                        <EIcon
                            name="user"
                            size={55}
                            color={this.props.currentScene === 'profile' ? activeColor : color}
                            style={styles.icon}
                            onPress={() => this._changeRoute('profile')}
                        />
                    </View>
                    <View style={styles.iconWrapper}>
                        <OCIcon
                            name="list-ordered"
                            size={iconSize}
                            color={this.props.currentScene === 'queue' ? activeColor : color}
                            style={styles.icon}
                            onPress={() => this._changeRoute('queue')}
                        />
                    </View>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    navContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -10,
        backgroundColor:'#0097A7',
        flexDirection:'row',
        height:80,
        alignItems:'center',
    },
    footer: {
        flexDirection:'row',
        flex: 0.8,
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor:'#0097A7'
    },
    iconWrapper: {
        flex:0.25,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    icon: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    }
});
const mapStateToProps = (state) => ({
    currentScene: state.scene.current
});

const mapDispatchToProps = {
    changeRoute: changeRoute
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);