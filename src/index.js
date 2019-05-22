// import { default as POC } from './deskSDK/impl/way1';
import { default as POC } from './deskSDK/impl/way2';
import * as global from './deskSDK/Utils/global.js';
window.POC = POC;

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
