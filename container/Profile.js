import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ToastAndroid,
    TextInput,
    TouchableHighlight
} from 'react-native';
import { connect } from 'react-redux';
import { Button } from 'react-native-material-design';
import { backendUrl } from './../config';
import moment from 'moment';
import Http from './../util/Http';
import Storage from './../util/Storage';
import MdIcon from 'react-native-vector-icons/MaterialIcons';
export class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                id: -1,
                firstName: '',
                lastName: '',
                dob: undefined,
                weight: '',
                height: '',
                bloodPressure: '',
                heartRate: ''
            },
            editing: false,
            fetching: false
        };
        this._onSubmit = this._onSubmit.bind(this);
    }

    async componentWillMount() {
        this.setState({fetching: true});
        let user = await Storage.getItem('user');
        user = JSON.parse(user);
        try {
            const result = await Http.get(`${backendUrl}/patients/${user.id}`);
            this.setState({user: result})
        }
        catch (e){
            console.error(e);
        }
        finally {
            this.setState({ fetching: false });
        }
    }

    _validatePreliminaryData(weight, height) {
        try{
            const rule = /^(d{0,3})([\.]d{0,3})?/;
            if(rule.test(weight) && rule.test(height)){
                parseFloat(weight);
                parseFloat(height);
                return true;
            }
            else{
                ToastAndroid.show('Weight and Height must be in number format', ToastAndroid.SHORT);
                return false;
            }
        }
        catch (e){
            ToastAndroid.show('Weight and Height must be in number format', ToastAndroid.SHORT);
            return false;
        }
    }
    async _onSubmit(){
        console.log('submit');
        const weight = this.state.user.weight;
        const height = this.state.user.height;
        const userId = this.state.user.id;

        const isValid = this._validatePreliminaryData(weight, height);
        console.log(isValid);
        if(isValid){
            this.setState({fetching: true});
            const updatePreliminaryData = JSON.stringify({ weight, height });
            try{
                const result = await Http.put(`${backendUrl}/patients/${userId}`,updatePreliminaryData);
                ToastAndroid.show('Success', ToastAndroid.SHORT);
                this.setState({user: result, editing: false})
            }
            catch (e) {

                console.info(e);
                ToastAndroid.show(e.message, ToastAndroid.SHORT);
            }
            finally {
                this.setState({ fetching: false });
            }
        }

    }

    render() {
        let age = {
            year: moment().diff(this.state.user.dob,'years')
        };
        if(this.state.editing){
            return (<View style={styles.container}>
                <Text style={styles.title}>Update weight and height</Text>
                <View style={styles.inlineInputWrapper}>
                    <Text style={styles.label}>Weight:</Text>
                    <TextInput style={styles.formInput}
                               keyboardType={'phone-pad'}
                               placeholder="Your weight here.."
                               value={this.state.user.weight + ''}
                               onChangeText={(weight) => this.setState({ user: {...this.state.user, weight } })}
                    />
                </View>
                <View style={styles.inlineInputWrapper}>
                    <Text style={styles.label}>Height:</Text>
                    <TextInput style={styles.formInput}
                               placeholder="Your height here.."
                               keyboardType={'phone-pad'}
                               value={this.state.user.height + ''}
                               onChangeText={(height) => this.setState({ user: {...this.state.user, height } }) }
                    />
                </View>
                <View style={styles.formSubmitWrapper}>
                    <TouchableHighlight>
                        <MdIcon
                            name="clear"
                            size={50}
                            color={this.state.fetching ? '#9E9E9E': '#00BCD4'}
                            style={styles.formSubmit}
                            onPress={() => this.setState({editing: false})}
                        />
                    </TouchableHighlight >
                    <TouchableHighlight>
                        <MdIcon
                            name="done"
                            size={50}
                            color={this.state.fetching ? '#9E9E9E': '#00BCD4'}
                            style={[styles.formSubmit,{marginLeft:50}]}
                            onPress={this._onSubmit}
                        />
                    </TouchableHighlight >
                </View>
            </View>);
        }
        return (
            <View style={ styles.container }>
                <View style={styles.inlineTextWrapper} >
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.inlineText}>{this.state.user.firstName} {this.state.user.lastName}</Text>
                </View>
                <View style={styles.inlineTextWrapper} >
                    <Text style={styles.label}>Date of birth:</Text>
                    <Text style={styles.inlineText}>{moment(this.state.user.dob).format('YYYY/MM/DD')}</Text>
                </View>
                <View style={styles.inlineTextWrapper} >
                    <Text style={styles.label}>Age:</Text>
                    <Text style={styles.inlineText}>{age.year}</Text>
                </View>
                <View style={styles.inlineTextWrapper} >
                    <Text style={styles.label}>Weight:</Text>
                    <Text style={styles.inlineText}>{this.state.user.weight}</Text>
                </View>
                <View style={styles.inlineTextWrapper} >
                    <Text style={styles.label}>Height:</Text>
                    <Text style={styles.inlineText}>{this.state.user.height}</Text>
                </View>
                <View style={styles.inlineTextWrapper} >
                    <Text style={styles.label}>Blood pressure:</Text>
                    <Text style={styles.inlineText}>{this.state.user.bloodPressure}</Text>
                </View>
                <View style={styles.inlineTextWrapper} >
                    <Text style={styles.label}>Heart rate:</Text>
                    <Text style={styles.inlineText}>{this.state.user.heartRate || `${this.state.user.heartRate} (bpm)`}</Text>
                </View>
                <Button text="Update" style={styles.updateButton} raised={true} onPress={() => this.setState({editing: true})} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 25
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    navigator: {
        flex: 1
    },
    formInput: {
        flex:0.6,
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
        marginLeft: 5,
        height: 50,
        width: 150
    },
    formSubmit: {
        flex:0.5
    },
    formSubmitWrapper: {
        flex:1,
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        alignSelf: 'center',
        flexDirection: 'row'
    },
    toggleEditing: {
        width: 180,
        backgroundColor: '#00BCD4'
    },
    label: {
        fontSize:18,
        fontWeight: 'bold',
        flex:0.4,
        alignSelf: 'center',
    },
    inlineInputWrapper: {
        flex: 1,
        margin: 10,
        alignSelf: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row'
    },
    inlineTextWrapper: {
        flex: 1,
        margin: 10,
        alignSelf: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row'
    },
    inlineText: {
        flex:0.75,
        textAlign: 'left',
        fontSize:20,
        marginBottom: 5,
        marginLeft: 5,
    },
    updateButton: {
        height: 50,
        width: 100,
    }
});

export default connect(null)(Profile);

