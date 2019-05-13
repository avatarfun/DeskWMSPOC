import { getCredentials, notifyP2PMessage } from '../API/APIActions';
import Storage from '../Utils/Storage';
import ZD_Connection from '../Utils/ZD_Connection';
import ZD_Stream from '../Utils/ZD_Stream';
const userInfo = new Storage('userInfo');
const POC = {
  Operations: {
    getNewCredentials(userId = 12345) {
      const resp = getCredentials(userId);
      userInfo.set(userId, { userId, credentials: resp });
      return resp;
    },
    notifyP2PMessage(userId, messageType = 'candidate', message) {
      return notifyP2PMessage(userId, messageType, message);
    },
    makeNewRTCPeerConnection() {
      new Promise((_succ, _fail) => {});
      return;
    }
  },
  Actions: {
    getUserMediaPermission() {
      return _getUserMediaPermission();
    },
    getExistingCredentials(userId = 12345) {
      const details = userInfo.get(userId);
      const { credentials = {} } = details || {};
      return credentials;
    },
    createNewRTCPeerConnection() {
      const _cbk = stream => {
        const iceServerlist = _getIceServerList();
        ZD_Connection.addcandidate = _onicecandidate;
        return ZD_Connection.init(iceServerlist)
          .addStream(stream)
          .createOffer()
          .then(ZD_Connection.setLocalDescription)
          .catch(err => console.log(err));
      };
      ZD_Stream.hasLocalStream
        ? _cbk(ZD_Stream.getLocalStream())
        : _getUserMediaPermission().then(_cbk);
    }
  },
  ZD_WebRTC: { Streams: ZD_Stream, Conn: ZD_Connection }
};

export default POC;

const _getUserMediaDetails = function() {
  let audioInputDevices = [];
  let videoInputDevices = [];
  let audioExist = false;
  let videoExist = false;
  let gumConstraints = {
    audio: audioExist,
    video: videoExist
  };
  return new Promise((_succ, _fail) => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices => {
        devices.forEach(device => {
          if (device.kind == 'audioinput') {
            var _deviceData = { kind: device.kind, deviceId: device.deviceId };
            if (device.label && device.label.length > 0) {
              _deviceData.name = device.label;
            } else {
              _deviceData.name = `Audio Device-${audioInputDevices.length + 1}`;
            }
            audioInputDevices.push(_deviceData);
            audioExist = true;
            gumConstraints.audio = true;
            try {
              var exact = { exact: device.deviceId };
              var _device = { deviceId: exact };
              gumConstraints.audio = _device;
            } catch (something) {
              //                            console.log("something",something);
            }
          }
          if (device.kind == 'videoinput') {
            var _deviceData = { kind: device.kind, deviceId: device.deviceId };
            if (device.label && device.label.length > 0) {
              _deviceData.name = device.label;
            } else {
              _deviceData.name = `Video Device-${videoInputDevices.length + 1}`;
            }
            videoInputDevices.push(_deviceData);
            videoExist = true;
            gumConstraints.video = true;
            try {
              var exact = { exact: device.deviceId };
              var _device = { deviceId: exact };
              gumConstraints.video = _device;
            } catch (something) {
              console.log('something', something);
            }
            // gumConstraints.video.deviceId = exact;
          }
        });
        gumConstraints.video = false;
        _succ(gumConstraints);
      })
      .catch(err => {
        _fail(gumConstraints);
        // console.log(`${err.name}: ${err.message}`);
      });
  });
};
const _getUserMediaPermission = function() {
  return _getUserMediaDetails().then(userMediaConstraints =>
    navigator.mediaDevices.getUserMedia(userMediaConstraints).then(stream => {
      // _updateAudioSteamToDOMEle(stream);
      ZD_Stream.updateLocalStream(stream);
      return stream;
    })
  );
};
const _getIceServerList = () => {
  const {
      turnurls,
      credential,
      username
    } = POC.Actions.getExistingCredentials(),
    stunurl = { url: `stun:${turnurls}` },
    turnurl = {
      url: `turn:${turnurls}?transport=tcp`,
      username: username,
      credential: credential
    },
    turnurl1 = {
      url: `turn:${turnurls}?transport=tcp`,
      username: username,
      credential: credential
    },
    iceservers = [stunurl, turnurl, turnurl1],
    iceServerlist = { iceServers: iceservers };
  return iceServerlist;
};
const _onicecandidate = evt => {
  try {
    const messageType = 'candidate';
    const userId = '12345';
    const message = JSON.stringify({
      type: 'candidate',
      label: evt.candidate.sdpMLineIndex,
      id: evt.candidate.sdpMid,
      candidate: evt.candidate.candidate
    });
    POC.Operations.notifyP2PMessage(userId, messageType, message);
  } catch (e) {
    console.log(e);
  }
};

(() => {
  if (navigator.mozGetUserMedia) {
    RTCIceCandidate = mozRTCIceCandidate;
    RTCSessionDescription = mozRTCSessionDescription;
    RTCPeerConnection = mozRTCPeerConnection;
  } //For Chrome
  else {
    RTCPeerConnection = webkitRTCPeerConnection;
  }
})();
