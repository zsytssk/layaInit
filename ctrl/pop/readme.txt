## 所有的弹出层控制器
-| 基本逻辑
-> 所有的弹出层都是PopWrapCtrl的子类
-> 在PopWrapCtrl初始化的时候会创建所有的子类
-> 所有的子类全部继承 PopCtrl

## 弹出层继承链
-| eg: alert
AlertCtrl:> PopCtrl:> NodeCtrl:> BaseCtrl:> Event

## PopCtrl提供属性和事件
-| 事件
-> global_showing 正在显示
-> global_shown 已经显示
-> global_hiding:> 正在关闭
-> global_hidden:> 已经关闭
global_hiding + global_hidden监听事件返回data:> { trigger_btn: 'close' | 'confirm' } 触发关闭是否由close按钮|btn_confirm|都不是
---&&---
-| 属性
-> show_bg:> 是否显示背景
-> hit_bg_close:> 是否点击背景关闭弹出层
-> bg_color:> 背景颜色
-> show_animate = 'scale_in';:> 显示动画
-> hide_animate = 'scale_out';隐藏动画