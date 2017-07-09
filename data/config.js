// GM stuff

/**页面一些配置*/
let CONFIG = {};

// 给资源统一添加版本
var RESOURCE_VERSION = {};
let re1s_keys = Object.keys(RES);
for(let i = 0; i < res_keys.length; i++) {
  let key = res_keys[i];
  let res_arr = RES[key];
  for(var j = 0; j < res_arr.length; j++) {
    var url = res_arr[j].url;
    var type = res_arr[j].type;
    RESOURCE_VERSION[url] = window.CDN_VERSION || '';

    // 图集资源对应图片没有在res中, 这里需要一个个补上加上
    if(type != Laya.Loader.XML && type != Laya.Loader.ATLAS) {
      continue;
    }
    let img_url = url.split('.')[0] + '.png';
    RESOURCE_VERSION[img_url] = window.CDN_VERSION || '';
  }
}

GM.game_resource_version = RESOURCE_VERSION;