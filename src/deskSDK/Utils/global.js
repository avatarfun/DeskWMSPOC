export function init() {
  let resp = POC.Operations.getExistingCredentials();
  showResp('credentials', JSON.stringify(resp));
  console.log(resp);
  const {
    anonName,
    anonId
  } = POC.Operations.getExistingRegisteredUserDetails();
  anonName && (document.getElementById('userName').value = anonName);
  anonId && registerWMS();

  //   loadWMS();
}
// export function loadWMS() {
//   POC.Operations.loadWMS().then(resp => {
//     console.log(`Wms loaded${resp}`);
//     const { anonName } = POC.Operations.getExistingRegisteredUserDetails();
//     anonName && (document.getElementById('userName').value = anonName);
//   });
// }
export function registerWMS() {
  const userName = document.getElementById('userName').value;

  POC.Operations.registerWMS(userName).then(resp => {
    console.log(`Wms loaded${resp}`);
  });
}
export function createNewCredentials() {
  POC.Operations.getSTUN_TURNCredentials().then(resp => {
    showResp('credentials', JSON.stringify(resp));
  });
}
export function showResp(id, resp) {
  document.getElementById(id).innerText = resp;
}
export function getUserMedia() {
  return POC.Operations.getUserMediaPermission();
}

export function makeCall() {
  POC.Operations.makeCall();
}

export default (global = {
  init,
  //   loadWMS,
  registerWMS,
  createNewCredentials,
  showResp,
  getUserMedia,

  makeCall
});
