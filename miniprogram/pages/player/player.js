// pages/player/player.js
let musiclist = []
//正在播放歌曲的index
let nowPlayingIndex = 0
//获取全局唯一的背景音频管理器
const backgroundAudioManger = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isplaying: false, //false表示不播放，true表示播放
    isLyricShow: false, //表示当前歌词是否显示
    lyric: '',
    isSame: false, //表示是否为同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },

  _loadMusicDetail(musicId) {
    if (musicId == app.getPlayMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false,
      })
    }
    if (!this.data.isSame) {
      backgroundAudioManger.stop()
    }

    let music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl,
      isplaying: false,

    })

    app.setPlayMusicId(musicId)

    wx.showLoading({
      title: '歌曲加载中',
    })
    wx.cloud.callFunction({
      name: 'lgk-music',
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then((res) => {
      console.log(res)
      // console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result)
      if (result.data[0].url == null) {
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if (!this.data.isSame) {
        backgroundAudioManger.src = result.data[0].url,
          backgroundAudioManger.title = music.name,
          backgroundAudioManger.coverImgUrl = music.al.picUrl,
          backgroundAudioManger.singer = music.ar[0].name,
          backgroundAudioManger.epname = music.al.name
      }
      this.setData({
        isplaying: true
      })
      wx.hideLoading()

      //加载歌词
      wx.cloud.callFunction({
        name: 'lgk-music',
        data: {
          musicId,
          $url: 'lyric',
        }
      }).then((res) => {
        console.log(res)
        let lyric = '暂无歌词'
        // const lrc = JSON.parse(res.result).lrc
        // const lrc = null.lrc
        // const lrc = res.result.lrc
        // if (lrc) {
        //   lyric = lrc.lyric
        // }
        this.setData({
          lyric
        })
      })
    })
  },

  togglePlaying() {
    if (this.data.isplaying) {
      backgroundAudioManger.pause()
    } else {
      backgroundAudioManger.play()
    }
    this.setData({
      isplaying: !this.data.isplaying
    })
  },
  onPrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  timeUpdate(event) {
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  onPlay() {
    this.setData({
      isplaying: true,
    })
  },
  onPause() {
    this.setData({
      isplaying: false,
    })
  },

})