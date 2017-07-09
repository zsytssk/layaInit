## 基本逻辑
-| 整个项目存在两个基本类
-> ctrl:> ctrl类 处理页面的所有显示
-> model:> 数据类 处理页面的数据
他们都继承之Event类, 他实现所有事件分发方法, 还有其他的方法ctrl, model都可能用到的方法..

main.js 游戏的入口
app.js 游戏的最顶级ctrl类

-| 所有ctrl 类通过父子节点连接在一个
app>
  primus:> 和服务器通过primus传递数据控制类
  ajax:> 和服务器通过ajax传递数据控制类
  router:> 路由
  load:> 资源的加载全部通过这个实现
  pop_wrap:> 所有弹出层的父类
  ...
所有节点像一个闭包一样 我可以在任何地方找到任何节点,
相互之间调用可以通过zutil下面的方法找到, 再调用,
也可以通过baseCtrl中提供的消息传递方法
emit:> 向下传递
report:> 向上传递
broadcast:> 全局传递

-| model和ctrl绑定
-> 通过ctrl的bindModel 绑定,
-> ctrl直接调用model的方法
-> ctrl onModel 监听model分发事件来改变页面...
所有的数据只有一个入口room:> Game