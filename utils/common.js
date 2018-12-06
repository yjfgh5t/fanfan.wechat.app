import md5 from 'md5.js'
import util from 'util.js'
let tools = {
  //异步请求
  ajax: function(pathname, data, method, success, option) {

    //进度条 
    wx.showLoading();

    let app = getApp();
    if (!app.config.networkAvailable) {
      wx.hideLoading();
      if (option != undefined && option.network) {
        option.network(false);
      } else {
        wx.showToast({
          icon: 'none',
          title: "无法连接到网络，请重试"
        });
      }
      return;
    }

    if (option == undefined) option = {};

    if(method=="JSON"){
      method="POST";
      option.headers = { "Content-Type": "application/json" }
    }else{
      option.headers = { "Content-Type": "application/x-www-form-urlencoded" }
    }

    //固定信息
    let base = {
      clientType: app.config.clientType,
      userId: app.userInfo.id,
      customerId: app.config.customerId,
      version: app.config.version,
      time: new Date().getTime()
    };
    //设置签名
    base.sign = md5(base.clientType + '' + base.userId + '' + base.customerId + '' + base.version + '' + base.time + 'miniprogram');

    //设置header 固定数据
    option.headers.base = JSON.stringify(base);

    let hidenLoading = false;

    //请求
    wx.request({
      url: getApp().config.apiHost + pathname,
      method: method,
      header: option.headers,
      data: data,
      dataType: 'json',
      timeout: 60000,
      success: function(res) {
        hidenLoading = true;
        //隐藏加载条
        wx.hideLoading();
        if (res.data.code != 0) {
          const msg = res.data.msg || '操作失败，请稍后重试';
          wx.showToast({
            icon: 'none',
            title: msg
          });
        }
        if (success) {
          success(res.data);
        }
      },
      fail: function(res) {
        if (option != undefined && option.network) {
          option.network(false);
        } else {
          wx.showToast({
            icon: 'none',
            title: "无法连接到网络，请重试"
          });
        }
      },
      complete: function(res) {
        if (!hidenLoading)
          wx.hideLoading();
      }
    });
  },
  //获取授权Code
  getUserInfo: function(success) {

    let app = getApp();

    //判断是否已经获取到用户信息
    if (app.userInfo.id != -1) {
      success(app.userInfo);
      return;
    }

    //判断用户是否授权
    wx.getSetting({
      success: function(res) {
        //是否授权
        if (res.authSetting['scope.userInfo']) {
          wx.login({success(lres){
            wx.getUserInfo({
              success: (res) => {
                const sub ={
                  code: lres.code,
                  tpNick: res.userInfo.nickName,
                  tpIcon: res.userInfo.avatarUrl,
                  tpSex: res.userInfo.gender,
                  tpProvince: res.userInfo.province,
                  tpCity: res.userInfo.city,
                };
                tools.ajax("api/user/wxUser", JSON.stringify(sub),"JSON",function(hres){
                    if(hres.code==0){
                      //缓存用户数据
                      wx.setStorageSync('userInfo', hres.data);
                      app.userInfo = hres.data;
                      success(hres.data)
                    }
                })
              }
            });
          }
          });
        } else {
          //确认再次授权
          wx.showModal({
            title: '授权提示',
            content: '您还未授权,请先授权！', // alert 框的标题
            confirmText: '好的',
            showCancel: false
          });
        }
      }
    })
  },
  //设置全局变量
  setParams: function(objKey, objVal) {
    //设置本地值
    let globalData = getApp().globalData;

    globalData[objKey] = objVal;

  },
  //获取全局变量
  getParams: function(objKey, del) {
    let globalData = getApp().globalData;

    let val = globalData[objKey];

    if (val == undefined)
      return null;

    if (del == true) {
      delete globalData[objKey];
    }
    return val;
  },
  getSign: function(params) {

  }
};
export {
  tools
};