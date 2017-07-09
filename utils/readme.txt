## aniamte 常用的动画
-> fade_in fade_out .. 动画

## backgroundMonitor 后台监控类
-| 监听页面退出后台, 执行相应的方法
-> bindEnterBackground(fn):> 绑定退出到后台时调用的方法
-> disabledMonitor() 关闭后台监控
-> enableMonitor() 开启后台监控
->

## countDown 倒计时
-> this.count_down = new CountDown();
-> count_down.start(this.cool_time, 0.1, data.usedTime);
/**count_down结束执行*/
count_down.onEnd(() => {

});
/**count_down变化执行*/
count_down.onCount((count_info: t_count_info) => {});
type t_count_info = {
  /**倒计时原始值*/
  origin_time: number;
  /**显示倒计时*/
  show_time: number;
  /**显示倒计时 变化间隔*/
  show_delta: number;
  /**当前的倒计时*/
  cur_time: number;
  /**实际倒计时 变化间隔*/
  delta: number;
}

## frameInterval 倒计时
像interval一样的重复执行函数, 只是全部通过 requestanimationframe 来实现的, setInterval 会随着电脑变卡而变慢, frameInterval不会, 如果很卡他就会跳过多个时间间隔-delta_time, 相对应的
start返回函数中time就相应变化
time=Math.floor(跳过时间总长/delta_time,)
-| 例子
this.interval = new FrameInterval();
this.interval.start((time) => {
//...
}, delta_time);
-> time 执行的次数
-> delta_time 间隔时间


## zutil
-> getElementsByName 通过name寻找子类
-> getElementsByType 通过类型寻找子类
-> getElementsByProperty 通过属性寻找子类
-> getAllElements 获取所有的子孙
-> getAllChildrens 获取所有的子类
-> queryElements通过 (name:nameStr type:typeStr).. 形式查询
-> querySiblings 获取所有的兄弟类
-> queryClosest 向上寻找父类 格式和queryElements一样
-> ....
---&&---
-> convertXMLToNode 把xml转换为Node
-> ....
