/**
 * 后台检测控制器
 * 核心代码来之张笑的laya.tool.js, 在他的基础上添加一些功能
 */
class BackgroundMonitor {
    constructor(time_zone) {
        this.bind_fns = [];
        this.time_zone = time_zone || 1000;
    }
    init() {
    }
    bindEnterBackground(fn) {
        if (_.isFunction(fn)) {
            this.bind_fns.push(fn);
        }
    }
    runBindFun() {
        let fns = this.bind_fns;
        for (let i = 0; i < fns.length; i++) {
            fns[i]();
        }
    }
    enableMonitor() {
        /**测试环境禁用后台功能*/
        if (zutil.detectModel('autoTest')) {
            return;
        }
        if (document && document.visibilityState) {
            let bind_visibility_change_fn = this.visibilityChange.bind(this);
            // 在浏览器中判断页面是否被隐藏
            document.addEventListener('visibilitychange', bind_visibility_change_fn);
            this.bind_visibility_change_fn = bind_visibility_change_fn;
            return;
        }
        // old browser 的处理函数
        let Browser = laya.utils.Browser;
        let last_time = Browser.now();
        let diff_time = this.time_zone;
        if (!Browser.onAndriod) {
            this.interval = window.setInterval(() => {
                let now_time = Browser.now();
                if (now_time - last_time > diff_time) {
                    clearInterval(this.interval);
                    this.runBindFun();
                }
                last_time = now_time;
            }, 300);
        }
        else {
            let _counter = 0;
            this.interval = window.setInterval(() => {
                let now_time = Browser.now();
                if (now_time - last_time > diff_time) {
                    if (_counter > 1) {
                        clearInterval(this.interval);
                        this.runBindFun();
                    }
                    else {
                        _counter += 1;
                    }
                }
                last_time = now_time;
            }, 300);
        }
    }
    /**浏览器的visibilityState发生变化的处理函数*/
    visibilityChange() {
        let visibilityState = document.visibilityState;
        if (visibilityState == 'hidden') {
            this.time_out = window.setTimeout(() => {
                this.runBindFun();
            }, this.time_zone);
        }
        if (visibilityState == 'visible') {
            if (this.time_out) {
                clearTimeout(this.time_out);
            }
        }
    }
    /**禁用监控*/
    disabledMonitor() {
        if (document && document.visibilityState) {
            document.removeEventListener('visibilitychange', this.bind_visibility_change_fn);
            return;
        }
        clearInterval(this.interval);
    }
}
