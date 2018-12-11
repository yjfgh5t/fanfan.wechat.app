import util from 'util.js'
let tools = {
  //异步请求
  ajax: function(pathname, data, method, success, option) {

    //进度条 
    wx.showLoading();

    let app = getApp();

    let request = { 
      url: app.config.apiHost + pathname,
      method: method,
      data:data,
      headers: {}
    };

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

    if (request.method=="JSON"){
      request.method="POST";
      request.headers = { "Content-Type": "application/json" }
    }else{
      request.headers = { "Content-Type": "application/x-www-form-urlencoded" }
    }

    //设置令牌
    request.headers['x-auth-token'] = app.config.authToken;

    //固定信息
    let base = {
      clientType: app.config.clientType,
      userId: app.userInfo.id,
      customerId: app.config.customerId,
      version: app.config.version,
      time: new Date().getTime()
    };
    //设置header 固定数据
    request.headers.base = JSON.stringify(base);

    let hidenLoading = false;
    //请求
    wx.request({
      url: request.url,
      method: request.method,
      header: request.headers,
      data: request.data,
      dataType: 'json',
      timeout: 60000,
      success: function(res) {
        hidenLoading = true;
        //隐藏加载条
        wx.hideLoading();
        //需要登录
        if (res.statusCode == 401){
            tools.autoLogin(function(hasSuccess){
                //再次执行
                if(hasSuccess){
                  tools.ajax(pathname, data, method, success, option)
                }
            });
          return;
        }

        if (res.data.code != 0) {
          wx.showToast({
            icon: 'none',
            title: res.data.msg || '操作失败，请稍后重试'
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
  getUserInfo: function(callback) {

    let app = getApp();

    //判断是否已经获取到用户信息
    if (app.userInfo.id != -1) {
      callback(app.userInfo);
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
                tools.ajax("api/user/wechatSave", JSON.stringify(sub),"JSON",function(hres){
                    if(hres.code==0){
                      tools.autoLogin(function(hasSuccess,userInfo){
                        callback(userInfo)
                      })
                    }
                })
              }
            });
          }
          });
        } else {
          //确认再次授权
          callback(null)
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
  autoLogin:function(callback){
    wx.login({
      success(lres) {
        tools.ajax('api/user/userAutoLogin', { code: lres.code},'POST', function (res) {
          if (res.code == 0 && res.data!=null) {
            const userInfo = {
              id: res.data.userInfo.userId,
              userNick: res.data.userInfo.tpNick,
              userIcon: res.data.userInfo.tpIcon,
              userSex: res.data.userInfo.tpSex,
              userTpId: res.data.userInfo.tpId
            }
            //设置用户信息
            getApp().userInfo = userInfo;
            //设置登录令牌
            getApp().config.authToken = res.data.token;
            callback(true,userInfo);
          }else{
            callback(false,null)
          }
        })
      }
      });
  }
};
export {
  tools
};