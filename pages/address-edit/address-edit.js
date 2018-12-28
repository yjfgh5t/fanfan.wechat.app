import { tools } from '../../utils/common.js'
Page({
  data: {
    model: {
      id: 0,
      name: "",
      sex: "",
      tel: "",
      district: '',
      street: '',
      detail: '',
      lat: '',
      lng: ''
    },
    id: 0,
    isAddrPage: true
  },
  onLoad: function (e) {
    let model = {
      id: 0,
      name: "",
      sex: "",
      tel: "",
      district: '',
      street: '',
      detail: '',
      lat: '',
      lng: ''
    };
    //判断添加修改
    let editModel = tools.getParams("editAddrModel", true);

    if (editModel != null) {
      //合并对象的值
      model = Object.assign(this.data.model, editModel);
    }
    this.setData({ "model": model });
    this.data.isAddrPage = e.isAddrPage == "true";
  },
  //页面展示事件
  onShow: function () { 
  },
  bindSex: function (e) {
    //设置选择的性别
    this.setData({ "model.sex": e.currentTarget.dataset.sex });
  },
  bindAddr: function (e) {
    let that = this;
    //获取当前地址
    tools.getPermissions('scope.userLocation').then(function (res) {
      if (res.code == 0) {
        if (res.address == "") {
          wx.showToast({
            icon: 'none',
            title: '请选择地址'
          })
        } else {
          that.setData({
            "model.street": res.address,
            "model.lat": res.latitude,
            "model.lng": res.longitude
          });
        }
      }
    });
  },
  bindSubmit: function (e) {
    console.log(e);
    let model = e.detail.value;

    if (model.name == "") {
      wx.showToast({
        icon: 'none',
        title: '请输入联系人姓名'
      })
      return;
    }

    if (this.data.model.sex == "") {
      wx.showToast({
        icon: 'none',
        title: '请选择先生或女士'
      })
      return;
    }

    if (model.tel == "" || model.tel.length != 11) {
      wx.showToast({
        icon: 'none',
        title: '请输入正确的电话'
      })
      return;
    }

    if (model.addr == "") {
      wx.showToast({
        icon: 'none',
        title: '请输入地址'
      })
      return;
    }

    if (model.addrDetail == "") {
      wx.showToast({
        icon: 'none',
        title: '请输入详细地址'
      })
      return;
    }

    let dataModel = this.data.model;

    var requModel = {
      id: dataModel.id,
      userId: 0,
      tel: model.tel,
      name: model.name,
      sex: dataModel.sex,
      district: dataModel.district,
      street: dataModel.street,
      detail: model.addrDetail,
      lat: dataModel.lat,
      lng: dataModel.lng
    };

    tools.getUserInfo((userInfo) => {
      requModel.userId = userInfo.id;
      //提交至数据库
      tools.ajax("api/address/", JSON.stringify(requModel), "JSON", function (resp) {
        if (resp.code == 0) {
          //返回列表页面
          wx.navigateBack({ delta: 1 });
        }
      });
    });
  }

});