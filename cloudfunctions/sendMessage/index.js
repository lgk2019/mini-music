// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()
  
  const result = await cloud.openapi.templateMessage.send({
    touser: OPENID,
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      thing1: {
        value: '评价完成'
      },
      thing3: {
        value: event.content
      }
    },
    templateId: '2lGQSz - vID6assTPO2PsPC4RLHgT--ZM_v - E6ToyFXM', 
    formId: event.formId,
  })
  return result
}