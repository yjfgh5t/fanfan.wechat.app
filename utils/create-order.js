import { tools } from 'common.js'

let order = {
  // 创建订单
  create: function (req, callback) {

    tools.getUserInfo(function (userInfo) {
      //订单提交对象
      let orderReq = {
        // 用户id
        userId: userInfo.id,
        // 堂吃、打包、或者外卖
        orderType: req.orderType,
        // 商品详情
        detailList: req.detailList,
        // 配送信息
        receiver: req.receiver,
      };

      //创建临时订单
      tools.ajax("api/order/", JSON.stringify(orderReq), "POST", function (resp) {
        //回调
        callback(resp);
      }, { headers: { "Content-Type": "application/json" } });
    });
  },
  calculate: function (req, callback) {
    tools.getUserInfo(function (userInfo) {
      //订单提交对象
      let orderReq = {
        // 用户id
        userId: userInfo.id,
        // 堂吃、打包、或者外卖
        orderType: req.orderType,
        // 商品详情
        detailList: req.detailList,
        // 配送信息
        receiver: req.receiver,
      };

      //创建临时订单
      tools.ajax("api/order/calculate", JSON.stringify(orderReq), "POST", function (resp) {
        //回调
        callback(resp);
      }, { headers: { "Content-Type": "application/json" } });
    });
  }
};
export { order };