/**弹层公共类*/
class PopCtrl extends NodeCtrl {
    constructor(view_class) {
        super(new Laya.Sprite());
        this.is_show = false;
        this.is_inited = false;
        this.show_bg = true;
        this.display_style = 'on_box';
        this.noOrder = true;
        this.show_animate = 'scale_in';
        this.hide_animate = 'scale_out';
        this.position = 'middle';
        this.link = {};
        this.hit_bg_close = true;
        this.bg_color = '#000';
        this.view_class = view_class;
    }
    init() {
        this.preInit();
    }
    /**预初始化 在加载资源之前 初始化事件 比方说show*/
    preInit() {
    }
    preparePop(callback) {
        let callLater = () => {
            if (!this.is_inited) {
                this.initView();
                this.initLink();
                this.initEvent();
                this.is_inited = true;
            }
            if (isFunc(callback)) {
                callback();
            }
        };
        this.loadRes(callLater);
    }
    enter(callback) {
        this.show(callback);
    }
    leave() {
        this.hide();
    }
    /** pop的dom结构
     * pop(Sprite): bg + popUI
    */
    initView() {
        this.initBg();
        let view = this.view;
        view.width = Laya.stage.width;
        view.height = Laya.stage.height;
        let pop_view = new this.view_class();
        this.view.addChild(pop_view);
        this.link.pop_view = pop_view;
    }
    /** 初始化背景 */
    initBg() {
        if (!this.show_bg) {
            return false;
        }
        let bg_color = this.bg_color;
        let alpha = CONFIG.pop_bg_alpha;
        // 黑色背景
        if (bg_color == 'transparent') {
            bg_color = '#000';
            alpha = 0;
        }
        let bg_ctrl = new FullScreenBgCtrl(bg_color, alpha);
        this.addChild(bg_ctrl);
        bg_ctrl.init();
        this.link.bg_ctrl = bg_ctrl;
    }
    /** 初始化快捷绑定 */
    initLink() {
        let view = this.view;
        let app = zutil.queryClosest(this, 'name:app');
        let router = zutil.getElementsByName(app, 'router')[0];
        let btn_cancel = zutil.getElementsByName(view, 'btn_cancel')[0];
        let btn_confirms = zutil.getElementsByName(view, 'btn_confirm');
        let close_list = zutil.getElementsByName(view, 'close');
        close_list.push(btn_cancel);
        close_list = close_list.concat(btn_confirms);
        this.link.router = router;
        this.link.btn_cancel = btn_cancel;
        this.link.btn_confirms = btn_confirms;
        this.link.close_list = close_list;
    }
    /** 初始化事件 */
    initEvent() {
        let router = this.link.router;
        /**页面变化所有弹出层全部关闭*/
        this.bindOtherEvent(router, CMD.router_change, () => {
            this.hide();
        });
        this.on(CMD.global_resize, () => {
            this.resize();
        });
        let close_list = this.link.close_list;
        close_list.forEach((close_item, index) => {
            if (!close_item) {
                return true;
            }
            close_item.on(Laya.Event.CLICK, this, () => {
                let trigger_btn = 'close';
                // 确定按钮的处理
                if (this.link.btn_confirms.indexOf(close_item) != -1) {
                    zutil.log('点击了 <确定> 按钮');
                    trigger_btn = 'confirm';
                }
                zutil.log('点击了 <关闭> 按钮');
                this.hide(null, trigger_btn);
            });
        });
        // 点击其他地方关闭
        this.onNode(Laya.stage, Laya.Event.CLICK, (event) => {
            if (!this.view || !this.view.displayedInStage) {
                return;
            }
            if (!this.is_show) {
                return;
            }
            /**如果有背景点击的区域不是背景 不做处理*/
            if (this.show_bg && !zutil.isClosest(event.target, this.view)) {
                return;
            }
            /**点击阴影不关闭, 默认关闭*/
            if (!this.hit_bg_close) {
                return;
            }
            /**如果点击的区域在弹层中不做处理*/
            if (zutil.isClosest(event.target, this.link.pop_view)) {
                return;
            }
            this.hide();
        });
    }
    /** 窗口自适应*/
    resize() {
        let pop_view = this.link.pop_view;
        if (!pop_view) {
            return;
        }
        let bg_ctrl = this.link.bg_ctrl;
        let screen_width = Laya.stage.width;
        let screen_height = Laya.stage.height;
        if (this.position != 'middle') {
            return true;
        }
        pop_view.pivot(pop_view.width / 2, pop_view.height / 2);
        pop_view.x = screen_width / 2;
        pop_view.y = screen_height / 2;
        /**没有背景的时候无需设置bg_ctrl.update*/
        if (!this.show_bg) {
            return;
        }
        bg_ctrl.update(screen_width, screen_height);
    }
    /** 显示 */
    show(callback) {
        let calllater = () => {
            let view = this.view;
            let pop_view = this.link.pop_view;
            let show_fn = animate[this.show_animate];
            this.setTopZorder();
            if (this.is_show) {
                return true;
            }
            this.resize();
            this.report(CMD.global_playAudio, null, { audio: 'pop_show' });
            this.trigger(CMD.global_showing);
            super.show();
            view.visible = true;
            show_fn(pop_view, null, () => {
                this.is_show = true;
                this.trigger(CMD.global_shown);
                if (callback && typeof (callback) == 'function') {
                    callback();
                }
            });
        };
        /**如果弹层还没有初始化 先enter...*/
        if (!this.is_inited) {
            this.preparePop(calllater);
        }
        else {
            calllater();
        }
    }
    /** 隐藏*/
    hide(callback, trigger_btn) {
        let view = this.view;
        let pop_view = this.link.pop_view;
        let hide_fn = animate[this.hide_animate];
        if (!this.is_show) {
            return true;
        }
        this.resize();
        this.trigger(CMD.global_hiding, { trigger_btn: trigger_btn });
        hide_fn(pop_view, null, () => {
            view.visible = false;
            this.is_show = false;
            this.zOrder = 0;
            this.trigger(CMD.global_hidden, { trigger_btn: trigger_btn });
            // 隐藏之后执行 执行
            if (callback && typeof (callback) == 'function') {
                callback();
            }
        });
    }
    /**将弹出层的层级设置为最高*/
    setTopZorder() {
        let siblings = zutil.querySiblings(this);
        let top_pop = _.max(siblings, () => {
            return this.zOrder;
        });
        if (this.zOrder <= top_pop.zOrder) {
            this.zOrder = top_pop.zOrder + 1;
        }
    }
    /** 重置*/
    reset() {
        this.is_show = false;
    }
}
