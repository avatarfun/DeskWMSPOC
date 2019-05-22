let pc = undefined;
const ZD_Connection = {
  init(iceServerlist) {
    pc = new RTCPeerConnection(iceServerlist);
    pc.onicecandidate = this.addcandidate;
    pc.onnegotiationneeded = _onnegotiationneeded;
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
  ontrack(evt) {},
  addcandidate(evt) {
    console.log(evt);
  }
};
export default ZD_Connection;
const _onnegotiationneeded = async evt => {
  debugger;
  // try {
  //   await pc.setLocalDescription(await pc.createOffer());
  //   ZD_Connection.createOffer()
  //     .then(ZD_Connection.setLocalDescription)
  //     .catch(err => console.log(err));
  //   // signaling.send({ desc: pc.localDescription });
  // } catch (err) {
  //   console.error(err);
  // }
};
