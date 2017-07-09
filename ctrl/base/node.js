/** 所有页面节点ctrl的基础类 */
class NodeCtrl extends BaseCtrl {
    /** 所有页面节点ctrl的基础类
     * @param view_class 是构造函数将其保存到view_class中
     * @param view_class 不是直接赋值给view
    */
    constructor(view_class) {
        super();
        /** 两种方式:
         * show_progress:>显示loading页面, 进度条变化;
         * in_background:>在后台加载
        **/
        this.load_style = 'in_background';
        this.display_style = 'in_box';
        /**view 不在addChild进入其他的ctrl时改变位置*/
        this.fixed_view = false;
        /**父ctrl*/
        this.parent = null;
        /**子ctrl*/
        this.childs = [];
        if (typeof (view_class) == 'function') {
            // 构造函数
            this.view_class = view_class;
        }
        else {
            // 普通节点
            this.view = view_class;
        }
    }
    initView() {
        // 如果this.view未定义, 用view_class创建ui
        if (!this.view && this.view_class && typeof (this.view_class) == 'function') {
            this.view = new this.view_class();
        }
    }
    ;
    /** 显示view*/
    show() {
        if (this.display_style == 'in_box') {
            this.view.visible = true;
        }
        else {
            this.parent.addChildView(this);
        }
    }
    /** 隐藏View*/
    hide() {
        if (this.display_style == 'in_box') {
            this.view.visible = false;
        }
        else {
            this.parent.view.removeChild(this.view);
        }
    }
    /** 添加childCtrl */
    addChild(childCtrl) {
        super.addChild(childCtrl);
        if (childCtrl instanceof NodeCtrl) {
            // 将他的view添加到父类的view中
            if (childCtrl.display_style != 'on_box') {
                // 将他的view从父类的view中去除
                this.addChildView(childCtrl);
            }
        }
    }
    /** 删除childCtrl */
    removeChild(childCtrl) {
        // 将他的view从父类的view中去除
        if (childCtrl instanceof NodeCtrl) {
            this.removeChildView(childCtrl);
        }
        super.removeChild(childCtrl);
    }
    /** 在自己的view中 添加子类的view*/
    addChildView(childCtrl) {
        // childCtrl 不是this的子Ctrl下面不做处理
        let index = this.childs.indexOf(childCtrl);
        if (index == -1) {
            return;
        }
        // view已经添加进去, 不用处理
        if (zutil.isClosest(childCtrl.view, this.view)) {
            return;
        }
        // fixed_view 专门钉死view的位置
        if (childCtrl.fixed_view) {
            return;
        }
        if (!childCtrl.noOrder) {
            childCtrl.view.zOrder = index;
        }
        else {
            childCtrl.view.zOrder = null;
        }
        this.view.addChild(childCtrl.view);
        this.refreshChildViewOrder();
    }
    /** 在自己的view中 移除子类的view*/
    removeChildView(childCtrl) {
        this.view.removeChild(childCtrl.view);
    }
    set zOrder(zOrder) {
        super.zOrder = zOrder;
        if (this.parent) {
            this.parent.refreshChildViewOrder();
        }
    }
    get zOrder() {
        return super.zOrder;
    }
    /**重新刷新子元素view的zOrder*/
    refreshChildViewOrder() {
        let childs = this.childs;
        for (let i = 0; i < childs.length; i++) {
            let child = childs[i];
            if (child.view) {
                let view = child.view;
                view.zOrder = i;
            }
        }
    }
    /** 添加资源 */
    loadRes(callback) {
        let app_ctrl = zutil.queryClosest(this, 'name:app');
        let load_ctrl = app_ctrl.link.load_ctrl;
        load_ctrl.load(this, callback);
    }
    /** 获得节点对应资源的状态 */
    get resource_status() {
        let name = this.name;
        let result = null;
        for (let i = 0; i < RESMAP.length; i++) {
            if (RESMAP[i].name == name) {
                return RESMAP[i].resource_status;
            }
        }
        return result;
    }
    /** 设置节点对应资源的状态 */
    set resource_status(status) {
        let name = this.name;
        let result = null;
        for (let i = 0; i < RESMAP.length; i++) {
            if (RESMAP[i].name == name) {
                RESMAP[i].resource_status = status;
            }
        }
    }
    /**删除View, 从父类Ctrl中删除自己 删除model 删除link*/
    destroy() {
        super.destroy();
        if (this.view) {
            this.view.destroy(true);
            this.view = null;
        }
    }
}
