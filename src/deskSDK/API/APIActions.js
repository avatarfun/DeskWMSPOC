import RequestAPI from './RequestAPI';
const providerDomain = ''; //'https://rajesh-zt35.tsi.zohocorpin.com:8443';

export function getCredentials(userId) {
  const actionUrl = `${providerDomain}/support/PublicCallAction.do?action=getCredentials&userId=${userId}`;
  return RequestAPI(actionUrl).get();
}
export function notifyP2PMessage(userId, messageType, message) {
  const actionUrl = `${providerDomain}/support/PublicCallAction.do?action=notifyP2PMessage`;
  return RequestAPI(actionUrl).post({ userId, messageType, message });
}

export function getAnonId(displayName) {
  const actionUrl = `${providerDomain}/support/PublicCallAction.do?action=getAnonId&displayName=${displayName}`;
  return RequestAPI(actionUrl).get();
}
// /**
//  * @param {*} roomId
//  */
// export function createRoom(roomId) {
//   //{"roomId":"1554708497986"}

//   const actionUrl = `${providerDomain}/roomkey/${roomId}`;
//   return RequestAPI(actionUrl).get();
// }
// /**
//  * @param {*} roomId
//  * @param {*} payload
//  */
// export function createUser(roomId, payload) {
//   const actionUrl = `${providerDomain}/roomaction/${roomId}/user/create`;
//   return RequestAPI(actionUrl).post("", payload);
// }
// export function getUser(roomId, userId) {
//   const actionUrl = `${providerDomain}/roomaction/${roomId}/user/${userId}`;
//   return RequestAPI(actionUrl).get();
// }
// export function deleteUser(roomId, userId) {
//   const actionUrl = `${providerDomain}/roomaction/${roomId}/user/delete/${userId}`;
//   return RequestAPI(actionUrl).post();
// }
