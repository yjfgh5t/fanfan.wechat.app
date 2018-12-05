import { tools } from '../../utils/common.js'
import { order } from '../../utils/create-order.js'
Page({
  data: {
    name: 'hellow',
    headImg: '/imgs/img_index_head.jpeg',
    defaultImg: '/imgs/img_item_default.png',
    btnMinus: '/imgs/icon_btn_minus.png',
    btnAdd: '/imgs/icon_btn_add.png',
    btnCar: '/imgs/icon_btn_car.png',
    btnClose: '/imgs/icon_btn_add_white.png',
    btnUser: '/imgs/icon_head.png',
    imgError: '/imgs/img_error.png',
    btnRecommend: '/imgs/icon_recommend.png',
    restMessage: '',
    showMark: false,
    //是否营业中
    isBusiness: false,
    itemArry: [
      //{id:'1001',title:'招聘黄焖鸡米饭-A',active:[{atype:1,text:'前场九折起'}],price:18.1,salePrice:12, icon:'/img/img_item_default.png',desc:'黄焖鸡米饭 、红烧排骨粉黄焖鸡米饭黄黄'},
    ],
    //商品分类
    categoryArray: [
      //{ id: 1, name:'',order:''}
    ],
    //选中的类别
    choiseCategory: -1,
    //选中的商品
    choiseCommodity: [],
    viewContentHeight: 0,
    carData: {
      show: false,
      //{id:'',title:'',type:1/5}
      itemArry: [],
      //{id:count }
      itemIdArry: {},
      //总数量
      count: 0,
      //总金额
      price: 0,
      //起送价格
      minPrice: 0.0
    },
    //规格
    norms: {
      show: false,
      selected: {},
      commodity: {},
      items: []
    },
    recommend: {
      show: false,
      hasShow: [],
      selected: { id: 1, showTitle: "", title: '', salePrice: 0.0, icon: '' },
      data: [
        //{ id: 1, title: '', salePrice: 2.3, icon:''}
      ]
    },
    //是否显示提示
    showContact: false,
    // 加载状态 1：加载中 2:加载完成  3:加载异常
    loadState: 1
  },
  onReady: function () {
    //初始加载数据
    getApp().loadData();
    
    this.lazyLoad(this);
  },
  onShow: function () {
    //清空购物车
    this.privClearCar();
    //this.initSubBtn();
  },
  lazyLoad: function (that) {
    if (getApp().config.customerId == -1) {
      console.log(1);
      setTimeout(() => { that.lazyLoad(that) }, 1000);
    } else {
      console.log(2);
      that.loadData();
    }
  },
  //加载数据
  loadData: function () {
    let _this = this;
    let _app = getApp();

    //商品数据
    tools.ajax('api/commodity/commodityWithCategory', {}, 'GET', function (res) {
      if (res.code == 0 && res.data.commodity && res.data.commodity.length > 0) {
        wx.setNavigationBarTitle({ title: _app.config.shopName });
        //设置商品数据
        _this.setData({
          "itemArry": _this.convertComodity(res.data.commodity),
          "categoryArray": res.data.category,
          "carData.minPrice": _app.config.minTakePrice,
          "isBusiness": _app.config.shopState == 1,
          "showContact": _app.config.showContact,
          "loadState": 2
        });
        if (res.data.category.length > 0) {
          _this.changeCategory(res.data.category[0].id)
        }

        //判断是否营业
        if (_this.data.isBusiness) {
          let starTime = parseInt(_app.config.startBusiTime.replace(":", ""));
          let endTime = parseInt(_app.config.endBusiTime.replace(":", ""));
          let currentTime = parseInt(new Date().getHours() + '' + new Date().getMinutes())
          if (starTime > currentTime || endTime < currentTime) {
            _this.setData({ "isBusiness": false, "restMessage": '店铺已打烊! 营业时间为 ' + _app.config.startBusiTime + ' - ' + _app.config.endBusiTime })
          }
        } else {
          _this.setData({ "restMessage": '店铺已打烊! 请稍后再来！' })
        }

      } else {
        _this.setData({ "loadState": 3 });
      }

      _this.initContentHeight();
    });

    //推荐商品
    tools.ajax('api/commodity/getRecommend', {}, 'GET', function (res) {
      if (res.code == 0 && res.data && res.data.length > 0) {
        let data = res.data.map(item => {
          return {
            id: item.id,
            title: item.title,
            icon: item.icon.replace('.min', ''),
            salePrice: item.salePrice
          }
        });
        _this.setData({ "recommend.data": data });

      }
    });

  },
  //todo 初始化提交按钮
  initSubBtn:function(){

    let button = wx.createUserInfoButton({
      type: 'submit',
      text: '去结算',
      style: {
        left: 10,
        top: 76,
        width: 200,
        height: 40,
        lineHeight: 40,
        backgroundColor: '#ff0000',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        borderRadius: 4
      }
    })
    button.onTap((res) => {
      console.log(res)
    })

  },
  //显示购物车
  showCar: function (e) {
    this.setData({
      'showMark': true,
      'carData.show': true,
    }
    );
  },
  //关闭购物车
  closeCar: function (e) {
    this.setData({
      'showMark': false,
      'carData.show': false,
    });
  },
  itemAddMinus: function (e) {
    const option = e.target.dataset.option;
    const commodity = { id: e.target.dataset.id };

    //购物车中的commodityid
    if (e.target.dataset.commodityId) {
      commodity.commodityId = e.target.dataset.commodityId;
    }

    let model = null;

    for (let i = 0; i < this.data.itemArry.length; i++) {
      if (this.data.itemArry[i].id == commodity.id) {
        model = this.data.itemArry[i];
        break;
      }
    }

    //判断规格
    if (model != null && model.norms.length > 0) {
      if (option === 'add') {
        //显示规格
        let norms = {
          commodity: model,
          selected: model.norms[0],
          show: true,
          items: model.norms
        }
        this.setData({ norms: norms, showMark: true });
        return;
      } else {
        return wx.showToast({ content: '多规格商品需在购物车中删除' });
      }
    }
    //包装数据
    if (model != null) {
      commodity.id = model.id;
      commodity.title = model.title;
      commodity.salePrice = model.salePrice;
      commodity.commodityId = model.id;
    }

    //类型 1:商品 5:商品规格
    commodity.type = (commodity.id == commodity.commodityId ? 1 : 5);

    //执行添加或减去
    this.addMinus(option, commodity);
  },
  //添加减去商品
  addMinus: function (option, commodity) {
    //选种的商品数据
    let carItemData = this.data.carData.itemArry;
    //商品Id数据
    let carItemIds = this.data.carData.itemIdArry;

    //设置数据
    if (carItemIds[commodity.id] == undefined) {
      //设置默认数据
      carItemIds[commodity.id] = 0;
      carItemData.push({ id: commodity.id, title: commodity.title, salePrice: commodity.salePrice, commodityId: commodity.commodityId, type: commodity.type });
    }

    //添加数量
    let addCount = option == 'add' ? 1 : -1;

    if ((carItemIds[commodity.id] + addCount) <= 0) {
      //删除数据 
      delete carItemIds[commodity.id];
      //删除数组
      for (let i in carItemData) {
        if (carItemData[i].id == commodity.id) {
          carItemData.splice(i, 1);
        }
      }
      //删除规格-商品的数据
      if (commodity.id !== commodity.commodityId) {
        //删除数据 
        if ((carItemIds[commodity.commodityId] + addCount) <= 0) {
          delete carItemIds[commodity.commodityId];
        } else {
          carItemIds[commodity.commodityId] = carItemIds[commodity.commodityId] + addCount;
        }
      }
    } else {
      carItemIds[commodity.id] = carItemIds[commodity.id] + addCount;
      //如果id未规格id
      if (commodity.id !== commodity.commodityId) {
        if (carItemIds[commodity.commodityId] == undefined) {
          carItemIds[commodity.commodityId] = 0;
        }
        carItemIds[commodity.commodityId] = carItemIds[commodity.commodityId] + addCount;
      }
    }

    //计算总数量
    let count = 0, price = 0;
    carItemData.forEach(function (item) {
      count += carItemIds[item.id];
      price += carItemIds[item.id] * item.salePrice;
    });

    //设置数据
    this.setData({
      'carData.itemArry': carItemData,
      'carData.itemIdArry': carItemIds,
      'carData.count': count,
      'carData.price': price.toFixed(2),
    });
  },
  //选择规格
  bindSelNorms: function (e) {
    const id = e.target.dataset.id;
    let _this = this;
    this.data.norms.items.forEach(function (item) {
      if (item.id === id) {
        _this.setData({ "norms.selected": item });
        return false;
      }
    });
  },
  bindChoiseNorms: function (e) {
    let sure = e.target.dataset.sure;
    if (sure == 'true') {
      let norms = this.data.norms;
      let commodity = {
        id: norms.selected.id,
        title: norms.commodity.title + "-" + norms.selected.title,
        salePrice: norms.selected.price,
        commodityId: norms.commodity.id,
        type: 5
      };
      this.addMinus('add', commodity);
    }
    this.setData({ "norms.show": false, "showMark": false });
  },
  //提交按钮
  bindSubmit: function (e) {
    //刷新显示推荐商品
    if (this.data.recommend.data.length > 0 && this.data.recommend.hasShow.length < this.data.recommend.data.length) {
      this.bindRefreshRecommend();
    } else {
      //直接提交
      this.privSubmitMain();
    }
  },
  //form提交事件
  formSubmit: function (e) {
    if (e.detail.formId) {
      tools.ajax('api/formId/', { formId: e.detail.formId }, 'POST', function (res) {
        console.log(res.code)
      })
    }
  },
  //刷新推荐
  bindRefreshRecommend: function () {
    let length = this.data.recommend.data.length;
    if (this.data.recommend.hasShow.length < length) {
      let index = Math.floor(Math.random() * 10) % length
      //已经显示 重新刷新
      if (this.data.recommend.hasShow.indexOf(index) > 0) {
        this.bindRefreshRecommend();
        return;
      }
      //记录展示了
      this.data.recommend.hasShow.push(index);
      let selected = this.data.recommend.data[index];
      //是否选择了改推荐商品
      if (this.data.carData.itemIdArry[selected.id] == undefined) {
        selected.showTitle = selected.title;
        this.setData({ "recommend.selected": selected, "recommend.show": true, "showMark": "true" });
      } else {
        this.bindRefreshRecommend();
      }
    } else {
      //如果现实推荐中 则提示
      if (this.data.recommend.show) {
        wx.showToast({
          content: "没有更多的推荐了"
        });
      } else {
        //提交订单
        this.privSubmitMain();
      }
    }
  },
  //关闭推荐
  bindCloseRecommend: function () {
    this.setData({ "recommend.show": false, "showMark": false });
    this.privSubmitMain();
  },
  //添加推荐商品
  bindAddRecommend: function () {
    let selected = this.data.recommend.selected;
    //包装数据
    let commodity = {
      id: selected.id,
      title: selected.title,
      salePrice: selected.salePrice,
      commodityId: selected.id,
      type: 1
    }
    //执行添加或减去
    this.addMinus('add', commodity);
    //关闭并提交
    this.bindCloseRecommend();
  },
  //提交订单
  privSubmitMain: function () {
    //选择的菜单
    let idArry = this.data.carData.itemIdArry;

    let itemArry = this.data.carData.itemArry;

    //订单详情集合
    let details = itemArry.map(function (item) {
      return {
        outId: item.id,
        outSize: idArry[item.id],
        outType: item.type,
        commodityId: item.commodityId
      }
    });

    //订单计价
    order.calculate({ detailList: details }, function (resp) {
      if (resp.code == 0) {
        //订单信息存入全局变量
        tools.setParams("temOrder", resp.data);

        //跳转
        wx.navigateTo({
          url: '/pages/order/order-sure/order-sure'
        });
      }
    })
  },
  //清空购物车
  privClearCar: function () {

    //是否清空购物车
    let clearCar = tools.getParams("clearCar", true);

    if (clearCar != null) {
      this.setData({
        'showMark': false,
        'carData.show': false,
        'carData.itemArry': [],
        'carData.itemIdArry': {},
        'carData.count': 0,
        'carData.price': 0,
        'recommend.hasShow': []
      });
      //设置菜单选择
      this.changeCategory(null);
    }
  },
  userClick: function () {
    wx.navigateTo({
      url: '/pages/me/me'
    })
  },
  //转换商品数据
  convertComodity: function (commoditys) {
    let tempCommodity = [];
    commoditys.forEach(function (item) {

      let norms = [];
      if (item.extendList != null && item.extendList.length > 0) {
        norms = item.extendList.map(function (item) {
          return {
            id: item.id,
            price: item.commodityPrice,
            title: item.title
          }
        });
      }

      tempCommodity.push({
        id: item.id,
        title: item.title,
        price: item.price,
        salePrice: item.salePrice,
        icon: item.icon,
        desc: item.desc,
        active: item.active,
        categoryId: item.categoryId,
        norms: norms
      })
    })

    return tempCommodity;
  },
  bindContact: function () {
    wx.navigateTo({ url: '/pages/register/register' });
  },
  //选择分类
  changeCategory: function (obj) {
    console.log(obj)
    let choiseId = -1;
    //默认选择第一个
    if (obj == null) {
      if (this.data.categoryArray.length > 0) {
        choiseId = this.data.categoryArray[0].id;
      }
    } else if (obj.target) { //获取事件中的参数id
      choiseId = obj.target.dataset.id;
    } else {
      //传递的id
      choiseId = obj;
    }

    if (choiseId != -1) {
      let categoryCommodity = this.data.itemArry.filter(function (item) {
        return item.categoryId == choiseId;
      })

      this.setData({
        "choiseCommodity": categoryCommodity,
        "choiseCategory": choiseId
      });
    }
  },
  //设置高度
  initContentHeight: function () {
    //设置高度
    let _that = this;
    wx.getSystemInfo({
      success: (win) => {
        var query = wx.createSelectorQuery().in(_that)
        query.select(".view-lay-car").boundingClientRect().exec((ret) => {
          console.log(JSON.stringify(win))
          if (ret[0] != null) {
            let height = win.windowHeight - ret[0].height;
            _that.setData({ "viewContentHeight": height })
          }
        })
      },
    });
  }
});