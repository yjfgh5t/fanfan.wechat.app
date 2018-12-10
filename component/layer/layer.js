Component({
  options: { multipleSlots: true },
  properties: {
    title:{
      type:String,
      value:"标题"
    },
    cancelText: {
      type: String,
      value: "取消"
    },
    confirmText:{
      type: String,
      value: "确定"
    },
    cancelShow: {
      type: Boolean,
      value: true
    },
    confirmShow:{
      type: Boolean,
      value: true
    },
    show:{
      type:Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    confirm:function(){
      this.triggerEvent('confirm')
    },
    cancel:function(){
      this.triggerEvent('cancel')
    }
  }
})
