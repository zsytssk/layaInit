class AjaxCtrl extends BaseCtrl {
    constructor() {
        super();
        this.name = 'ajax';
    }
    init() {
    }
    /**
     * 绑定获取服务器数据处理函数
     * @param event_name 接收到的事件名称
     * @param destination 目标地址
     * @param data 目标传过来的数据
     * @param needTransBack 需要回传数据
     */
    bindRequestData(event_name, destination, data, needTransBack) {
        this.request(event_name);
        if (!needTransBack) {
            return;
        }
        this.on(event_name, (data) => {
            this.broadcast(event_name, destination, data);
        }, true);
    }
    request(_url) {
        zutil.log('ajax请求：' + JSON.stringify(_url));
        $.ajax({
            type: "GET",
            url: _url,
            dataType: 'json',
            timeout: 20000,
            success: (data) => {
                // if (data.code === "000") {
                this.trigger(_url, data);
                return true;
                // }
                // 这里面需要处理一大堆的异常
            },
            error: function () {
                // 这里面需要处理一大堆的异常
            }
        });
    }
}
