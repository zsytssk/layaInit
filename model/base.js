/**
 * 所有的Model的基类, 上面绑定基本对相应的ctrl绑定取消绑定的处理
 * @class BaseModel
 * @extends {BaseEvent}
 */
class BaseModel extends BaseEvent {
    constructor() {
        super();
        this.ctrl = null;
        this.name = 'base_model';
    }
    /**会在ctrl bindModel 自动运行*/
    bindCtrl(ctrl) {
        this.ctrl = ctrl;
    }
    unBindCtrl() {
        this.ctrl = null;
    }
    init() { }
    /**去除所有的事件, 取消绑定ctrl*/
    destroy() {
        this.trigger(CMD.global_destroy);
        super.destroy();
        if (this.ctrl) {
            this.unBindCtrl();
        }
    }
}
