class PopWrapCtrl extends NodeCtrl {
  constructor() {
    super(new Laya.Sprite());
    this.name = 'pop_wrap';
    this.is_inited = false;
  }
  init(callback) {
    if (!this.is_inited) {
      this.loadRes(() => {
        this.initLink();
        this.is_inited = true;
        if (isFunc(callback)) {
          callback();
        }
      });
      return;
    }
    if (isFunc(callback)) {
      callback();
    }
  }
  initLink() {

    let alert_ctrl = new AlertCtrl();
    this.addChild(alert_ctrl);
    alert_ctrl.init();

    // 弹层不再穿透
    this.view.mouseEnabled = true;
    this.view.mouseThrough = false;
  }
  initEvent() {}
  enter(callback) {
    this.init(callback);
  }
  leave() {}
}