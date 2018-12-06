import {
  tools
} from '../../utils/common.js'
Page({
  data: {
    imgs:{
      notice: '/imgs/icon_notice.png',
    },
    codeModel: {
      text: '发送验证码',
      disabled: false,
      showImgCode: false,
      code: '',
      imgCodeSrc: 'http://localhost:8081/api/info/imgcode/5821243531'
    },
    showImgCodeLayer: false,
    showAboutLayer: true,
    model: {
      mobile: '',
      pwd: '',
      confirmPwd: '',
      name: '',
      mobileCode: ''
    }
  },
  onShow: function() {},
  // 绑定发送二维码
  bindMobileCode: function() {
    if (this.data.codeModel.disabled) {
      return;
    }
    if (this.data.model.mobile.length !== 11) {
      return wx.showToast({
        icon: 'none',
        title: '请输入有效的手机号'
      });
    }
    // 显示图片二维码
    if (this.data.codeModel.showImgCode) {
      this.setData({
        "showImgCodeLayer": true
      });
      // 刷新图片二维码
      this.refreshCodeImg()
    } else {
      this.sendMobileCode()
      // 设置下次发送需显输入图片验证码
      this.setData({
        "codeModel.showImgCode": true
      });
    }
  },
  // 绑定弹出层事件
  bindImgCodeLayer: function(confirm) {
    if (confirm) {
      if (this.data.codeModel.code === '') {
        return wx.showToast({
          icon: 'none',
          title: '请输入图形验证码'
        });
      }
      // 发送验证码
      this.sendMobileCode()
    } else {
      this.setData({
        "showImgCodeLayer": true
      });
    }
  },
  // 发送短信验证码
  sendMobileCode: function() {
    let _that = this
    let params = {
      mobile: this.data.model.mobile,
      imgCode: this.data.codeModel.code
    }
    if (_that.data.codeModel.disabled) {
      return;
    }

    //设置不可再发送
    _that.setData({
      "codeModel.disabled": true
    });

    tools.ajax('api/user/sendCode', params, 'POST', function(res) {
      if (res.code === 0) {
        wx.showToast({
          icon: 'none',
          title: '验证码已发送请注意查收'
        });
        _that.setData({
          "codeModel.disabled": true,
          "showImgCodeLayer": false,
          "codeModel.code": ""
        });
        // 设置计数器
        let start = 60
        let interval = setInterval(function() {
          if (--start === 0) {
            clearInterval(interval)
            // 设置验证码
            _that.setData({
              "codeModel.text": "发送验证码",
              "codeModel.disabled": false
            });
          } else {
            _that.setData({
              "codeModel.text": start + 's'
            });
          }
        }, 1000)
      } else {
        //设置可以再发送
        _that.setData({
          "codeModel.disabled": false,
          "showImgCodeLayer": true
        });
        _that.refreshCodeImg();
      }
    })
  },
  // 刷新图片验证码
  refreshCodeImg: function() {
    this.setData({
      "codeModel.imgCodeSrc": getApp().config.apiHost + 'api/info/imgcode/' + this.data.model.mobile + '?v=' + parseInt(Math.random() * 100)
    });
  },
  bindSubmit: function() {
    let _this = this
    if (_this.data.model.name === '') {
      return wx.showToast({
        icon: 'none',
        title: '请输入商户姓名'
      });
    }
    if (_this.data.model.mobile === '') {
      return wx.showToast({
        icon: 'none',
        title: '请输入手机号'
      });
    }
    if (_this.data.model.mobile === '' || _this.data.model.mobile.length !== 11 || isNaN(_this.data.model.mobile)) {
      return wx.showToast({
        icon: 'none',
        title: '您输入的手机号格式不正确'
      });
    }
    if (_this.data.model.mobileCode === '') {
      return wx.showToast({
        icon: 'none',
        title: '请输入手机验证码'
      });
    }
    if (_this.data.model.pwd === '') {
      return wx.showToast({
        icon: 'none',
        title: '请输入密码'
      });
    }
    if (_this.data.model.pwd.length < 6) {
      return wx.showToast({
        icon: 'none',
        title: '密码长度不能小于6个字符'
      });
    }
    if (_this.data.model.confirmPwd === '') {
      return wx.showToast({
        icon: 'none',
        title: '请输入确认密码'
      });
    }
    if (_this.data.model.confirmPwd.length < 6) {
      return wx.showToast({
        icon: 'none',
        title: '确认密码长度不能小于6个字符'
      });
    }
    if (_this.data.model.pwd !== _this.data.model.confirmPwd) {
      return wx.showToast({
        icon: 'none',
        title: '密码和确认密码不匹配'
      });
    }

    let subData = {
      code: _this.data.model.mobileCode,
      userId: 0,
      name: _this.data.model.name,
      mobile: _this.data.model.mobile,
      password: _this.data.model.pwd
    }
    // 执行注册
    tools.ajax('api/user/customer/register', JSON.stringify(subData), 'POST', function(res) {
      if (res.code === 0 && res.data !== '') {
        wx.showModal({
          title: '提示',
          content: '注册成功，请查收短信,点击短信中的链接下载商户版APK',
          showCancel:false,
          success: function() {
            //返回首页
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });
  },
  //失去焦点事件
  onItemBlur: function(e) {
    console.log(e)
    this.setData({
      [e.target.dataset.field]: e.detail.value
    });
  },
  bindModalClose: function() {
    this.setData({
      "showImgCodeLayer": false
    })
  },
  bindConfirmAbout: function() {
    this.setData({
      "showAboutLayer": false
    });
    wx.setClipboardData({
      data: 'http://t.cn/Ew2ra6G',  
      success: function() {
        wx.showToast({
          icon:'none',
          duration: 3000,
          title: '已复制饭饭商户版APK下载地址，可在浏览器中打开下载'
        });
      }
    });
  },
  bindNotifyClick: function() {
    this.setData({
      "showAboutLayer": true
    });
  }
})