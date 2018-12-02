import { tools } from 'utils/common.js'
App({
  //用户信息
  userInfo: {
    id: -1,
    userNick: '',
    userMobile: '',
    userIcon: '',
    userSex: 1,
    userState: 1
  },
  //配置信息
  config: {
    apiHost: 'http://wxcard.com.cn/', //'http://localhost:8081/',
    networkAvailable: true,
    //店铺名称
    showName: "",
    //最低起送价 默认0.01 不做外卖 无需设置改值
    minTakePrice: 0.01,
    //店铺营业开始时间,
    startBusiTime: "09:00",
    //结束营业时间
    endBusiTime: "10:00",
    //店铺状态 1:营业 2:休息中
    shopState: 1,
    //客桌Id
    deskNum: '',
    //商户Id 
    customerId: -1,
    //客户端类型
    clientType: 'AlipayMiniprogram',
    //是否显示跳转提交联系人我们提示
    showContact: false,
    //版本
    version: "1.0.1",
    //支付宝付款
    shopId: -1,
  },
  // 参数
  params: {
    //桌号二维码
    qrcode: '',
    //上海Id
    customerId: -1,
  },
  //全局对象
  globalData: {},
  onError: function () {
    console.log('出错')
  },
  onLaunch: function (option) {
    let _this = this;
    //加载参数
    this.initParams(option)

    //监听网咯状态
    wx.onNetworkStatusChange(function (res) {
      _this.config.networkAvailable = res.networkType != 'none';
    });

    //获取网咯状态 
    wx.getNetworkType({
      success: (res) => {
        _this.config.networkAvailable = res.networkType!='none';
      }
    });

    //设置用户信息
    wx.getStorage({
      key: 'userInfo', // 缓存数据的 key
      success: (res) => {
        if (res != null && res.data != null) {
          _this.userInfo = res.data;
        }
      },
    });
  },
  onShow: function (option) {

    //加载参数
    this.initParams(option)

    //获取参数中的customerId
    if (this.params.customerId !== -1) {
      this.config.customerId = this.params.customerId
    }

    //获取缓存中的customerId
    if (this.config.customerId == -1) {
      let config = wx.getStorageSync('app.config');
      if (config != null && config.customerId) {
        debugger
        this.config = config;
      }
    }

    //加载数据
    //this.loadData();
  },
  initParams: function (option) {
    if (option.query) {
      //二维码code
      if (option.query.qrCode != undefined) {
        let temcode = option.query.qrCode;
        if (temcode.indexOf('qrcode=') > 0) {
          temcode = temcode.split('qrcode=')[1];
          if (temcode.length == 32) {
            this.params.qrcode = temcode;
          }
        }
      }

      //customerId
      if (option.query.customerId != undefined) {
        this.params.customerId = option.query.customerId
      }
    }
  },
  //获取基础信息 
  loadData: function () {
    let _this = this;
    tools.ajax("api/info/", { qrcode: this.params.qrcode }, "GET", (resp) => {
      //清空qrcode
      _this.params.qrcode = ''

      //设置值
      if (resp.data) {
        //商户id
        _this.config.customerId = resp.data.customerId;
        //桌号
        if (resp.data.deskNum) {
          _this.config.deskNum = resp.data.deskNum;
        }
        //设置店铺信息
        if (resp.data.shop) {
          _this.config.shopName = resp.data.shop.name;
          _this.config.startBusiTime = resp.data.shop.businessStart;
          _this.config.endBusiTime = resp.data.shop.businessEnd;
          _this.config.shopState = resp.data.shop.state;
          _this.config.showContact = (resp.data.showContact === "true");
          _this.config.shopId = resp.data.shop.id;
          wx.setNavigationBarTitle({ title: _this.config.shopName });
        } else {
          wx.alert({
            title: '提示',
            content: '店铺正在完善中！敬请期待'
          });
          return;
        }
        //添加至缓存
        wx.setStorageSync({
          key: 'app.config', // 缓存数据的key
          data: _this.config, // 要缓存的数据
        });
      };

    });
  }
});
