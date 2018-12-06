import { tools } from '../../utils/common.js'
Page({
  data: {
    remarkPepper: [
      { title: '不要辣', checked: false },
      { title: '微辣', checked: false },
      { title: '中辣', checked: false },
      { title: '重辣', checked: false }
    ],
    remarkSpicy: [
      { title: '不要麻', checked: false },
      { title: '微麻', checked: false },
      { title: '中麻', checked: false },
      { title: '重麻', checked: false }
    ],
    remarkOther: [
      { title: '不要香菜', checked: false },
      { title: '不要葱姜蒜', checked: false },
      { title: '多点醋', checked: false }
    ],
    remark: ""
  },
  onShow: function () {
    var orderRemark = getApp().globalData.orderRemark;
    if (orderRemark) {
      let setData = {};
      //设置辣椒备注
      if (orderRemark.remarkPepper != "") {
        this.data.remarkPepper.forEach(function (item, i) {
          if (item.title == orderRemark.remarkPepper) {
            setData["remarkPepper[" + i + "].checked"] = true;
          }
        });
      }

      //设置辣椒备注
      if (orderRemark.remarkSpicy != "") {
        this.data.remarkSpicy.forEach(function (item, i) {
          if (item.title == orderRemark.remarkSpicy) {
            setData["remarkSpicy[" + i + "].checked"] = true;
          }
        });
      }

      //设置不要备注
      if (orderRemark.remarkOther.length > 0) {
        this.data.remarkOther.forEach(function (item, i) {

          orderRemark.remarkOther.forEach(function (jtem, j) {
            if (item.title == jtem) {
              setData["remarkOther[" + i + "].checked"] = true;
            }
          })

        })
      }
      //设置其它备注
      setData["remark"] = orderRemark.remark;

      this.setData(setData);
    }
  },
  //确定
  bindSubmit: function (e) {

    var formData = e.detail.value;

    //拼接文本
    formData.text = "";

    //辣
    if (formData.remarkPepper == undefined) {
      formData.remarkPepper = "";
    } else {
      formData.text = formData.remarkPepper + "，";
    }

    //麻
    if (formData.remarkSpicy == undefined) {
      formData.remarkSpicy = "";
    } else {
      formData.text += formData.remarkSpicy + "，";
    }

    //其它描述
    for (let i in formData.remarkOther) {
      formData.text += formData.remarkOther[i] + "，";
    }

    //自定义描述
    if (formData.remark != "") {
      formData.text += formData.remark + "，";
    }

    if (formData.text != "") {
      formData.text = formData.text.substr(0, formData.text.length - 1)
    }

    //设置参数
    tools.setParams("orderRemark", formData);

    wx.navigateBack({ delta: 1 });
  },
  //radio点击
  bindRadio: function (e) {
    //this.setData("remarkSpicy[0].checked",true);
  }
});