import Storage from './Storage';
const userWMSInfo = new Storage('userWMSInfo');
let _isWMSInit = false;
const ZD_WMS_handler = {
  registerWMS(anonId, anonName) {
    const _cbk = () => {
      userWMSInfo.set('anonId', anonId);
      userWMSInfo.set('anonName', anonName);
      WmsLite.setNoDomainChange();
      // WmsLite.allowCrossOrigin('https://rajesh-zt35.tsi.zohocorpin.com:8443');
      WmsLite.setWmsContext('_wms');
      WmsLite.registerAnnon('ZS', anonId, anonName);
      return true;
    };
    return new Promise((_succ, _fail) =>
      _isWMSInit ? _cbk() : _init().then(_cbk)
    );
  },
  getAnonDetails() {
    const { anonId, anonName } = userWMSInfo.getStorage();
    return { anonId, anonName };
  }
};

const _init = () =>
  new Promise((_succ, _fail) => {
    WmsLite.serverup = userInfo => {
      userInfo && userWMSInfo.set('name', userInfo);
      console.log('server up');
    };
    WmsLite.serverdown = () => {
      console.log('serverdown arguments ', arguments);
    };
    _isWMSInit = true;
    _succ();
  });
export default ZD_WMS_handler;
