import { getCredentials, notifyP2PMessage, getAnonId } from '../API/APIActions';
import Storage from '../Utils/Storage';
import ZD_Connection from '../Utils/ZD_Connection';
import ZD_Stream from '../Utils/ZD_Stream';
import ZD_WMS_handler from '../Utils/WMS_handler';
const userInfo = new Storage('userInfo');

const POC = {
  Operations: {
    getUserMediaPermission() {
      return _getUserMediaPermission();
    },
    getExistingCredentials() {
      const { anonId } = POC.Operations.getExistingRegisteredUserDetails();
      const details = userInfo.get(anonId);
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
    },
    registerWMS(userName) {
      const { anonId } = POC.Operations.getExistingRegisteredUserDetails();
      const _cbk = anonId => ZD_WMS_handler.registerWMS(anonId, userName);
      return new Promise((_succ, _fail) => {
        if (anonId) {
          return _cbk(anonId);
        }
        return POC.Actions.getAnonId(userName).then(resp => _cbk(resp.anonId));
      });
    },
    getExistingRegisteredUserDetails() {
      return ZD_WMS_handler.getAnonDetails();
    },
    getSTUN_TURNCredentials() {
      const { anonId } = POC.Operations.getExistingRegisteredUserDetails();
      return POC.Actions.getNewCredentials(anonId).then(resp => {
        userInfo.set(anonId, { anonId, credentials: resp });
        return resp;
      });
    }
  },
  Actions: {
    getNewCredentials(userId) {
      return getCredentials(userId);
    },
    notifyP2PMessage(userId, messageType = 'candidate', message) {
      console.log(userId, messageType, message);
      // return notifyP2PMessage(userId, messageType, message);
    },
    makeNewRTCPeerConnection() {
      return new Promise((_succ, _fail) => {});
    },
    getAnonId(displayName) {
      return getAnonId(displayName);
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
    } = POC.Operations.getExistingCredentials(),
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
      id: evt.candidate.sdpMid,
      candidate: evt.candidate.candidate
    });
    POC.Actions.notifyP2PMessage(userId, messageType, message);
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
