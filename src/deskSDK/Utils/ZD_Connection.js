let pc = undefined;
const ZD_Connection = {
  init(iceServerlist) {
    pc = new RTCPeerConnection(iceServerlist);
    pc.onicecandidate = this.addcandidate;
    return this;
  },
  addStream(stream) {
    pc.addStream(stream);
    return this;
  },
  createOffer() {
    return new Promise((_succ, _fali) => {
      pc.createOffer(_succ, _fali);
    });
  },
  createAnswer(isAudio = true, isVideo = false) {
    const sdpConstraints = {
      mandatory: { OfferToReceiveAudio: isAudio, OfferToReceiveVideo: isVideo }
    };
    return new Promise((_succ, _fali) => {
      pc.createAnswer(_succ, _fali, sdpConstraints);
    });
  },
  setLocalDescription(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
  },
  setRemoteDescription(remoteDescription) {
    //new RTCSessionDescription(offer)
    pc.setRemoteDescription(remoteDescription);
  },
  addcandidate(evt) {
    console.log(evt);
  }
};
export default ZD_Connection;
