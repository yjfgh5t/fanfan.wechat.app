import {
  tools
} from '../../utils/common.js';
import {
  pay
} from '../../utils/pay.js';
Page({
  data: {
    defaultImg: '/imgs/img_item_default.png',
    telImg: '/imgs/icon_tel.png',
    order: {
      name: "",
      commoditys: [{
        id: 1001,
        title: '',
        price: 10,
        size: 10
      }],
      pay: 15.00,
      orderId: 0,
      orderNum: '',
      payType: '',
      createTime: '',
      lastPayTime: 0,
      invoice: '',
      orderState: '',
      mainImg: '',
      alipayOrderStr: '',
      receiver: {
        name: '',
        sex: '',
        tel: '',
        addrDetail: '',
        deliveryName:'',
        deliveryTel:  ''
      }
    },
    endPayText: '',
    //订单状态
    orderState: {
      businessPending: 200,
      businessCancel: 202
    },
    //付款方式
    payType: {
      alipay: 1,
      offline: 3
    }
  },
  onLoad: function(query) {
    let orderId;
    if (query && query.orderId) {
      orderId = query.orderId
    } else {
      orderId = this.data.order.orderId == 0 ? tools.getParams("orderId", true) : this.data.order.orderId;
    }
    //加载数据
    this.privLoadData(orderId);
  },
  onShow: function(options) {

  },
  //取消订单
  bindChanel: function() {

    let _this = this;

    wx.showModal({
      title: '提示',
      content: '确认取消订单吗',
      confirmText: '确定',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          const subData = {
            'state': 'user-cancel',
              customerRemark: ''
          };
          tools.ajax("api/order/state/" + _this.data.order.orderId, subData, "POST", function(resp) {
            if (resp.code == 0) {
              wx.redirectTo({
                url: "/pages/home/home"
              });
            }
          });
        }
      }
    });
  },
  //支付
  binPay: function() {
    let _this = this;
    //支付
    pay.tradePay(_this.data.order.alipayOrderStr, _this.data.order.orderId, (succes) => {
      if (succes) {
        tools.setParams("orderId", _this.data.order.orderId);
        _this.onLoad();
      }
    });
  },
  bindCall: function (e) {
    let tel = e.target.dataset.value;
    wx.makePhoneCall({ phoneNumber: tel });
  },
  privLoadData: function(orderId) {

    let _this = this;

    //读取数据
    tools.ajax("api/order/" + orderId, null, "GET", function(resp) {
      if (resp.code != 0) {
        return;
      }

      let receiver = {};
      if (resp.data.receiver != null) {
        receiver = {
          name: resp.data.receiver.name,
          sex: resp.data.receiver.sex,
          tel: resp.data.receiver.tel,
          addrDetail: resp.data.receiver.addrDetail,
          deliveryName: resp.data.receiver.deliveryName || '',
          deliveryTel: resp.data.receiver.deliveryTel || ''
        }
      }

      let tmpOrder = {
        pay: resp.data.orderPay,
        orderId: orderId,
        orderNum: resp.data.orderNum,
        createTime: resp.data.createTime,
        lastPayTime: resp.data.lastPayTime,
        invoice: resp.data.invoice,
        orderState: resp.data.orderState,
        orderStateText: resp.data.orderStateText,
        mainImg: resp.data.mainImg,
        dateNum: resp.data.orderDateNum == null ? '' : ('#' + resp.data.orderDateNum),
        deskNum: resp.data.orderDeskNum,
        alipayOrderStr: resp.data.alipayOrderStr,
        orderTypeText: resp.data.orderTypeText,
        orderType: resp.data.orderType,
        orderPayTypeText: resp.data.orderPayTypeText,
        commoditys: [],
        others: [],
        customerTel: resp.data.customerTel,
        receiver: receiver
      };

      //商品信息
      tmpOrder.commoditys = resp.data.detailList.filter(f => (f.outType == 1 || f.outType == 5)).map(function(item) {
        return {
          id: item.id,
          title: item.outTitle,
          price: item.outPrice,
          count: item.outSize
        }
      });
      //其它 配送费、餐盒费等
      tmpOrder.others = resp.data.detailList.filter(f => (f.outType == 6)).map(function(item) {
        return {
          id: item.id,
          title: item.outTitle,
          price: item.outPrice,
          count: item.outSize
        }
      });

      //设置标题
      tmpOrder.name = tmpOrder.commoditys[0].title;

      //倒计时
      if (tmpOrder.orderState == 103) _this.privEndPayTime(tmpOrder.lastPayTime);

      _this.setData({
        order: tmpOrder
      });
    });

  },
  //显示支付倒计时
  privEndPayTime: function(endTiemSecond) {
    let _this = this;

    //刷新文本函数
    let _refshText = function() {

      //刷新当前订单
      if (endTiemSecond <= 0) {
        clearInterval(interval);
        //设置参数
        //tools.setParams("orderNum",_this.data.order.orderNum);
        //跳转值首页
        wx.redirectTo("/pages/home/home");
      };

      let second = endTiemSecond % 60,
        minute = parseInt(endTiemSecond / 60);

      let endPayText = "还剩";
      //拼接分
      if (minute > 0) endPayText += minute + "分";
      //拼接秒
      endPayText += second + "秒";

      _this.setData({
        "endPayText": endPayText
      });

      endTiemSecond--;
    }

    let interval = setInterval(_refshText, 1000);

    //初始执行一次
    _refshText();
  }
})