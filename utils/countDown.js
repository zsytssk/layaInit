class CountDown {
    constructor() {
        // 倒计时结束执行函数
        this.end_func_list = [];
        // 每次计数都会执行函数
        this.count_func_list = [];
        this.info = {};
        this.interval = new FrameInterval();
    }
    init() {
    }
    /**
     * 开始倒计时
     * 如果倒计时5秒, 倒计时是从 5-->0 (包括0);
     * 所以实际每次的变化就是 5/6;
     * @param count_down 总共倒计时几次
     * @param delta 倒计时的每次变化的时间, 单位秒
     */
    start(time, delta = 1, used_time) {
        /*
          如果倒计时5秒, 倒计时是从 5-->0 (包括0);
          所以实际每次的变化就是 5/6;
        */
        /**如果前面还有倒计时 先停止前面的倒计时*/
        this.clear();
        let info = this.info;
        let show_time = time; // 倒计时 显示的数字
        let real_delta = time * delta / (time + 1); // 实际 倒计时 变化间隔
        info.origin_time = time; // 倒计时原始值
        info.show_time = used_time ? time - used_time : time; // 显示倒计时
        info.show_delta = delta; // 显示倒计时 变化间隔
        info.cur_time = time; // 实际倒计时
        info.delta = real_delta; // 实际倒计时 变化间隔
        setTimeout(() => {
            this.runCount();
        }, 0);
        this.interval.start((time) => {
            this.runCountDown(time);
        }, delta * 1000);
    }
    /**
     * 执行倒计时
     */
    runCountDown(time) {
        let info = this.info;
        let cur_time = info.cur_time; // 倒计时原始值
        let show_time = info.show_time; // 显示倒计时
        let show_delta = info.show_delta; // 显示倒计时 变化间隔
        let delta = info.delta; // 实际倒计时 变化间隔
        cur_time -= delta * time;
        show_time -= show_delta * time;
        if (show_time < 0) {
            // 倒计时-结束 执行
            this.end_func_list.forEach((fun) => {
                fun();
            });
            this.clear();
            return true;
        }
        info.cur_time = cur_time;
        info.show_time = show_time;
        this.runCount();
    }
    /**
     * 获得当前的倒计时
     */
    getCurCountDown() {
        let count_down;
        if (this.info.cur_time) {
            count_down = this.info.cur_time;
        }
        return count_down;
    }
    /**
     * 绑定倒计时每次count 的时候执行
     * @param fun 绑定函数
     */
    onCount(fun) {
        if (!fun || typeof fun != 'function') {
            return this;
        }
        this.count_func_list.push(fun);
        return this;
    }
    // 每次倒计时-执行
    runCount() {
        // 倒计时-计时 执行
        this.count_func_list.forEach((fun) => {
            window.setTimeout(() => {
                fun(this.info);
            }, 0);
        });
    }
    /**
     * 绑定倒计时结束的时候执行
     * @param fun 绑定函数
     */
    onEnd(fun) {
        if (!fun || typeof fun != 'function') {
            return this;
        }
        this.end_func_list.push(fun);
        return this;
    }
    /**清除倒计时*/
    clear() {
        this.interval.stop();
        this.end_func_list = []; // 倒计时结束执行函数
        this.count_func_list = []; // 每次计数都会执行函数
        this.info = {};
    }
}
