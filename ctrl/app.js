class AppCtrl extends NodeCtrl {
  constructor() {
    super(Laya.stage);
    this.link = {};
    this.is_top_ctrl = true;
    this.name = 'app';
  }
  init() {
    this.initLink();
    this.initEvent();
    this.registerFont();
    this.emit(CMD.app_inited);
  }
  initLink() {
    // socket
    let config = {
      token: GM.token,
      user_id: GM.user_id,
      public_key: GM.public_key,
      server_url: GM.websocket_url
    };
    let primus_ctrl = new PrimusCtrl(config);
    this.addChild(primus_ctrl);
    primus_ctrl.init();
    this.link.primus_ctrl = primus_ctrl;
    let ajax_ctrl = new AjaxCtrl();
    this.addChild(ajax_ctrl);
    ajax_ctrl.init();
    this.link.ajax_ctrl = ajax_ctrl;
    // router
    let router_ctrl = new RouterCtrl();
    this.addChild(router_ctrl);
    router_ctrl.init();
    this.link.router_ctrl = router_ctrl;
    let audio_ctrl = new AudioCtrl();
    this.addChild(audio_ctrl);
    audio_ctrl.init();
    this.link.audio_ctrl = audio_ctrl;
    // load
    let load_ctrl = new LoadCtrl();
    load_ctrl.zOrder = 3;
    this.addChild(load_ctrl);
    load_ctrl.init();
    this.link.load_ctrl = load_ctrl;
    // background_monitor
    let background_monitor = new BackgroundMonitor(3000);
    background_monitor.bindEnterBackground(() => {
      primus_ctrl.disConnect();
    });
    this.background_monitor = background_monitor;
    // pop
    let pop_wrap_ctrl = new PopWrapCtrl();
    pop_wrap_ctrl.zOrder = 2;
    this.addChild(pop_wrap_ctrl);
    pop_wrap_ctrl.init();
    this.link.pop_wrap_ctrl = pop_wrap_ctrl;
    this.link.tip_ctrl = zutil.getElementsByName(this, 'tip')[0];
  }
  initEvent() {
    /**控制游戏进入后台断开连接*/
    this.on(CMD.app_set_background_monitor, (data) => {
      this.setBackgroudMonitorStatus(data.status);
    });
    /**进入hall|normal|room*/
    this.on(CMD.app_goto_page, (data) => {
      this.gotoPage(data.page);
    });
    /**播放音乐*/
    this.on(CMD.global_playAudio, (data) => {
      if(typeof data == 'string') {
        this.playAudio(data);
      }
      if(data && data.audio) {
        this.playAudio(data.audio, data.sprite);
      }
    });
    Laya.stage.on(Laya.Event.RESIZE, this, () => {
      /**向下传播resize*/
      this.emit(CMD.global_resize);
    });
  }
  /** 检测用户是否登录
   * @param jump 是否跳转到登录页面
   */
  checkUserLogin(jump) {
    var self = this;
    if(!GM.userLogged && !zutil.detectModel('autoTest')) {
      if(jump) {
        location.href = GM.userLoginUrl;
      }
      return false;
    }
    return true;
  }
  /** 检测用户是否登录
   * @param jump 是否跳转到登录页面
   */
  gotoPage(page_name) {
    this.link.router_ctrl.navigateTo(page_name);
  }
  /**
   * 播放音频
   * @param audio 音频名字
   * @param sprite 音频Sprite名字, 使用合并音频中的sprite
   */
  playAudio(audio, sprite) {
    this.link.audio_ctrl.play(audio, sprite);
  }
  /**显示提示信息
   * @param msg 提示的信息
   * @param callback 点击确定按奶执行的返回函数
   */
  alert(msg, callback, type) {
    if(!this.link.alert_ctrl) {
      this.link.alert_ctrl = zutil.getElementsByName(this, 'alert')[0];
    }
    if(!this.link.alert_ctrl) {
      zutil.log('alert_ctrl 还没有被初始化');
      return;
    }
    this.link.alert_ctrl.alert(msg, callback, type);
  }
  /**显示提示信息
   * @param msg 提示的信息
   */
  tip(msg, count_down, callback, show_timer) {
    if(!this.link.tip_ctrl) {
      this.link.tip_ctrl = zutil.getElementsByName(this, 'tip')[0];
    }
    if(!this.link.tip_ctrl) {
      zutil.log('tip_ctrl 还没有被初始化');
      return;
    }
    this.link.tip_ctrl.tip(msg, count_down, callback, show_timer);
  }
  /**注册所有字体*/
  registerFont() {
    var self = this;
    let font_list = RES.font;
    for(var i = 0; i < font_list.length; i++) {
      if(!font_list[i].name) {
        continue;
      }
      var bitmapFont = new Laya.BitmapFont();
      bitmapFont.loadFont(font_list[i].url, null);
      Laya.Text.registerBitmapFont(font_list[i].name, bitmapFont);
    }
  }
  /** app 进入后台的时候 用户再次进入页面提醒用户数刷新页面
   * 设置页面退到后台监控 disable|enable
   */
  setBackgroudMonitorStatus(status) {
    let background_monitor = this.background_monitor;
    if(status == 'disable') {
      background_monitor.disabledMonitor();
      return;
    }
    background_monitor.enableMonitor();
  }
}