import {
  VIDEO_OFFER,
  VIDEO_ANSWER,
  NEW_ICE_CANDIDATE
} from '../Utils/Constants';
import SignalingServer from '../Utils/SignalingServer';
let userId;
let myPeerConnection = undefined;
let callRefId = 'AvatarTest1';
let mediaConstraints = {
  audio: true, // We want an audio track
  video: true // ...and we want a video track
};
function createPeerConnection(iceServerlist) {
  if (myPeerConnection == undefined) {
    myPeerConnection = new RTCPeerConnection(iceServerlist);
    myPeerConnection.onicecandidate = _handleICECandidateEvent;
    myPeerConnection.ontrack = _handleTrackEvent;
    myPeerConnection.onnegotiationneeded = _handleNegotiationNeededEvent;
    myPeerConnection.onremovetrack = _handleRemoveTrackEvent;
    myPeerConnection.oniceconnectionstatechange = _handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = _handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = _handleSignalingStateChangeEvent;
  }
  return myPeerConnection;
}
const _handleICECandidateEvent = event => {
  if (event.candidate) {
    const msg = {
      callRefId: callRefId,
      userId: userId,
      action: NEW_ICE_CANDIDATE,
      candidate: event.candidate
    };
    SignalingServer.send(msg);
  }
};
const _handleTrackEvent = evt => {};
const _handleNegotiationNeededEvent = evt => {
  myPeerConnection
    .createOffer()
    .then(offer => myPeerConnection.setLocalDescription(offer))
    .then(() => {
      const msg = {
        callRefId: callRefId,
        userId: userId,
        action: VIDEO_OFFER,
        sdp: myPeerConnection.localDescription
      };
      SignalingServer.send(msg);
    })
    .catch(err => err);
};
const _handleRemoveTrackEvent = evt => {};
const _handleICEConnectionStateChangeEvent = evt => {};
const _handleICEGatheringStateChangeEvent = evt => {};
const _andleSignalingStateChangeEvent = evt => {};

const makeCall = (invite = function(evt, userId) {
  userId = userId;
  if (myPeerConnection) {
    console.log('You can\'t start a call because you already have one open!');
  } else {
    createPeerConnection(iceServerlist);

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(localStream => {
        document.getElementById('local_video').srcObject = localStream;
        localStream
          .getTracks()
          .forEach(track => myPeerConnection.addTrack(track, localStream));
      })
      .catch(handleGetUserMediaError => handleGetUserMediaError);
  }
});

const answerCall = (handleVideoOfferMsg = function(iceServerlist, userId, msg) {
  let localStream = null;
  createPeerConnection(iceServerlist);
  let desc = new RTCSessionDescription(msg.sdp);
  myPeerConnection
    .setRemoteDescription(desc)
    .then(() => navigator.mediaDevices.getUserMedia(mediaConstraints))
    .then(stream => {
      localStream = stream;
      document.getElementById('remote_video').srcObject = localStream;

      localStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, localStream));
    })
    .then(() => myPeerConnection.createAnswer())
    .then(answer => myPeerConnection.setLocalDescription(answer))
    .then(() => {
      const msg = {
        callRefId: callRefId,
        userId: userId,
        action: VIDEO_ANSWER,
        sdp: myPeerConnection.localDescription
      };
      SignalingServer.send(msg);
    })
    .catch(handleGetUserMediaError => handleGetUserMediaError);
});

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
function handleNewICECandidateMsg(msg) {
  let candidate = new RTCIceCandidate(msg.candidate);

  myPeerConnection.addIceCandidate(candidate).catch(reportError);
}
