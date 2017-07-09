## ajax
ajax控制器
-> 所有的ctrl对象都有emitToAjax 和onAjaxRecieve 方法
-> emitToAjax(url, data, callback) 发送命令道服务器, 如果有callback 服务器返回数据执行一次
-> onAjaxRecieve(url, callback) 监听服务器数据返回无数次


## primus
primus控制器
-> 所有的ctrl对象都有emitToPrimus 和onPrimusRecieve 方法
-> emitToPrimus(url, data, callback) 发送命令道服务器, 如果有callback 服务器返回数据执行一次
-> onPrimusRecieve(url, callback) 监听服务器数据返回无数次

## router 监听页面url变化进入不同的页面
-| 基本逻辑
-> 每一个地址对应一个ctrl, 且他们都有进入-enter+退出-leave方法
-> 在url发生变化的时候会一级一级的去寻找相应的ctrl(进入如果没有就创建, 退出就直接return了)
-> 调用他们的enter || leave,


-| 配置说明
-> ctrl: 地址对应的ctrl, 比如页面url '/pop', 就会在ctrl树全局搜索这个类如何找到
就调用这个类的enter方法 如果没有就创建这个类 扔到AppCtrl中
(按照道理二级页面应该扔到他的父级类中, 现在还没有实现这个功能)
-> sub下级目录
-> redirect_to: 转到对应的地址, 如何进入页面地址变成/toroom, 就进入/room
-> /default:> 默认地址, 如何输入地址没有任何匹配, 就进入这个对应的地址

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