# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

1、定义变量：尽量使用let const
let的作用域较小，只在当前块。var作用域较大。

2、定义方法：采用简写形式
ES6建议使用：将 onReady: function(){} 定义为onReady(){}

3、定义对象、属性
const userName = 'lgk'
const person = {
  //建议将userName:userName 简写为 userName
  userName,
  age:23,
}

4、箭头函数
将
wx.cloud.callFunction({
  name:'login'
}).then(function(res){
  console.log(res)  //打印
  this.setData({  //赋值
    openid:res.result.openid
  })
})
改写成
wx.cloud.callFunction({
  name:'login'
}).then((res) =>{  //箭头函数
  console.log(res)
})










# mini-music
