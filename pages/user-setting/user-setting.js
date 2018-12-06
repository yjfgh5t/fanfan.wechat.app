import { tools } from '../../utils/common.js'
Page({
  data: {
    iconCoupon: '/imgs/icon_me_coupon.png',
    iconAddr: '/imgs/icon_me_addr.png',
    iconOrder: "/imgs/icon_menu_order_active.png",
    model: {
      icon: '/imgs/icon_head_a.png',
      nick: '',
    }
  },
  onLoad: function (e) {

    let _this = this;

    tools.getUserInfo((user) => {
      _this.setData({ model: { icon: user.userIcon, nick: user.userNick } });
    });

  },
  bindCoupon: function (e) {
    wx.navigateTo({ url: "/pages/me/me-coupon/me-coupon" });
  },
  bindAddr: function (e) {
    wx.navigateTo({ url: "/pages/me/me-addr/me-addr" });
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