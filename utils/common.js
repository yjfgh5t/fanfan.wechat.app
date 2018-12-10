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

    //设置令牌
    option.headers['x-auth-token'] = app.config.authToken;

    //固定信息
    let base = {
      clientType: app.config.clientType,
      userId: app.userInfo.id,
      customerId: app.config.customerId,
      version: app.config.version,
      time: new Date().getTime()
    };
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
        //需要登录
        if (res.statusCode == 401){
          tools.autoLogin();
          return;
        }

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
                tools.ajax("api/user/appUser/wxUser", JSON.stringify(sub),"JSON",function(hres){
                    if(hres.code==0){
                      const userInfo = {
                        id: hres.data.userInfo.userId,
                        userNick: hres.data.userInfo.tpNick,
                        userIcon: hres.data.userInfo.tpIcon,
                        userSex: hres.data.userInfo.tpSex
                      }
                      //缓存用户数据
                      wx.setStorageSync('userInfo', userInfo);
                      //设置用户信息
                      getApp().userInfo = userInfo;
                      //设置登录令牌
                      getApp().config.authToken = hres.data.token;
                      success(hres.data)
                    }
                })
              }
            });
          }
          });
        } else {
          //确认再次授权
          success(null)
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
  //自动登录
  autoLogin:function(){
    tools.ajax('api/user/appUser/autoLogin', {}, function(res){
      if(res.code==0){
        getApp().config.authToken = res.data.token;
      }
    })
  }
};
export {
  tools
};