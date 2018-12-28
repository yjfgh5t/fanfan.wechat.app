const Promise = require('bulebird.js');
let util ={
  // 获取Setting
  getSetting:function (socpeName) {
    var result = new Promise(function (resolve, reject) {
      wx.getSetting({
        success: function (res) {
          if (res.authSetting[socpeName]) {
            resolve(res);
          } else {
            reject(res);
          }
        },
        fail: function(res){
          reject(res)
        }
      })
    });
    return result;
  }
}

export {util}
