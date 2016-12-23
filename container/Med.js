import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  View,
  ListView,
  Alert,
} from 'react-native';
import moment from 'moment';
import { connect } from 'react-redux';
import MedRow from './../component/Med/MedRow';
import { stopTakingMed, alreadyTakenMed, updateMedPres, loadMedPres } from './../reducers/medicine.reducer';

export class Med extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      data: [],
      dataSource: this.ds.cloneWithRows([]),
      fetching: false,
      medPres: []
    };
    this._alreadyTake = this._alreadyTake.bind(this);
    this._stopTaking = this._stopTaking.bind(this);
    this._generateListViewDataSource = this._generateListViewDataSource.bind(this);
  }

  componentWillMount() {
    this.props.loadMedPres(this.props.user.id);
  }

  _alreadyTake(id, dosage) {
    this.props.alreadyTakenMed(this.props.user.id, id, dosage);
    Alert.alert(
      'Success',
      'The amount left has been updated',
      [
        {text: 'OK'},
      ]
    );
  }
  _stopTaking(id) {
    Alert.alert(
      'Warning',
      'Stop taking this medicine will make you no longer see this medicine',
      [
        {text: 'Cancel', onPress: () => console.log('cancel stop taking function')},
        {text: 'OK', onPress: () => { this.props.stopTakingMed(id); }},
      ]
    );
  }
  _generateListViewDataSource () {
    console.log('generate list view data source: prescriptions', this.props.prescriptions);
    console.log('generate list view data source: medUsage', this.props.medUsage);
    const medicineUsage = [...this.props.medUsage];
    const prescriptions = [...this.props.prescriptions];
    let medPres = [];
    prescriptions.forEach(prescription => {
      prescription.medicinePrescription = prescription.medicinePrescription.map(element => {
        let targetMedicineUsage = medicineUsage.find(med => med.id === element.id);
        element.used = targetMedicineUsage ? targetMedicineUsage.used : 0;
        element.createdAt = moment(prescription.createdAt).format('YYYY/MM/DD');
        element.amountLeft = targetMedicineUsage ? (element.amount - targetMedicineUsage.used) : element.amount;
        const count = element.amountLeft / element.dosage;
        return element;
      });
      medPres = [...medPres, ...prescription.medicinePrescription];
    });
    medPres = medPres.filter(mp => mp.used < mp.amount).filter(mp => mp.isTaking);
    return this.ds.cloneWithRows(medPres);
  }
  render() {
    const dataSource = this._generateListViewDataSource();
    console.log('render med');
    return (
      <View style={ styles.container }>
        <ListView
          style={styles.listView}
          dataSource={dataSource}
          renderRow={(rowData) => <MedRow {...rowData} alreadyTake={this._alreadyTake} stopTaking={this._stopTaking} />}
          renderSeparator={(sectionId, rowId) => (<View key={`${sectionId}-${rowId}`} style={styles.separator} />)}
          enableEmptySections={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'white'
  },
  navigator: {
    flex: 1
  },
  separator: {
    height: 1,
    backgroundColor: '#8E8E8E',
  },
  listView: {
    flex: 1,
    alignSelf: 'stretch',
    marginBottom: 60
  }
});

Med.propTypes = {
  user: PropTypes.object.isRequired,
  prescriptions: PropTypes.array.isRequired,
  medUsage: PropTypes.array.isRequired,
  medPres: PropTypes.array.isRequired,
  stopTakingMed: PropTypes.func.isRequired,
  alreadyTakenMed: PropTypes.func.isRequired,
  updateMedPres: PropTypes.func.isRequired,
  loadMedPres: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
  user: state.auth.user,
  prescriptions: state.med.prescriptions,
  medUsage: state.med.medUsage,
  timeToTakes: state.med.timeToTakes,
  reminders: state.med.reminders,
  medPres: state.med.medPres
});
const mapDispatchToProps = ({
  stopTakingMed,
  alreadyTakenMed,
  updateMedPres,
  loadMedPres
});
export default connect(mapStateToProps, mapDispatchToProps)(Med);
