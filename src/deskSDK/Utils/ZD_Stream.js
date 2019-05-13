const ZD_Stream = {
  hasLocalStream: false,
  hasRemoteStreeam: false,
  localStream: undefined,
  remoteStream: undefined,
  updateLocalStream(stream) {
    this.localStream = stream;
    this.hasLocalStream = true;
  },
  updateRemoteStream(stream) {
    this.remoteStream = stream;
    this.hasRemoteStreeam = true;
  },
  getLocalStream() {
    return this.localStream;
  },
  getRemoteStream() {
    return this.remoteStream;
  }
};
export default ZD_Stream;
