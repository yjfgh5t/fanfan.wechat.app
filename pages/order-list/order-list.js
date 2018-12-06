import {
  tools
} from '../../utils/common.js'
import {
  pay
} from '../../utils/pay.js'
Page({
  data: {
    defaultImg: '/imgs/img_item_default.png',
    orders: [
      //{id:1001,title:"套餐鸡蛋+油条+面包 丰盛的早餐 哇哈哈哈",orderStateText:"订单已完成",orderTime:"2018-04-12 08:30:22",ortherRemark:"油条等2件商品",pay:"20",pic:"/img/img_item_default.png"},
    ],
    pageIndex: 1,
    //显示加载更多
    loadMoerText: '正在加载数据...',
    //计算器
    intervalArray: []
  },
  onShow: function() {
    //数据初始化
    this.data.orders = [];
    this.data.pageIndex = 1;
    //停止计时器 
    this.data.intervalArray.forEach((item) => {
      clearInterval(item);
    });
    this.data.intervalArray = [];
    this.privLoadData();
  },
  //查看详情
  bindDetail: function(e) {
    tools.setParams("orderId", e.currentTarget.dataset.id);
    //跳转
    wx.navigateTo({
      url: '/pages/order-detail/order-detail'
    });
  },
  //支付
  bindPay: function(e) {
    //支付
    pay.tradePay(e.currentTarget.dataset.alipay, e.currentTarget.dataset.id, (succes) => {
      tools.setParams("orderId", e.currentTarget.dataset.id);
      wx.navigateTo({
        url: "/pages/order-detail/order-detail"
      });
    });

    return false;
  },
  privLoadData: function() {
    let _this = this;
    if (_this.loadMoerText === '已全部加载') {
      return;
    }

    let index = (_this.data.pageIndex - 1) * 10;

    tools.getUserInfo((user) => {

      let _orders = {};

      const subData = {
        userId: user.id,
        pageIndex: _this.data.pageIndex,
        pageSize: 10
      };

      //获取订单列表 
      tools.ajax("api/order/query", JSON.stringify(subData), "JSON", function(resp) {
        if (resp.code != 0) {
          wx.showModal({
            title: '系统提示',
            content: '获取数据失败',
            showCancel: false
          });
          return;
        }
        console.log('总条数：' + resp.data.length)
        let loadMoerText = '加载更多';
        if (resp.data.length < 10) {
          loadMoerText = '已全部加载';
          if (resp.length == 0 && _this.orders.length === 0) {
            loadMoerText = '您还没有下过单哦';
          }
        }

        //设置显示文本
        _this.setData({
          loadMoerText: loadMoerText
        });

        if (resp.data.length == 0) {
          return;
        }

        resp.data.forEach((item, i) => {
          //设置key
          let _parmKey = "orders[" + index + i + "]";
          _orders[_parmKey] = {
            id: item.id,
            title: item.title,
            orderStateText: item.orderStateText,
            orderTime: item.createTime,
            ortherRemark: "共" + item.commodityTotal + "件商品",
            pay: item.orderPay,
            pic: item.commodityImg,
            orderState: item.orderState,
            endPayText: '',
            alipayOrderStr: item.alipayOrderStr,
            dateNum: item.orderDateNum == null ? '' : ('#' + item.orderDateNum)
          };

          //更新最后支付时间
          if (item.orderState == 103) {
            _this.privEndPayTime(item.lastPayTime, _parmKey);
          }
        });

        _this.setData(_orders);

        _this.data.pageIndex++;
      });
    });

  },
  //显示支付倒计时
  privEndPayTime: function(endTiemSecond, paramKey) {

    let _this = this;
    console.log(endTiemSecond);
    //刷新文本函数
    let _refshText = function() {

      let refshParam = {};

      //刷新当前订单
      if (endTiemSecond < 0) {
        clearInterval(interval);
        //设置参数 
        refshParam[paramKey + ".orderState"] = 105;
        refshParam[paramKey + ".orderStateText"] = "超时未支付";
      };

      let second = endTiemSecond % 60,
        minute = parseInt(endTiemSecond / 60);

      let endPayText = "还剩";
      //拼接分
      if (minute > 0) endPayText += minute + "分";
      //拼接秒
      endPayText += second + "秒";

      //设置倒计时文本
      refshParam[paramKey + ".endPayText"] = endPayText;

      _this.setData(refshParam);

      endTiemSecond--;
    };

    let interval = setInterval(_refshText, 1000);

    //添加至集合
    _this.data.intervalArray.push(interval);

    //初始执行一次
    _refshText();
  }
});