// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID,
    // page:"pages/blog/blog"
    //用于设置小程序码周围线条颜色
    // lineColor: {
    //   'r': 211,
    //   'g': 60,
    //   'b': 57,
    // },
    //设置背景透明
    // isHyaline: true,
  })
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
    fileContent: result.buffer
  })
  return upload.fileID
}