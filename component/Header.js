import React, { Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { View, Text, ToolbarAndroid, StyleSheet } from 'react-native';
import Setting from './Setting';
import { closeMedReminderSetting } from './../reducers/medicine.reducer';

export class Header extends Component {
    constructor(props){
        super(props);
        this.state = {
            isSettingShow: false
        };
        this._onToolbarActionSelected = this._onToolbarActionSelected.bind(this);
        this.closeSetting = this.closeSetting.bind(this);
    }

    _onToolbarActionSelected (position) {
        if (position === 0) { // index of 'Settings'
            this.setState({isSettingShow: !this.state.isSettingShow});
        }
    }

    closeSetting() {
        this.setState({isSettingShow: !this.state.isSettingShow});
        this.props.closeMedReminderSetting();
    }

    render() {
        if(this.props.currentScene === 'login'){
            return <View></View>;
        }
        return (
            <ToolbarAndroid
                title={this.props.title}
                actions={[
                    {
                        title: 'Settings',
                        icon: {uri: 'https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/png/512/android-settings.png'},
                        show: 'always'
                    }
                ]}
                onActionSelected={this._onToolbarActionSelected}
                colorProps= {{
                    titleColor: '#FFFFFF',
                    subtitleColor: '#FFFFFF',
                }}
                style={styles.toolbar}
            >
                <Setting
                    visible={this.state.isSettingShow}
                    navigator={this.props.navigator}
                    closeSetting={this.closeSetting} />
            </ToolbarAndroid>
        );
    }
}
const styles = StyleSheet.create({
    toolbar: {
        height: 50,
        backgroundColor: '#0097A7'
    }
});

Header.propTypes = {
    title: PropTypes.string.isRequired
};
const mapDispatchToProps = ({
    closeMedReminderSetting
});
export default connect(null,mapDispatchToProps)(Header);

