// import { default as POC } from './deskSDK/impl/way1';
import { default as POC } from './deskSDK/impl/way2';
// import { default as POC } from './deskSDK/impl/way3';
// import { default as POC1 } from './deskSDK/impl/way1';
import * as global from './deskSDK/Utils/global.js';
window.POC = POC;
// window.POC1 = POC1;
const exportToWindow = function(moduleObjArr) {
  exportToObject(window, moduleObjArr);
};

const exportToObject = function(target, modules) {
  modules.forEach(module => {
    let keys = Object.keys(module);
    keys.forEach(key => {
      target[key] = module[key];
    });
  });
};
exportToWindow([global]);
