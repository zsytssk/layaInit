## CMD
-> 所有事件名称

## config
-> 页面一些配置 + 所有资源+版本号(这应该放在app.js中)

## res 页面所有资源



## resmap 资源对应的ctrl
-> 每一个ctrl都有一个name, 通过这个name找到相应的资源
-> 资源有三种 本身资源+依赖资源+关联资源
-> 每一个ctrl对象都有一个loadRes命令, 他会在加载 依赖资源:> 本身资源后初始化, 初始化之后把关联资源放在后台慢慢加载


## sprite 精灵
-> 页面遇到的所有精灵(图片|dragonBone|Animation)


## tipTxt 页面中的所有文本