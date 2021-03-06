import {
  getCredentials,
  notifyP2PMessage,
  getAnonId,
  ringToAgent
} from '../API/APIActions';
import Storage from '../Utils/Storage';
import ZD_Connection1 from '../Utils/ZD_Connection1';
// import ZD_Stream from '../Utils/ZD_Stream';
import ZD_WMS_handler from '../Utils/WMS_handler';
// import { makeCall } from '../Utils/global';
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
    registerWMS(userName) {
      const { anonId } = POC.Operations.getExistingRegisteredUserDetails();
      ZD_WMS_handler.handleCustomeMessages = _handleCustomeMessages;
      const _cbk = anonId => (
        ZD_Connection1.setUserId(anonId),
        ZD_WMS_handler.registerWMS(anonId, userName)
      );

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
    },
    hangUpCall() {
      ZD_Connection1.hangUpCall();
    },
    makeCall() {
      ZD_Connection1.setIceServerList(_getIceServerList());
      const { anonId } = POC.Operations.getExistingRegisteredUserDetails();
      const callRefId = `POC_${new Date().getTime()}`;
      ZD_Connection1.makeCall(anonId), callRefId;
    },
    ringToAgent() {
      const { anonId } = POC.Operations.getExistingRegisteredUserDetails();
      const callRefId = `POC_${new Date().getTime()}`;
      ringToAgent(callRefId, anonId);
    }
  },
  Actions: {
    getNewCredentials(userId) {
      return getCredentials(userId);
    },
    notifyP2PMessage(userId, messageType, message) {
      return notifyP2PMessage(userId, messageType, message);
    },
    makeNewRTCPeerConnection() {
      return new Promise((_succ, _fail) => {});
    },
    getAnonId(displayName) {
      return getAnonId(displayName);
    }
  }
};

const _handleCustomeMessages = msg => {
  let { module, message } = msg;
  if (module == 'POC') {
    ZD_Connection1.handleSignalMessage(message);
  }
};

export default POC;

const _getIceServerList = () => {
  const {
      turnurls,
      credential,
      username
    } = POC.Operations.getExistingCredentials(),
    stunurl = { urls: `stun:${turnurls}` },
    turnurl = {
      urls: `turn:${turnurls}?transport=tcp`,
      username: username,
      credential: credential
    },
    // turnurl1 = {
    //   urls: `turn:${turnurls}?transport=tcp`,
    //   username: username,
    //   credential: credential
    // },
    iceservers = [stunurl, turnurl],
    iceServerlist = { iceServers: iceservers };
  return iceServerlist;
};
const _onicecandidate = evt => {};
