/**load控制器*/
class LoadCtrl extends SceneCtrl {
    /**load控制器*/
    constructor() {
        super(ui.loadUI);
        this.display_style = 'on_box';
        this.load_style = 'in_background';
        this.status = 'stop';
        this.loader = new laya.net.LoaderManager();
        this.load_queue = [];
        this.is_showing = false;
        this.name = 'load';
    }
    /** 初始化
     * @param {Function} callback
     */
    enter(callback) {
        this.load(this, () => {
            this.initView();
            this.initLink();
            this.initEvent();
            if (callback && typeof (callback) == 'function') {
                callback();
            }
        });
    }
    initLink() {
        let view = this.view;
        let progress_bar = zutil.getElementsByName(view, 'progress_bar')[0];
        let con = zutil.getElementsByName(view, 'con')[0];
        let bg_ani = zutil.getElementsByName(view, 'bg_ani')[0];
        let cover = zutil.getElementsByName(view, 'cover')[0];
        let cover_anis = zutil.getElementsByName(view, 'cover_ani');
        /**默认停止所有动画*/
        bg_ani.paused();
        for (let i = 0; i < cover_anis.length; i++) {
            cover_anis[i].paused();
        }
        this.link.progress_bar = progress_bar;
        this.link.con = con;
        this.link.bg_ani = bg_ani;
        this.link.cover = cover;
        this.link.cover_anis = cover_anis;
    }
    initEvent() {
        this.on(CMD.global_resize, () => {
            this.resize();
        });
    }
    /** 显示load页面进度条变化加载资源;
     * 应该只有在加载scence的时候才需要使用
     */
    /** 页面大小变化时 页面内容始终居中 */
    resize() {
        let view = this.view;
        if (!view) {
            return true;
        }
        view.y = (Laya.stage.height - view.height) / 2;
    }
    /**
     * 加载资源之后执行返回函数
     * @param ctrl 需要加载资源的控制器
     * @param callback 返回函数
     * @param priority_first 优先级是不是最高的,
     */
    load(ctrl, callback, priority_first) {
        if (priority_first) {
            this.stopLoadQue();
        }
        /**如果load本身没有加载 加载load初始化之后继续执行*/
        if (ctrl != this && this.resource_status == 'unload') {
            this.enter();
        }
        /**将资源添加到load_que中*/
        this.addCtrlToQueue(ctrl, callback);
        /**如果load没有正在加载的资源, 启动记载*/
        if (this.status == 'stop') {
            this.status = 'loading';
            this.loadingQueue();
        }
    }
    /**
     * 加依赖资源
    */
    loadingQueue() {
        let load_queue = this.load_queue;
        let loader = this.loader;
        if (load_queue.length == 0) {
            this.status = 'stop';
            zutil.log('load_queue is empty, all res is loaded');
            return;
        }
        this.loading_item = load_queue.shift();
        let res = this.loading_item.res;
        let callback = this.loading_item.end_listener;
        let status = this.loading_item.status;
        let load_style = this.loading_item.load_style;
        let is_scene = this.loading_item.is_scene;
        let new_callback = () => {
            this.loading_item = null;
            if (isFunc(callback)) {
                callback();
            }
            this.loadingQueue();
        };
        /**如果资源已经加载 | 没有资源 | 资源为空 直接调用callback*/
        if (!res || res.length == 0 || status == 'loaded') {
            if (load_style == 'show_loading') {
                this.toggleCover(new_callback);
            }
            else {
                new_callback();
            }
            return;
        }
        /**正在加载函数*/
        let loading_fun = null;
        /**加载完成执行函数*/
        let loaded_fun = Laya.Handler.create(this, new_callback);
        if (load_style == 'show_loading') {
            if (!this.is_showing) {
                this.show();
            }
            loading_fun = Laya.Handler.create(this, this.showLoadingProgress, null, false);
        }
        /**需要在加载完成之后关闭load, 这是在场景切换时才会遇到情形*/
        if (is_scene && this.is_showing) {
            loaded_fun = Laya.Handler.create(this, this.onLoaded, [new_callback]);
        }
        this.loader.load(res, loaded_fun, loading_fun);
    }
    /**停止正在队列加载*/
    stopLoadQue() {
        let loader = this.loader;
        let loading_item = this.loading_item;
        if (this.status != 'loading') {
            return;
        }
        /**停止正在加载的资源*/
        loader.clearUnLoaded();
        this.status = 'stop';
        /**将正在加载的资源重新放到加载队列的前面*/
        this.load_queue.unshift(loading_item);
    }
    /**添加ctrl资源进入加载队列*/
    addCtrlToQueue(ctrl, callback) {
        let ctrl_res_info = this.getCtrlResInfo(ctrl);
        /**加载资源完成后设置resource_status= loaded, 将这个包裹在资源加载完成的执行函数中*/
        let new_callback = () => {
            ctrl.resource_status = 'loaded';
            if (isFunc(callback)) {
                callback();
            }
        };
        /**如果没有资源 也没有依赖资源 直接执行,
         * 这么做是防止 alert tip 弹层被初始化被延迟执行了
         * 这显然没有必要
        */
        if (!ctrl_res_info.res && !(ctrl_res_info.res_dependencies && ctrl_res_info.res_dependencies.length)) {
            new_callback();
            return;
        }
        /**加载顺序 relative --> 自己 --> dep, loadqueue 是从前到后加载所有加载的顺序是 这样的*/
        /*relative res*/
        if (ctrl_res_info.res_relatives && ctrl_res_info.res_relatives.length) {
            for (let i = 0; i < ctrl_res_info.res_relatives.length; i++) {
                this.addResToQueue({
                    res: ctrl_res_info.res_relatives[i],
                    load_style: 'in_background'
                });
            }
        }
        /*自己 res*/
        this.addResToQueue({
            res: ctrl_res_info.res,
            end_listener: new_callback,
            load_style: ctrl_res_info.load_style,
            is_scene: ctrl_res_info.is_scene,
            status: ctrl_res_info.status
        });
        /*dep res*/
        if (ctrl_res_info.res_dependencies && ctrl_res_info.res_dependencies.length) {
            for (let i = 0; i < ctrl_res_info.res_dependencies.length; i++) {
                this.addResToQueue({
                    res: ctrl_res_info.res_dependencies[i],
                    load_style: ctrl_res_info.load_style
                });
            }
        }
    }
    /**
    * 有需要加载资源的NodeCtrl, 通过name在resMap定位相应的资源,
    * 先加载资源再初始化ui,
   */
    getCtrlResInfo(ctrl) {
        let res, status, res_dependencies, res_relatives;
        for (let i = 0; i < RESMAP.length; i++) {
            if (RESMAP[i].name == ctrl.name) {
                res = RESMAP[i].res;
                status = RESMAP[i].resource_status;
                res_relatives = RESMAP[i].res_relatives;
                res_dependencies = RESMAP[i].res_dependencies;
            }
        }
        return {
            /**本身资源*/
            res: res,
            /**依赖资源--必须提前加载*/
            res_dependencies: res_dependencies,
            /**关联资源--后续加载*/
            res_relatives: res_relatives,
            status: status,
            load_style: ctrl.load_style,
            is_scene: ctrl != this && ctrl instanceof SceneCtrl,
        };
    }
    addResToQueue(res_info) {
        let load_queue = this.load_queue;
        /**如果证正在加载scene的资源 需要将队列中原来的scene的加载结束的返回函数清除
         * 防止 在进入本页面之后 又跑到过去的页面中
        */
        for (let len = load_queue.length, i = len - 1; i >= 0; i--) {
            if (load_queue[i].is_scene && res_info.is_scene) {
                load_queue[i].end_listener = null;
            }
        }
        /**将本资源和加载队列中所有元素对比, 如果有相同的资源 将所有必须合并属性合并, 删除原有的元素*/
        for (let len = load_queue.length, i = len - 1; i >= 0; i--) {
            if (res_info.res && res_info.res == load_queue[i].res) {
                res_info.end_listener = res_info.end_listener ? res_info.end_listener : load_queue[i].end_listener;
                res_info.load_style = res_info.load_style == 'show_loading' ? 'show_loading' : load_queue[i].load_style;
                res_info.is_scene = res_info.is_scene ? res_info.is_scene : load_queue[i].is_scene;
                res_info.status = res_info.status == 'loaded' ? 'loaded' : load_queue[i].status;
                load_queue.splice(i, 1);
            }
        }
        /**正在加载相同的资源*/
        if (this.loading_item && res_info.res && res_info.res == this.loading_item.res) {
            /**要添加的资源没有, 加载完成执行函数, 不用添加这个资源*/
            if (!res_info.end_listener) {
                return;
            }
            /**正在加载的item有加载完成执行函数, 不用加载这个资源
             * 基本上这两个函数应该是一样的功能, 不存在同一个资源有两个不同执行函数(的加载完成时执行)
            */
            if (this.loading_item.end_listener) {
                return;
            }
            /**停止正在加载的队列, 正在加载的item*/
            this.stopLoadQue();
            this.load_queue.shift();
        }
        load_queue.unshift(res_info);
    }
    /**
     * 设置resMap中资源的状态
    */
    setCtrlResStatus(ctrl, status) {
        for (let i = 0; i < RESMAP.length; i++) {
            if (RESMAP[i].name == ctrl.name) {
                RESMAP[i].resource_status = status;
            }
        }
    }
    /**隐藏*/
    show(callback) {
        let bg_ani = this.link.bg_ani;
        let view = this.view;
        if (this.is_showing) {
            if (isFunc(callback)) {
                callback();
            }
            return;
        }
        this.reset();
        this.link.progress_bar.value = 0;
        this.showing_timestamp = (new Date()).getTime();
        this.is_showing = true;
        bg_ani.resume();
        if (isFunc(callback)) {
            callback();
        }
        animate.fade_in(view, 400);
        super.show();
    }
    /**隐藏*/
    hide(callback) {
        if (isFunc(callback)) {
            callback();
        }
        let bg_ani = this.link.bg_ani;
        let view = this.view;
        this.is_showing = false;
        let hide_fn = () => {
            animate.fade_out(view, 400, () => {
                bg_ani.paused();
            });
        };
        let show_time = (new Date()).getTime() - this.showing_timestamp;
        if (show_time > CONFIG.load_show_min_time) {
            hide_fn();
            return;
        }
        /**最小显示时间*/
        window.clearTimeout(this.hide_time_out);
        this.hide_time_out = setTimeout(function () {
            hide_fn();
        }, CONFIG.load_show_min_time - show_time);
    }
    toggleCover(callback) {
        this.reset();
        let view = this.view;
        let cover = this.link.cover;
        let con = this.link.con;
        let cover_anis = this.link.cover_anis;
        for (let i = 0; i < cover_anis.length; i++) {
            cover_anis[i].resume();
        }
        this.is_showing = false;
        cover.visible = true;
        con.visible = false;
        /**显示load_cover之后, 执行函数*/
        animate.fade_in(view, 400, () => {
            if (isFunc(callback)) {
                callback();
            }
        });
        /**总共显示一秒钟*/
        window.clearTimeout(this.hide_cover_timeout);
        this.hide_cover_timeout = setTimeout(() => {
            animate.fade_out(view, 400, () => {
                cover.visible = false;
                con.visible = true;
                for (let i = 0; i < cover_anis.length; i++) {
                    cover_anis[i].paused();
                }
            });
        }, CONFIG.load_show_min_time * 1000 - 400);
    }
    /**loading完成*/
    onLoaded(callback) {
        this.hide(() => {
            this.reset();
            if (isFunc(callback)) {
                callback();
            }
        });
    }
    /**显示加载进度条*/
    showLoadingProgress(percent) {
        /** 在loadCtrl还没有初始化的时候不执行下面*/
        if (!this.link) {
            return true;
        }
        this.link.progress_bar.value = percent;
    }
    /**重置*/
    reset() {
        window.clearTimeout(this.hide_time_out);
        window.clearTimeout(this.hide_cover_timeout);
    }
}
