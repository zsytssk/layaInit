/**事件基础类*/
class BaseEvent {
    /**事件基础类, 创建随机id*/
    constructor() {
        /**是否销毁, 用于在销毁之后 有异步函数进入, 阻止其继续执行*/
        this.is_destroyed = false;
        this.hook_funs = {};
        /**绑定在别人身上的事件, 保存在这里用于销毁时 找到绑定的目标 去取消这些事件的绑定*/
        this.hook_other_funs = [];
        /**储存所有的timetimeout interval 在destroy的时候清除*/
        this.timeout_list = [];
        this.interval_list = [];
        this.name = 'base_event';
        this._id = zutil.createRandomString();
    }
    /** 监听事件 */
    on(event_name, listener, once) {
        if (typeof listener !== 'function') {
            zutil.log(`${this.name} bind ${event_name} with not a function`);
            return;
        }
        if (!this.hook_funs[event_name]) {
            this.hook_funs[event_name] = [];
        }
        let off = () => {
            this.off(event_name, listener);
        };
        let bind_obj = {
            listener: listener,
            once: once ? once : false,
            off: off
        };
        this.hook_funs[event_name].push(bind_obj);
        return {
            off: off
        };
    }
    /** 监听一次事件 */
    once(event_name, listener) {
        return this.on(event_name, listener, true);
    }
    /**
     * 触发自己绑定的事件evnt_name的绑定函数
     * @param event_name 事件名称
     * @param data 传过去的数据
     */
    trigger(event_name, data) {
        if (!this.hook_funs[event_name]) {
            zutil.logAll(`${this.name} hasn't bind event:${event_name};`);
            return;
        }
        let hook_event_funs = this.hook_funs[event_name];
        for (let len = hook_event_funs.length, i = len - 1; i >= 0; i--) {
            /** 如果trigger destroy 就会导致别的ctrl|model绑定在这里的事件在执行listener
             * 就会全部清除, 这时候hook_event_funs为空, 执行下面的代码就会报错
             * 现在还没有什么方法解决这个问题 只能先跳过了 也许我可以将trigger的事件 异步执行
            */
            let hook_event_item = hook_event_funs[i];
            if (!hook_event_item) {
                return;
            }
            let listener = hook_event_item.listener;
            let once = hook_event_item.once;
            listener(data);
            if (once) {
                hook_event_item.off();
            }
        }
    }
    /**
     * 撤销事件绑定
     * @param event_name 事件名称
     * @param track_info 索引方法的常量 可以是function或者绑定的token
     */
    off(event_name, track_info) {
        /**off all func bind event*/
        if (!track_info) {
            this.hook_funs[event_name] = [];
            return;
        }
        let hook_list = this.hook_funs[event_name];
        if (!hook_list) {
            return;
        }
        for (let len = hook_list.length, i = len - 1; i >= 0; i--) {
            let listener = hook_list[i].listener;
            if (typeof (track_info) == 'function' && listener == track_info) {
                hook_list.splice(i, 1);
                return;
            }
        }
    }
    /** 撤销所有事件绑定 */
    offAll() {
        this.hook_funs = {};
    }
    /** 在其他的model或者ctrl上面绑定事件处理函数*/
    bindOtherEvent(other, event_name, callback, once) {
        if (!other) {
            return;
        }
        let bind_info = other.on(event_name, callback, once);
        let bind_obj = {
            off: bind_info.off,
            other_id: other._id,
            event: event_name
        };
        this.hook_other_funs.push(bind_obj);
    }
    /**取消在其他的baseEvent绑定的事件处理*/
    offOtherEvent(otherObj) {
        if (!otherObj) {
            return;
        }
        let hook_funs = this.hook_other_funs;
        for (let len = hook_funs.length, i = len - 1; i >= 0; i--) {
            let hook_item = hook_funs[i];
            let other_id = hook_item.other_id;
            let off = hook_item.off;
            if (other_id != otherObj._id) {
                continue;
            }
            off();
            hook_funs.splice(i, 1);
        }
    }
    /**取消在其他的baseEvent绑定的事件处理*/
    offAllOtherEvent() {
        let hook_funs = this.hook_other_funs;
        for (let len = hook_funs.length, i = len - 1; i >= 0; i--) {
            let hook_item = hook_funs[i];
            hook_item.off();
            hook_funs.splice(i, 1);
        }
        this.hook_other_funs = [];
    }
    /**
     * 创建setTimeout
     * @param fun 执行函数
     * @param time 延迟时间
     */
    createTimeout(fun, time) {
        let time_out = setTimeout(fun, time);
        this.timeout_list.push(time_out);
    }
    ;
    /**
     * 创建setInterval
     * @param fun 执行函数
     * @param time 时间间隔
     */
    createInterval(fun, time) {
        let interval = setInterval(fun, time);
        this.interval_list.push(interval);
    }
    ;
    /**清除time_out setinterval*/
    clearTimeout() {
        let timeout_list = this.timeout_list;
        let interval_list = this.interval_list;
        for (let i = 0; i < timeout_list.length; i++) {
            clearTimeout(timeout_list[i]);
        }
        for (let i = 0; i < interval_list.length; i++) {
            clearInterval(interval_list[i]);
        }
        this.timeout_list = [];
        this.interval_list = [];
    }
    destroy() {
        this.clearTimeout();
        this.offAllOtherEvent();
        this.offAll();
        this.is_destroyed = true;
    }
}
