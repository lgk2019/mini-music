// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const rp = require('request-promise')
const URL = 'http://musicapi.xiecheng.live/personalized'

const db = cloud.database()
const playlistCollection = db.collection('playlist')
const MAX_LIMIT = 10

// 云函数入口函数
exports.main = async (event, context) => {
  //当在云函数中获取数据时最多获取100条数据，在小程序端最多获取20条数据
  // const list = await playlistCollection.get()

  //下面代码用于突破100条的限制
  const countResult = await playlistCollection.count()
  const total = countResult.total
  //Math.ceil()用于向上取整
  const batchTimes = Math.ceil(total / MAX_LIMIT) 
  const tasks = []
  for(let i=0; i < batchTimes; i++){
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let list = {
    data:[]
  }

  if(tasks.length > 0){
    list = (await Promise.all(tasks)).reduce((acc,cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
//获得服务器最新信息
  const playlist = await rp(URL).then((res)=>{
  return JSON.parse(res).result
  })
 //对获得的数据去重
 const newData = []
 for(let i=0,len1 = playlist.length;i < len1;i++){
   let flag = true
   for(let j=0,len2 = list.data.length;j < len2;j++){
     if(playlist[i].id === list.data[i].id){
       flag = false
       break
     }
   }
   if(flag){
     newData.push(playlist[i])
   }
 }

  for (let i = 0, len = newData.length;i<len;i++){
    await playlistCollection.add({
      data:{
        ...newData[i],
        createTime:db.serverDate(),
      }
    }).then((res)=>{
      console.log('插入成功')
    }).catch((err)=>{
      console.log('插入失败')
    })
  }
  return newData.length
}