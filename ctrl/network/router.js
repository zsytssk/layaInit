/**路由控制器*/
class RouterCtrl extends BaseCtrl {
    /**路由控制器*/
    constructor() {
        super();
        this.link = {};
        /**所有的路由控制器保存地方*/
        this.router_handler_obj = {};
        /**当前url*/
        this.cur_router_path = '';
        this.name = 'router';
    }
    init() {
        this.initLink();
        this.initEvent();
        this.initRouter();
    }
    initLink() {
        this.link.app = zutil.queryClosest(this, 'name:app');
    }
    initEvent() {
        // app 初始化之后初始化
        this.on('app::inited', () => {
            this.director.listen();
        });
    }
    /**初始化router*/
    initRouter() {
        let options = {
            // mode: zutil.detectModel('autoTest') ? 'hash' : 'history'
            mode: 'hash'
        };
        /**路由的配置*/
        let config = {
            '/pop': {
                ctrl: PopWrapCtrl,
                sub: {
                    '/alert': {
                        ctrl: AlertCtrl
                    },
                    '/tip': {
                        ctrl: TipCtrl
                    },
                    '/backpack': {
                        ctrl: BackPack
                    }
                }
            },
            '/toroom': {
                redirect_to: '/room'
            },
            '/default': {
                redirect_to: '/hall'
            }
        };
        this.director = new zsyDirector(options);
        this.director.onChangeBefore(this.onRouterChange.bind(this));
        this.initRouterHandlers(config);
    }
    /** 初始化router控制 */
    initRouterHandlers(config) {
        var router_handler_obj = this.router_handler_obj;
        for (let key of Object.keys(config)) {
            router_handler_obj[key] = this.createRouteHandler(key, config[key]);
        }
    }
    /**创建单个控制器*/
    createRouteHandler(path, config, parent_path) {
        let router_handler = {};
        let abs_path = path;
        if (parent_path) {
            abs_path = parent_path + path;
        }
        router_handler.abs_path = abs_path;
        router_handler.ctrl = config.ctrl;
        router_handler.redirect_to = this.getRedirectPath(abs_path, config.redirect_to);
        if (config.sub) {
            let sub = config.sub;
            router_handler.router_handler_obj = {};
            for (let key of Object.keys(sub)) {
                router_handler.router_handler_obj[key] = this.createRouteHandler(key, sub[key], abs_path);
            }
        }
        return router_handler;
    }
    /**
     * 获取跳转链接的地址
     * @param path_list 当前路径的数组
     * @param redirect 跳转的链接地址
     */
    getRedirectPath(origin_path, redirect_path) {
        /* 由目的地的相对路径跳转
          ../->向父级近一级 /->平级
        */
        let result_path = '';
        if (!redirect_path) {
            return result_path;
        }
        if (redirect_path.indexOf('//') == -1) {
            let origin_path_list = origin_path.split('/').slice(1);
            let redirect_list = redirect_path.split('../');
            let jump_level = redirect_list.length - 1;
            redirect_path = redirect_list[jump_level];
            let redirect_path_list = origin_path_list.slice(0, -jump_level - 1);
            for (let i = 0; i < redirect_path_list.length; i++) {
                result_path += '/' + redirect_path_list[i];
            }
            result_path = redirect_path + result_path;
            return result_path;
        }
        /*
          由开始路径开始的绝对地址 //开始, 去掉第一个/
        */
        result_path = redirect_path.slice(1, redirect_path.length);
        return result_path;
    }
    /**
     * 路由的变化的时候 处理相应的页面逻辑
     * @param before_path 上一个路径地址
     * @param next_path 下一个(将要的变化)路径地址
     */
    onRouterChange(before_path, next_path) {
        let app = this.link.app;
        let can_navigate = this.detectNavigate(next_path);
        if (!can_navigate) {
            return;
        }
        let cur_router_path = this.cur_router_path;
        let next_handler_list = this.getHandlerByPath(next_path, true);
        let before_handler_list = this.getHandlerByPath(cur_router_path, true);
        this.trigger(CMD.router_change, { cur_page: cur_router_path, next_page: next_path });
        // 将当前有效的地址保存下来
        this.cur_router_path = next_path;
        if (before_handler_list) {
            // 去除before_handler_list中和next_handler_list相同的部分不用leave, 也不用enter
            let len = Math.min(next_handler_list.length, before_handler_list.length);
            for (let i = 0; i < len; i++) {
                if (next_handler_list[i] != before_handler_list[i]) {
                    next_handler_list = next_handler_list.slice(i);
                    before_handler_list = before_handler_list.slice(i);
                    break;
                }
            }
            for (let i = before_handler_list.length - 1; i >= 0; i--) {
                callBeforeLeave(before_handler_list[i]);
            }
        }
        // 将callback变成这种形式:parent.enter(function(sub.enter(...)))
        let next_callback = function () { };
        for (let i = next_handler_list.length - 1; i >= 0; i--) {
            next_callback = nextEnterCallbackCast(next_handler_list[i], next_callback);
        }
        if (next_callback && typeof next_callback == 'function') {
            next_callback();
        }
        /**
         * 路由进入页面--enter函数包装器
         * @param handler router控制器
         * @param callback 包装的callback
        */
        function nextEnterCallbackCast(handler, callback) {
            return function () {
                let ctrl = zutil.getElementsByType(app, handler.ctrl)[0];
                if (!ctrl) {
                    ctrl = new handler.ctrl();
                    app.addChild(ctrl);
                }
                let fn = ctrl.enter;
                if (!fn) {
                    zutil.log(`${ctrl.name} has no enter function`);
                    return;
                }
                fn.bind(ctrl)(callback);
            };
        }
        /**
         * 执行路由离开页面--leave函数
         * @param handler router控制器
         */
        function callBeforeLeave(handler) {
            let ctrl = zutil.getElementsByType(app, handler.ctrl)[0];
            if (!ctrl) {
                zutil.log(`has no leave ctrl`);
                return;
            }
            let fn = ctrl.leave;
            if (!fn) {
                zutil.log(`${ctrl.name} has no leave function`);
                return;
            }
            fn.bind(ctrl)();
        }
    }
    /**
     * 获取hander路径列表, 通过path通过/分割然后在router_handler_obj中一个个的查找
     * eg: pop->handler, alert-->handler...
     * @param path 查找的路径
     * @param is_list 是不是返回从头到尾的一个数组
     */
    getHandlerByPath(path, is_list) {
        if (!path) {
            return;
        }
        let path_list = path.split('/').slice(1);
        let handler_list = [];
        let router_handler_obj = this.router_handler_obj;
        for (let i = 0; i < path_list.length; i++) {
            let router_path = '/' + path_list[i];
            let has_match = false;
            for (let router_name in router_handler_obj) {
                if (router_name == router_path) {
                    let router_handler = router_handler_obj[router_name];
                    router_handler_obj = router_handler.router_handler_obj;
                    handler_list.push(router_handler);
                    has_match = true;
                }
            }
            // 没有匹配的项直接跳转default
            if (!has_match) {
                return;
            }
        }
        if (is_list) {
            return handler_list;
        }
        return handler_list.pop();
    }
    /**检测path是否是能跳转的路径*/
    detectNavigate(path) {
        return this.navigate(path, true);
    }
    /**
     * 在跳转之前查看有没有必要重定向
     * 如果有而且有redirect, 那么就跳转redirect
     * @param path
     * @param detect 是否是检测, 如果是检测最后一步就不运行
     */
    navigate(path, detect) {
        let router_handler = this.getHandlerByPath(path);
        if (!router_handler) {
            zutil.log(`${path} has no handler, redirect to /default!`);
            this.navigate('/default');
            return;
        }
        let redirect_path = router_handler.redirect_to;
        if (redirect_path) {
            zutil.log(`${path} redirect to ${redirect_path}`);
            this.navigate(redirect_path);
            return;
        }
        if (!detect) {
            this.navigateTo(path);
        }
        else {
            return true;
        }
    }
    navigateTo(path) {
        this.director.navigate(path);
    }
}
