import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { View,StyleSheet, ToastAndroid, TimePickerAndroid, ListView, Text } from 'react-native';
import ReminderSettingHeader from './ReminderSettingHeader';
import ReminderSettingRow from './ReminderSettingRow';
import moment from 'moment';
import { loadTimeToTake, setMedReminderSetting, resetMedReminderSetting } from './../../../reducers/medicine.reducer';

export class MedReminderSetting extends Component {

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      data: [],
      dataSource: this.ds.cloneWithRows([]),
      fetching: false
    };
    this._resetReminder = this._resetReminder.bind(this);
    this._setReminder = this._setReminder.bind(this);
    this._saveReminderSetting = this._saveReminderSetting.bind(this);
    this.showPicker = this.showPicker.bind(this);
  }

  _resetReminder (id) {
    this.props.resetMedReminderSetting(id,this.props.user.id);
  }
  _setReminder (id) {
    this.showPicker({
      hour: moment().get('hours'),
      minute: moment().get('minutes'),
      is24Hour: true
    }, id);
  }
  _saveReminderSetting (reminderSettingId, minute, hour) {
    const paddingHour = hour < 10 ? `0${hour}` : hour;
    const paddingMinute = minute < 10 ? `0${minute}` : minute;
    this.props.setMedReminderSetting({id: reminderSettingId, time: `${paddingHour}:${paddingMinute}`});
  }
  async showPicker (options, reminderSettingId) {
    try {
      const {action, minute, hour} = await TimePickerAndroid.open(options);
      if (action === TimePickerAndroid.timeSetAction) {
        this._saveReminderSetting(reminderSettingId, minute, hour);
      } else if (action === TimePickerAndroid.dismissedAction) {
        console.log('dismiss');
      }
    } catch ({code, message}) {
      console.warn('Error in MedReminderSetting: ', message);
    }
  }

  render() {
    const timeToTakes = [...this.props.timeToTakes].sort((a,b) => a.id - b.id);
    return (
      <View style={styles.container}>
        <ListView
          style={styles.listView}
          dataSource={this.ds.cloneWithRows(timeToTakes)}
          renderRow={(rowData) => <ReminderSettingRow {...rowData} onReset={this._resetReminder} onSet={this._setReminder} fetching={this.state.fetching} />}
          renderSeparator={(sectionId, rowId) => (<View key={`${sectionId}-${rowId}`} style={styles.separator} />)}
          enableEmptySections={true}
          renderHeader={ () => <ReminderSettingHeader/> }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingBottom: 30
  },
  listView: {
    alignSelf: 'stretch',
    height: 450,
  },
  separator: {
    height: 1,
    backgroundColor: '#8E8E8E',
  },
});
MedReminderSetting.propTypes = {
  user: PropTypes.object.isRequired,
  timeToTakes: PropTypes.array.isRequired,
  loadTimeToTake: PropTypes.func.isRequired,
  setMedReminderSetting: PropTypes.func.isRequired,
  resetMedReminderSetting: PropTypes.func.isRequired
};
const mapDispatchToProps = ({
  loadTimeToTake,
  setMedReminderSetting,
  resetMedReminderSetting
});
const mapStateToProps = (state) => ({
  user: state.auth.user,
  timeToTakes: state.med.timeToTakes
});
export default connect(mapStateToProps, mapDispatchToProps)(MedReminderSetting);
