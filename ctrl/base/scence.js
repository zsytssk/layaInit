/**
 * 场景控制器eg: hall room ...
*/
class SceneCtrl extends NodeCtrl {
    constructor(view_class) {
        super(view_class);
        this.display_style = 'on_box';
        this.load_style = 'show_loading';
        this.is_inited = false;
    }
    init() { }
    /** 进入场景
     * @param callback 返回函数
    */
    enter(callback) {
        let callLater = () => {
            if (!this.is_inited) {
                this.initView();
                if (isFunc(callback)) {
                    callback();
                }
                this.is_inited = true;
            }
            this.show();
        };
        this.loadRes(callLater);
    }
    leave() {
        if (!this.is_inited) {
            return;
        }
        /**等到把loading显示出来在执行离开程序*/
        this.afterShowLoad(() => {
            this.hide();
            Laya.stage.off(Laya.Event.RESIZE, this, this.resize, false);
            this.destroy();
        });
    }
    initLink() {
    }
    ;
    initEvent() {
        this.on(CMD.global_resize, () => {
            this.resize();
        });
    }
    /** 页面大小变化时 页面内容始终居中 */
    resize() {
        let view = this.view;
        if (!view) {
            return true;
        }
        view.y = (Laya.stage.height - view.height) / 2;
    }
    /**检测登录*/
    checkLogin() {
        let app = zutil.queryClosest(this, 'name:app');
        return app.checkUserLogin();
    }
    /**等到把loading显示出来在执行离开程序, 用于离开场景之前必须要将场景切换动画显示出来*/
    afterShowLoad(callback) {
        let app = zutil.queryClosest(this, 'name:app');
        let load_ctrl = zutil.getElementsByName(app, 'load')[0];
        load_ctrl.show(callback);
    }
}
