/** ctrl 的基本类, 所有的事件处理类 */
class BaseCtrl extends BaseEvent {
    constructor() {
        super();
        this.name = 'base_ctrl';
        /**primus 需要频繁传递, 如果每次都去寻找primus很消耗性能, 需要绑定这这里*/
        this.local_link = {};
        this.hook_node_funs = [];
        this.childs = [];
        this.parent = null;
        /** 绑定的事件处理方法 */
        this.model = null;
        /**在还没有绑定model的时候将  需要和model绑定的事件储存在这里 等到和model绑定之后再去执行*/
        this.on_model_save = {};
        /**保存laya.utils.TimeLine*/
        this.timeline_list = [];
        /**在父元素中的order, 越大余额靠后, 用来处理场景切换, pop始终在最上面*/
        this._zOrder = 0;
        this.link = {};
        /** 是否是最顶级的ctrl */
        this.is_top_ctrl = false;
    }
    get ctrl_path() {
        return zutil.getCtrlTreePath(this);
    }
    ;
    /** ctrl 是不是放在ctrl树中 */
    get in_ctrl_tree() {
        let top_ctrl = zutil.queryTop(this);
        if (top_ctrl.is_top_ctrl) {
            return true;
        }
        return false;
    }
    ;
    /** 广播消息, 事件先找到最顶级的ctrl(包括自己)然后向下查找ctrl_path, 找到就继续相应的绑定函数
     * @param event_name 事件名称
     * @param destination 目标ctrl在目录树中的绝对地址
     * @param data 要传递的数据
     */
    broadcast(event_name, destination, data) {
        if (!this.in_ctrl_tree) {
            return;
        }
        let top_ctrl = zutil.queryTop(this);
        top_ctrl.passEmitEvent(event_name, destination, data);
    }
    /** 发射事件, 传给当前ctrl的子集 包括自己
     * @param event_name 事件名称
     * @param destination 目标ctrl在目录树中的绝对地址
     * @param data 要传递的数据
     */
    emit(event_name, destination, data) {
        if (!this.in_ctrl_tree) {
            return;
        }
        /** 消息传给ctrl*/
        this.passEmitEvent(event_name, destination, data);
    }
    /** 报告事件, 传给当前ctrl的父级 包括自己
     * @param event_name 事件名称
     * @param destination 目标ctrl在目录树中的绝对地址
     * @param data 要传递的数据
     */
    report(event_name, destination, data) {
        if (!this.in_ctrl_tree) {
            return;
        }
        /** 消息传给ctrl*/
        this.passReportEvent(event_name, destination, data);
    }
    /** 向下传递事件
     * @param event_name 事件名称
     * @param ctrl_path:string 目标ctrl目录树中的地址,类式app::pop_wrap::alert
     * 如果是baseCtrl类, 就直接调用ctrl的相应方法
     * @param data 要传递的数据
    */
    passEmitEvent(event_name, ctrl_path, data) {
        // 如果ctrl不再目录树中, 无需做处理
        if (!this.in_ctrl_tree) {
            zutil.logAll(`${this.name} not in ctrl tree`);
            return true;
        }
        // 如果没有指定目标ctrl_path, 就是向所有子节点的节点广播
        if (!ctrl_path) {
            this.callBindFunc(event_name, data, true);
            for (let i = 0; i < this.childs.length; i++) {
                this.childs[i].passEmitEvent(event_name, ctrl_path, data);
            }
            return true;
        }
        // ctrl_path是baseCtrl, 直接触发事件
        if (ctrl_path instanceof BaseCtrl) {
            ctrl_path.callBindFunc(event_name, data, false);
            return true;
        }
        // 目的地是字符串
        if (typeof ctrl_path != 'string') {
            return;
        }
        if (ctrl_path.indexOf(this.ctrl_path) == -1) {
            return;
        }
        /**将app::pop_wrap::alert 变成
         * name:pop_wrap name:alert..
        */
        let ctrl_path_arr = ctrl_path.replace(this.ctrl_path + '::', '').split('::').map((item, index) => { return 'name:' + item; }).join(' ');
        let ctrls = zutil.queryElements(this, ctrl_path_arr);
        if (ctrls.length == 0) {
            zutil.log(`can't find ctrl for ${ctrl_path}`);
        }
        for (let i = 0; i < ctrls.length; i++) {
            ctrls[i].callBindFunc(event_name, data, false);
        }
    }
    /** 向上传递事件
     * @param event_name 事件名称
     * @param ctrl_path:string 目标ctrl目录树中的地址,类式app::pop_wrap::alert
     * 如果是baseCtrl类, 就直接调用ctrl的相应方法
     * @param data 要传递的数据
    */
    passReportEvent(event_name, ctrl_path, data) {
        // 如果ctrl不再目录树中, 无需做处理
        if (!this.in_ctrl_tree) {
            return true;
        }
        // 如果没有指定目标ctrl_path, 就是向所有的节点广播
        if (!ctrl_path) {
            this.callBindFunc(event_name, data, true);
            if (!this.is_top_ctrl) {
                this.parent.passReportEvent(event_name, ctrl_path, data);
            }
            return true;
        }
        // ctrl_path是baseCtrl, 而不是字符串
        if (ctrl_path instanceof BaseCtrl) {
            ctrl_path.callBindFunc(event_name, data, false);
            return true;
        }
        // 目的地是字符串
        if (typeof (ctrl_path) == 'string') {
            let this_ctrl_path = this.ctrl_path;
            /** 当前的ctrl就是event_name制定的ctrl */
            if (ctrl_path == this_ctrl_path) {
                this.callBindFunc(event_name, data, false);
                return true;
            }
            if (this_ctrl_path.indexOf(ctrl_path) != -1) {
                if (!this.is_top_ctrl) {
                    this.parent.passReportEvent(event_name, ctrl_path, data);
                }
            }
        }
    }
    /** 执行event_name*/
    /**
     * @param event_name 事件名称
     * @param data 要传递的数据
     * @param  is_broadcast 事件是否广播, 如果是就没有必要消失提示:>has no bind listener
    */
    callBindFunc(event_name, data, is_broadcast) {
        /**直接发送而且不是不是broadcast的发出提示
         * 如果直接使用trigger就没有这个提示了
        */
        if (!this.hook_funs[event_name]) {
            if (!is_broadcast) {
                zutil.log(`ctrl://${this.ctrl_path} has no bind listener for event:${event_name}!`);
            }
            return;
        }
        this.trigger(event_name, data);
    }
    /**
     * 发送信息到primus
     * @param event_name 事件名称
     * @param data 传过去的数据
     * @param callback primus 返回函数的处理
     */
    emitToPrimus(event_name, data, callback) {
        // 如果ctrl不再目录树中, 无需做处理
        if (!this.in_ctrl_tree) {
            return;
        }
        if (!this.local_link.app) {
            this.local_link.app = zutil.queryClosest(this, 'name:app');
        }
        let app = this.local_link.app;
        if (!app) {
            zutil.logAll(`can't find app!`);
            return;
        }
        if (!this.local_link.primus_ctrl) {
            this.local_link.primus_ctrl = zutil.getElementsByName(app, 'primus')[0];
        }
        let primus_ctrl = this.local_link.primus_ctrl;
        if (!primus_ctrl) {
            zutil.logAll(`can't find primus_ctrl!`);
            return;
        }
        let ctrl_path = this.ctrl_path;
        primus_ctrl.emitToServer(event_name, data);
        if (isFunc(callback)) {
            this.bindOtherEvent(primus_ctrl, event_name, callback, true);
        }
    }
    /**
     * 发送信息到ajax
     * @param event_name 事件名称
     * @param data 传过去的数据
     * @param callback ajax 返回函数的处理
     */
    emitToAjax(event_name, data, callback) {
        // 如果ctrl不再目录树中, 无需做处理
        if (!this.in_ctrl_tree) {
            return;
        }
        let app;
        app = zutil.queryClosest(this, 'name:app');
        if (!app) {
            return;
        }
        let ajax_ctrl = zutil.getElementsByName(app, 'ajax')[0];
        if (!ajax_ctrl) {
            return;
        }
        let ctrl_path = this.ctrl_path;
        ajax_ctrl.bindRequestData(event_name, ctrl_path, data, isFunc(callback));
        if (isFunc(callback)) {
            this.on(event_name, callback, true);
        }
        if (zutil.detectModel('autoTest')) {
            this.broadcast(event_name, 'app::test', data);
        }
    }
    /**
     * 在primus_ctrl注册接收事件的处理函数
     * @param event_name 接收事件
     * @param callback 返回函数的处理
     * @param once 是否执行一次
     */
    onPrimusRecieve(event_name, callback, once) {
        if (!this.in_ctrl_tree) {
            return;
        }
        if (!isFunc(callback)) {
            zutil.log(`no callback for ${event_name}`);
            return;
        }
        let app = zutil.queryClosest(this, 'name:app');
        if (!app) {
            return;
        }
        let primus_ctrl = zutil.getElementsByName(app, 'primus')[0];
        if (!primus_ctrl) {
            return;
        }
        this.bindOtherEvent(primus_ctrl, event_name, callback, once);
    }
    /** 添加childCtrl */
    addChild(childCtrl) {
        let childs_list = this.childs;
        // 如果只有一个元素, 不需要这些只需要下面的操作
        if (!childs_list.length) {
            childs_list.push(childCtrl);
            childCtrl.parent = this;
            return;
        }
        else {
            // 用zOrder来定位this在父元素的childs中的顺序
            for (let i = childs_list.length - 1; i >= 0; i--) {
                let child = childs_list[i];
                if (child.zOrder <= childCtrl.zOrder) {
                    childs_list.splice(i + 1, 0, childCtrl);
                    break;
                }
                if (i == 0) {
                    childs_list.unshift(childCtrl);
                }
            }
        }
        childCtrl.parent = this;
    }
    /** 删除childCtrl */
    removeChild(childCtrl) {
        let child_index = this.childs.indexOf(childCtrl);
        if (child_index == -1) {
            return;
        }
        this.childs.splice(child_index, 1);
    }
    removeChildren() {
        for (let len = this.childs.length, i = len - 1; i >= 0; i--) {
            this.childs[i].destroy();
        }
        this.childs = [];
    }
    set zOrder(zOrder) {
        let parent = this.parent;
        /**如果元素有父元素, 将元素按zorder顺序放在父元素childs中*/
        if (parent) {
            let childs = parent.childs;
            let index = childs.indexOf(this);
            if (index == -1) {
                zutil.log(`error, this parent childs don't contain this;`);
                return;
            }
            childs.splice(index, 1);
            for (let i = childs.length - 1; i >= 0; i--) {
                let child = childs[i];
                if (child.zOrder <= zOrder) {
                    childs.splice(i + 1, 0, this);
                    break;
                }
                // 如果没有任何元素的zOrder小于当前元素 放在第一位
                if (i == 0) {
                    childs.unshift(this);
                }
            }
        }
        this._zOrder = zOrder;
    }
    get zOrder() {
        return this._zOrder;
    }
    getChildAt(index) {
        if (index >= this.childs.length) {
            return null;
        }
        return this.childs[index];
    }
    getChildByName(name) {
        let childs_ctrl = this.childs;
        for (let i = 0; i < childs_ctrl.length; i++) {
            if (childs_ctrl[i].name == name) {
                return childs_ctrl[i];
            }
        }
        return null;
    }
    /** 获得ctrl子元素的个数 */
    get numChildren() {
        return this.childs.length;
    }
    /**取消所有需要延迟执行的函数*/
    clearTimeout() {
        super.clearTimeout();
        for (let i = 0; i < this.timeline_list.length; i++) {
            this.timeline_list[i].destroy();
        }
        this.timeline_list = [];
    }
    /**将ctrl和model相互绑定*/
    bindModel(model) {
        this.model = model;
        this.bindSaveModelEvent();
        model.bindCtrl(this);
    }
    unBindModel() {
        this.model = null;
    }
    /** 在model上面绑定事件处理函数*/
    onModel(event_name, callback) {
        let model = this.model;
        if (!this.model) {
            zutil.logAll(`${this.name}Ctrl hasn't bind a model;`);
            this.on_model_save[event_name] = callback;
            return;
        }
        this.bindOtherEvent(this.model, event_name, callback);
    }
    bindSaveModelEvent() {
        for (let event_name in this.on_model_save) {
            let callback = this.on_model_save[event_name];
            this.bindOtherEvent(this.model, event_name, callback);
        }
    }
    /**统一在节点上绑定事件, destroy时候统一清除*/
    onNode(node, type, listener, once = false) {
        if (!node || !(node instanceof Laya.Node)) {
            zutil.log('bind node not exist!');
            return;
        }
        if (!type) {
            zutil.log('bind event not exist!');
            return;
        }
        if (!listener || typeof (listener) != 'function') {
            zutil.log('bind function not exist!');
            return;
        }
        if (once) {
            node.once(type, this, listener);
        }
        else {
            node.on(type, this, listener);
        }
        let off = () => {
            node.off(type, this, listener);
        };
        this.hook_node_funs.push({
            Node: node,
            event: type,
            off: off
        });
    }
    /**
     * 清除所有在node上绑定事件
     * @param node 要清除在node上绑定的事件
     */
    offNode(node) {
        if (!node) {
            return;
        }
        let hook_funs = this.hook_node_funs;
        for (let len = hook_funs.length, i = len - 1; i >= 0; i--) {
            let hook_item = hook_funs[i];
            let Node = hook_item.Node;
            let off = hook_item.off;
            if (node != Node) {
                continue;
            }
            off();
            hook_funs.splice(i, 1);
        }
    }
    /**清除在所有node上绑定事件*/
    offAllNode() {
        let hook_funs = this.hook_node_funs;
        for (let len = hook_funs.length, i = len - 1; i >= 0; i--) {
            let hook_item = hook_funs[i];
            hook_item.off();
            hook_funs.splice(i, 1);
        }
        this.hook_node_funs = [];
    }
    /** 取消所有的事件绑定 从父类Ctrl中删除自己 删除model 删除link*/
    destroy() {
        // 取消所有的事件绑定
        super.destroy();
        // 清除在所有node上绑定事件
        this.offAllNode();
        // 取消所有需要延迟执行的函数
        this.clearTimeout();
        // 删除所有的子类
        this.removeChildren();
        if (this.parent) {
            this.parent.removeChild(this);
            this.parent = null;
        }
        this.link = null;
        this.local_link = null;
        if (this.model) {
            this.unBindModel();
        }
    }
}
