import {
  VIDEO_OFFER,
  VIDEO_ANSWER,
  NEW_ICE_CANDIDATE,
  HANG_UP
} from '../Utils/Constants';
import SignalingServer from '../Utils/SignalingServer';
let _userId;

let myPeerConnection = undefined;
let callRefId = 'AvatarTest1';
let mediaConstraints = {
  audio: true, // We want an audio track
  video: true // ...and we want a video track
};
let _iceServerlist = {};
const ZD_Connection1 = {
  setIceServerList(iceServerlist) {
    _iceServerlist = iceServerlist;
  },
  setUserId(userId) {
    _userId = userId;
  },
  handleSignalMessage(msg) {
    const { action } = msg;
    if (action == NEW_ICE_CANDIDATE) {
      // invite();
      handleNewICECandidateMsg(msg);
    } else if (action == VIDEO_OFFER) {
      console.log(msg);
      handleVideoOfferMsg(_iceServerlist, msg);
    } else if (action == VIDEO_ANSWER) {
      console.log(msg);
      onAnswer(msg);
    }
  },
  hangUpCall() {
    hangUpCall();
  },
  makeCall(anonId, _callRefId) {
    callRefId = _callRefId;
    invite(_iceServerlist, anonId);
  }
};
export default ZD_Connection1;

function createPeerConnection(iceServerlist, createOffer) {
  myPeerConnection = new RTCPeerConnection(iceServerlist);
  myPeerConnection.onicecandidate = handleICECandidateEvent;
  myPeerConnection.ontrack = handleTrackEvent;

  createOffer &&
    (myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent);
  myPeerConnection.onremovetrack = handleRemoveTrackEvent;
  myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
  myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
  myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  // myPeerConnection.onaddstream = addremotestream;

  return myPeerConnection;
}
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
function handleTrackEvent(event) {
  document.getElementById('received_video').srcObject = event.streams[0];
  document.getElementById('hangup-button').disabled = false;
}
const handleNegotiationNeededEvent = evt => {
  console.log(evt);
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
    .catch(err => err);
};
function handleRemoveTrackEvent(event) {
  debugger;
  let stream = document.getElementById('received_video').srcObject;
  let trackList = stream.getTracks();

  if (trackList.length == 0) {
    closeVideoCall();
  }
}
function handleICEConnectionStateChangeEvent(event) {
  switch (myPeerConnection.iceConnectionState) {
    case 'closed':
    case 'failed':
    case 'disconnected':
      closeVideoCall();
      break;
  }
}
function handleICEGatheringStateChangeEvent(event) {
  // Our sample just logs information to console here,
  // but you can do whatever you need.
}
function handleSignalingStateChangeEvent(event) {
  switch (myPeerConnection.signalingState) {
    case 'closed':
      closeVideoCall();
      break;
  }
}
function addremotestream(event) {
  try {
    // remoteVideo = document.createElement('video');
    // remoteVideo.src = window.URL.createObjectURL(event.stream);
    // remoteStream = event.stream;
    // handleTrackEvent(event);
    document.getElementById('received_video').srcObject = event.streams;
    document.getElementById('hangup-button').disabled = false;
  } catch (e) {
    console.log(`Remotevideo src error:${e}`);
  }
}
//WMS Message Handling Started
function handleNewICECandidateMsg(msg) {
  const candidate = new RTCIceCandidate(msg.candidate);

  // console.log('handleNewICECandidateMsg-myPeerConnection ', myPeerConnection);
  myPeerConnection &&
    myPeerConnection.addIceCandidate(candidate).catch(reportError);
}
//WMS Message Handling ENDED
// IMPL started --------------------------------------------------------------------------------------------
const invite = function(iceServerlist, userId) {
  _userId = userId;
  if (myPeerConnection) {
    console.log('You can\'t start a call because you already have one open!');
  } else {
    myPeerConnection = createPeerConnection(iceServerlist, true);

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(localStream => {
        document.getElementById('local_video').srcObject = localStream;
        localStream
          .getTracks()
          .forEach(track => myPeerConnection.addTrack(track, localStream));
      })
      .catch(handleGetUserMediaError);
  }
};

const handleVideoOfferMsg = function(iceServerlist, msg) {
  let localStream = null;
  const { callRefId, agentId } = msg;

  myPeerConnection = createPeerConnection(iceServerlist);
  let desc = new RTCSessionDescription(msg.sdp);
  myPeerConnection
    .setRemoteDescription(desc)
    .then(() => navigator.mediaDevices.getUserMedia(mediaConstraints))
    .then(stream => {
      localStream = stream;
      document.getElementById('local_video').srcObject = localStream;

      localStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, localStream));
    })
    .then(() => myPeerConnection.createAnswer())
    .then(answer => myPeerConnection.setLocalDescription(answer))
    .then(() => {
      const msg = {
        callRefId: callRefId,
        userId: _userId,
        agentId: agentId,
        action: VIDEO_ANSWER,
        sdp: myPeerConnection.localDescription
      };
      SignalingServer.send(msg);
    })
    .catch(handleGetUserMediaError);
};
//when another user answers to our offer
function onAnswer(msg) {
  myPeerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
}

// const handleVideoOfferMsg = function(iceServerlist, msg) {
//   let localStream = null;
//   remotePeerConnection = createPeerConnection(iceServerlist);
//   let desc = new RTCSessionDescription(msg.sdp);
//   remotePeerConnection
//     .setRemoteDescription(desc)
//     .then(() => navigator.mediaDevices.getUserMedia(mediaConstraints))
//     .then(stream => {
//       localStream = stream;
//       document.getElementById('local_video').srcObject = localStream;

//       localStream
//         .getTracks()
//         .forEach(track => remotePeerConnection.addTrack(track, localStream));
//     })
//     .then(() => remotePeerConnection.createAnswer())
//     .then(answer => remotePeerConnection.setLocalDescription(answer))
//     .then(() => {
//       const msg = {
//         callRefId: callRefId,
//         userId: _userId,
//         action: VIDEO_ANSWER,
//         sdp: remotePeerConnection.localDescription
//       };
//       SignalingServer.send(msg);
//     })
//     .catch(handleGetUserMediaError);
// };
function hangUpCall() {
  closeVideoCall();
  SignalingServer.send({
    callRefId: callRefId,
    action: HANG_UP
  });
}
function closeVideoCall() {
  debugger;
  let remoteVideo = document.getElementById('received_video');
  let localVideo = document.getElementById('local_video');

  if (myPeerConnection) {
    myPeerConnection.ontrack = null;
    myPeerConnection.onremovetrack = null;
    myPeerConnection.onremovestream = null;
    myPeerConnection.onicecandidate = null;
    myPeerConnection.oniceconnectionstatechange = null;
    myPeerConnection.onsignalingstatechange = null;
    myPeerConnection.onicegatheringstatechange = null;
    myPeerConnection.onnegotiationneeded = null;

    if (remoteVideo.srcObject) {
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    }

    if (localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(track => track.stop());
    }

    myPeerConnection.close();
    myPeerConnection = null;
  }

  remoteVideo.removeAttribute('src');
  remoteVideo.removeAttribute('srcObject');
  localVideo.removeAttribute('src');
  remoteVideo.removeAttribute('srcObject');

  document.getElementById('hangup-button').disabled = true;
}

// IMPL ENDED --------------------------------------------------------------------------------------------
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
