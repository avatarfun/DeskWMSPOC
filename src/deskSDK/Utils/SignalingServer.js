import { notifyP2PMessage } from '../API/APIActions';
const SignalingServer = {
  send(msg) {
    return notifyP2PMessage(JSON.stringify(msg));
  }
};
export default SignalingServer;
