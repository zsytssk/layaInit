class AlertCtrl extends PopCtrl {
    constructor() {
        super(ui.pop.alertUI);
        this.name = 'alert';
    }
    /**预初始化 在加载资源之前 初始化事件 比方说show*/
    preInit() {
        this.preparePop();
    }
    initLink() {
        super.initLink();
        let view = this.view;
        let label_view = zutil.getElementsByName(view, 'label')[0];
        let normal_footer = zutil.getElementsByName(view, 'normal')[0];
        let leave_room_footer = zutil.getElementsByName(view, 'leave_room')[0];
        this.link.label_view = label_view;
        this.link.leave_room_footer = leave_room_footer;
        this.link.normal_footer = normal_footer;
    }
    initEvent() {
        super.initEvent();
        this.on(CMD.global_hidden, () => {
            this.reset();
        }, false);
    }
    /**显示提示信息
     * @param msg 提示的信息
     * @param callback 点击确定按奶执行的返回函数
    */
    alert(msg, callback, type) {
        if (!msg) {
            zutil.log(`haven\'t msg to alert!`);
            return;
        }
        let label_view = this.link.label_view;
        let leave_room_footer = this.link.leave_room_footer;
        let normal_footer = this.link.normal_footer;
        label_view.text = msg;
        if (type == 'leave') {
            normal_footer.visible = false;
            leave_room_footer.visible = true;
        }
        else {
            normal_footer.visible = true;
            leave_room_footer.visible = false;
        }
        this.once(CMD.global_hidden, (data) => {
            if (data.trigger_btn == 'confirm' && isFunc(callback)) {
                callback();
            }
        });
        this.show();
    }
    reset() {
        super.reset();
        let label_view = this.link.label_view;
        let normal_footer = this.link.normal_footer;
        let normal_footer_siblings = zutil.querySiblings(normal_footer);
        /**显示正常的背景隐藏其他所有背景*/
        normal_footer.visible = true;
        for (let i = 0; i < normal_footer_siblings.length; i++) {
            normal_footer_siblings[i].visible = false;
        }
        label_view.text = '';
    }
}
