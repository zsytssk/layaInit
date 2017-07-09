function initStage() {
  Laya.init(1334, 750, Laya.WebGL); //初始化引擎
  // Laya.init(1334, 750); //初始化引擎
  Laya.URL.basePath = GM.game_cdn_url; // Laya 寻找图片的基本路劲
  Laya.URL.version = GM.game_resource_version; // 资源的版本
  Laya.stage.alignH = Laya.Stage.ALIGN_CENTER; //横向居中
  Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE; //竖向居中
  Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL; //显示方式横屏
  Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH; //缩放显示全部
  if(zutil.detectModel('showStat')) {
    Laya.Stat.show(0, 0);
  }
}
initStage();
var app = new AppCtrl();
app.init();