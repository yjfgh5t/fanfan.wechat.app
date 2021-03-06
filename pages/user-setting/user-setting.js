import { tools } from '../../utils/common.js'
Page({
  data: {
    iconCoupon: '/imgs/icon_me_coupon.png',
    iconAddr: '/imgs/icon_me_addr.png',
    iconOrder: "/imgs/icon_menu_order_active.png",
    model: {
      icon: '/imgs/icon_head_a.png',
      nick: '',
    },
    showLayerAouth:false
  },
  onShow: function (e) {
    let _this = this;
    tools.getUserInfo((user) => {
      console.log(user)
      if(user==null){
        _this.setData({ showLayerAouth:true});
      }else{
        _this.setData({ 
          model: { 
            icon: user.userIcon, 
            nick: user.userNick
            },
           showLayerAouth:false });
      }
    });

  },
  bindCoupon: function (e) {
    wx.navigateTo({ url: "/pages/me/me-coupon/me-coupon" });
  },
  bindAddr: function (e) {
    wx.navigateTo({ url: "/pages/address/address" });
  },
  bindExit: function () {
    wx.removeStorageSync({
      key: 'userInfo', // 缓存数据的key
    });
    getApp().userInfo.id = -1;
    wx.navigateBack({ url: "/pages/home/home" });
  },
  bindOrder: function (e) {
    wx.navigateTo({ url: "/pages/order-list/order-list" });
  }
});