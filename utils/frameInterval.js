/**
 * 像interval一样的重复执行函数, 只是全部通过 requestanimationframe 来实现的
 */
class FrameInterval {
    constructor() {
    }
    /**开始执行循环函数
     * fun 每次执行的执行的韩式 @param time 传入的间隔
     * @param space_time 间隔的时间间隔
     * @param fps  time = elapsed / (1000 / fps),
     * 如果interval_time = 1000/30 fps = 60
     * 那么我这个只在一秒执行30次, 更新60个位移
    */
    start(fun, interval_time, fps) {
        let then = Date.now();
        fps = fps || 1000 / interval_time;
        this.stop_interval = false;
        let interval = () => {
            if (this.stop_interval) {
                return;
            }
            this.interval_id = requestAnimationFrame(interval);
            let now = Date.now();
            let elapsed = now - then;
            if (elapsed <= interval_time) {
                return;
            }
            let time = Math.floor(elapsed * fps / 1000);
            then = now - (elapsed - time * 1000 / fps);
            if (isFunc(fun)) {
                fun(time);
            }
        };
        interval();
    }
    stop() {
        this.stop_interval = true;
        cancelAnimationFrame(this.interval_id);
    }
}
