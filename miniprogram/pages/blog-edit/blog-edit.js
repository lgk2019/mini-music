// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 180 //输入文字的最大个数
const MAX_IMG_NUM = 9 //上传图片的最大数量
const db = wx.cloud.database()
let content = '' //表示当前输入的文字内容 
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    selectPhoto: true, //添加图片的元素是否显示
  },

  onInput(event) {
    // console.log(event.detail.value)
    let wordsNum = event.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `字数最多为${MAX_WORDS_NUM}个`
    }
    this.setData({
      wordsNum: wordsNum,
    })
    content = event.detail.value
  },

  onfocus(event) {
    console.log(event) //模拟器获取的键盘高度
    this.setData({
      footerBottom: event.detail.height
    })
  },
  onblur() {
    this.setData({
      footerBottom: 0,
    })
  },

  onChoseImage() {
    //还能再选几张
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 还能再选几张
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true,
        })
      },
    })
  },

  onDelImage(event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },

  onPreviewImage(event) {
    wx.previewImage({
      urls: ['this.data.images'],
      current: event.target.dataset.imgsrc,
    })
  },

  send() {
    //1、图片->云存储  fileID 云文件ID
    //2、数据->云数据库
    //3、数据库存储有：图片内容、图片fileID、openid、昵称、头像、时间
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入描述',
        content: '',
      })
      return
    }

    wx.showLoading({
      title: '发布中',
    })
    let promiseArr = []
    let fileIds = []
    //进行图片上传
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        //得到文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.log(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    //将云存储的内容存入到云数据库
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate(), //获取服务端的时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
      //刷新，并返回blog页面
      wx.navigateBack({
        // getCurrentPages()
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    userInfo = options
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})