import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  ToastAndroid,
  Vibration,
  View,
  Text,
  ListView
} from 'react-native';
import { connect } from 'react-redux';
import { backendUrl } from './../config';
import MdIcon from 'react-native-vector-icons/MaterialIcons';
import QueueRow from './../component/Queue/QueueRow';
import QueueHeader from './../component/Queue/QueueHeader';
import { Divider  } from 'react-native-material-design';

export class Queue extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      roomId: -1,
      status: 'Connecting...',
      hide: true,
      queue: {
        room: {
          id: -1,
          name: ''
        },
        time: undefined,
        patient: undefined
      },
      data: [],
      dataSource: this.ds.cloneWithRows([]),
    };
    this.socket = null;
    this.joinRoom = this.joinRoom.bind(this);
    this.handleJoinCurrentRoom = this.handleJoinCurrentRoom.bind(this);
    this.handleJoinWaitingRoom = this.handleJoinWaitingRoom.bind(this);
    this.vibrateIfQueueIsMoving = this.vibrateIfQueueIsMoving.bind(this);
    this.handleAllQueueInRoom = this.handleAllQueueInRoom.bind(this);
  }

  async componentDidMount() {
    window.navigator.userAgent = 'react-native';

    const io = require('socket.io-client/dist/socket.io');
    this.socket = io(`${backendUrl}?__sails_io_sdk_version=0.11.0`, {jsonp: false});
    this.socket.on('connect', this.joinRoom);
    this.socket.on('reconnecting', () => {
      this.setState({status: 'Reconnecting...', hide: true});
    });
    this.socket.on('connect_failed', () => {
      this.setState({status: 'Connect failed!', hide: true});
    });
    this.socket.on('error', error => {
      console.error(error);
    });
    this.socket.on('queues:created', (response) => {
      console.log(response);
      if(this.props.user.id == response.patientId) {
        this.socket.off('waitingRoom', () => console.info('remove connection on waiting room'));
        this.joinRoom();
      }
    });
    this.socket.on('queues:moving', (response) => {
      console.log('queue is moving',response);
      this.joinRoom();
    });
    // this.socket.on('queues:clearAll', (response) => {
    //   console.log('clearAll');
    //   this.socket.emit(
    //     'get', { url: `/queues/joinWaitingRoom`, headers: { Authorization: `Bearer ${this.props.token}` } },
    //     this.handleJoinWaitingRoom
    //   );
    //   this.setState({status: 'No queue found'});
    // });
  }
  componentWillUnmount() {
    this.socket.off(`room:${this.state.roomId}`,() => console.info('unsubscribe ',this.state.roomId));
    this.socket.off('waitingRoom', () => console.info('unsubscribe waiting room'));
    this.socket.off('queues:created', () => console.info('unsubscribe queues:created'));
    this.socket.off('queues:moving', () => console.info('unsubscribe queues:created'));
  }

  joinRoom() {
    console.log('joinging room');
    this.socket.emit(
      'get', {url: '/queues/joinCurrentRoom', headers: { Authorization: `Bearer ${this.props.token}`}},
      this.handleJoinCurrentRoom
    );
  }

  handleJoinCurrentRoom(response) {
      console.log(response);
      const queue = response.body;
      switch (response.statusCode) {
        case 200:
          this.vibrateIfQueueIsMoving(queue);
          this.setState({status: queue.status, hide: false, queue, roomId: queue.room.id});
          console.log('join room: ', queue.room.id);
          this.socket.emit(
            'get',
            { url: `${backendUrl}/queues/allQueueInRoom/${queue.room.id}`, headers: { Authorization: `Bearer ${this.props.token}` } },
            this.handleAllQueueInRoom);
          this.socket.off('queues:created', () => console.info('unsubscribe queues:created'));
          break;
        case 401:
          this.setState({status: 'Authentication failed, please login again'});
          break;
        case 403:
          this.setState({status: 'Forbidden'});
          break;
        case 404:
          this.setState({hide: true});
          this.socket.emit(
            'get', { url: '/queues/joinWaitingRoom', headers: { Authorization: `Bearer ${this.props.token}` } },
            this.handleJoinWaitingRoom
          );
          this.setState({status: 'No queue found'});
          break;
        default:
          this.setState({status: 'Something went wrong...'});
      }
  }
  handleJoinWaitingRoom(response) {
    switch (response.statusCode) {
      case 200:
        console.log('joined waiting room');
        break;
      case 401:
        this.setState({status: 'Authentication failed, please login again'});
        break;
      default:
        this.setState({status: 'Something went wrong...'})
    }
  }
  handleAllQueueInRoom({body, statusCode}) {
    console.log('body queues',body);
    if (statusCode > 399){
      ToastAndroid.show('Error in this queue room! please contact admin', ToastAndroid.SHORT);
    }
    else {
      this.setState({data: body.queues, dataSource: this.ds.cloneWithRows(body.queues)});
    }
  }
  vibrateIfQueueIsMoving(queue){
    if(queue){
      if(queue.currentIndex !== this.state.queue.currentIndex && !!this.state.queue.currentIndex){
        console.log(queue.currentIndex,'!=',this.state.queue.currentIndex);
        ToastAndroid.show('updated', ToastAndroid.SHORT);
        Vibration.vibrate(300,false);
      }
    }
  }
  render() {
    if(this.state.hide){
      return (
        <View style={ styles.container }>
          <Text>{this.state.status}</Text>
        </View>
      );
    }
    else{
      return(
        <View style={ styles.container }>
          <View style={styles.inlineTextWrapper} >
            <Text style={styles.label}>Queue status:</Text>
            <Text style={styles.inlineText}>{this.state.status}</Text>
          </View>
          <View style={styles.inlineTextWrapper} >
            <Text style={styles.label}>Your Queue ID:</Text>
            <Text style={styles.inlineText}>{this.state.queue.id}</Text>
          </View>
          <View style={styles.inlineTextWrapper} >
            <Text style={styles.label}>Room:</Text>
            <Text style={styles.inlineText}>{this.state.queue.room.name}</Text>
          </View>
          <View style={styles.inlineTextWrapper} >
            <Text style={styles.label}>Queue left:</Text>
            <Text style={styles.inlineText}>{this.state.queue.currentIndex}</Text>
          </View>
          <TouchableHighlight>
            <MdIcon
              name="cached"
              size={50}
              color={this.state.fetching ? '#9E9E9E' : '#00BCD4'}
              style={[styles.refreshButton,{marginLeft:50}]}
              onPress={() => this.joinRoom() }
            />
          </TouchableHighlight >
          <ListView
            style={styles.listView}
            dataSource={this.state.dataSource}
            renderHeader={() => <QueueHeader /> }
            renderRow={(rowData) => <QueueRow {...rowData} userQueueId={this.state.queue.id} />}
            renderSeparator={(sectionId, rowId) => (<Divider key={`${sectionId}-${rowId}`} />)}
            enableEmptySections={true}
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  navigator: {
    flex: 1
  },
  refreshButton: {
    flex: 0.5
  },
  label: {
    fontSize:18,
    fontWeight: 'bold',
    flex:0.3,
    alignSelf: 'center',
  },
  inlineText: {
    flex:0.7,
    textAlign: 'left',
    fontSize:20,
    marginBottom: 5,
    marginLeft: 5,
  },
  inlineTextWrapper: {
    flex: 1,
    margin: 10,
    alignSelf: 'center',
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  separator: {
    height: 1,
    backgroundColor: '#8E8E8E',
  },
  listView: {
    flex: 1,
    alignSelf: 'stretch',
    height: 500,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 60
  },
});

Queue.propTypes = {
  user: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired
};
const mapStateToProps = (state) => ({
  user: state.auth.user,
  token: state.auth.token
});
export default connect(mapStateToProps)(Queue);