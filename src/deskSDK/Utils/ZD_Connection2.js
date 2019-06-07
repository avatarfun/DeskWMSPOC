import { VIDEO_OFFER, VIDEO_ANSWER, NEW_ICE_CANDIDATE } from './Constants';
import SignalingServer from './SignalingServer';
let _userId;

let myPeerConnection = undefined;
let remotePeerConnection = undefined;
let callRefId = 'AvatarTest1';
let mediaConstraints = {
  audio: true, // We want an audio track
  video: true // ...and we want a video track
};
let _iceServerlist = {};
const ZD_Connection2 = {
  setIceServerList(iceServerlist) {
    _iceServerlist = iceServerlist;
  },
  setUserId(userId) {
    _userId = userId;
  },
  handleSignalMessage(msg) {
    const { action } = msg;
    if (action == NEW_ICE_CANDIDATE) {
    } else if (action == VIDEO_OFFER) {
      answerCall(_iceServerlist, msg);
    } else if (action == VIDEO_ANSWER) {
      console.log(msg);
      onAnswer(msg);
      debugger;
    }
  },
  hangUpCall() {
    hangUpCall();
  },
  makeCall(anonId) {
    makeCall(_iceServerlist, anonId);
  }
};
export default ZD_Connection2;

function makeCall(iceServerlist, userId) {
  _userId = userId;
  myPeerConnection = createPeerConnection(iceServerlist);
  navigator.mediaDevices
    .getUserMedia(mediaConstraints)
    .then(localStream => {
      document.getElementById('local_video').srcObject = localStream;
      localStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, localStream));
    })
    .then(() => {
      myPeerConnection
        .createOffer()
        .then(offer => myPeerConnection.setLocalDescription(offer))
        .then(() => {
          const msg = {
            callRefId: callRefId,
            userId: _userId,
            action: VIDEO_OFFER,
            sdp: myPeerConnection.localDescription
          };
          SignalingServer.send(msg);
        })
        .catch(reportError);
    })
    .catch(handleGetUserMediaError);
}
function answerCallanswerCall(_iceServerlist, msg) {
  myPeerConnection = createPeerConnection(iceServerlist);
  let desc = new RTCSessionDescription(msg.sdp);
  myPeerConnection
    .setRemoteDescription(desc)
    .then(() => myPeerConnection.createAnswer())
    .then(answer => myPeerConnection.setLocalDescription(answer))
    .then(() => {
      const msg = {
        callRefId: callRefId,
        userId: _userId,
        action: VIDEO_ANSWER,
        sdp: myPeerConnection.localDescription
      };
      SignalingServer.send(msg);
    })
    .catch(handleGetUserMediaError);
}
//when another user answers to our offer
function onAnswer(msg) {
  myPeerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
}

function createPeerConnection(iceServerlist) {
  let myPeerConnection = new RTCPeerConnection(iceServerlist);
  myPeerConnection.onicecandidate = handleICECandidateEvent;
  return myPeerConnection;
}

//Error Handling Started
function handleGetUserMediaError(e) {
  switch (e.name) {
    case 'NotFoundError':
      alert(
        'Unable to open your call because no camera and/or microphone' +
          'were found.'
      );
      break;
    case 'SecurityError':
    case 'PermissionDeniedError':
      // Do nothing; this is the same as the user canceling the call.
      break;
    default:
      alert(`Error opening your camera and/or microphone: ${e.message}`);
      break;
  }

  closeVideoCall();
}
function reportError(err) {
  console.log(err);
}
//Error Handling Ended

//setup ice handling
//when the browser finds an ice candidate we send it to another peer
const handleICECandidateEvent = event => {
  if (event.candidate) {
    const msg = {
      callRefId: callRefId,
      userId: _userId,
      action: NEW_ICE_CANDIDATE,
      candidate: event.candidate
    };
    SignalingServer.send(msg);
  }
};
