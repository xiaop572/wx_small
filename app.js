//app.js
var util=require('./utils/util.js')
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var loginObj = {}
    var p = new Promise((resolve, reject) => {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          resolve(res)
        }
      })
    }).then(res => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: util.baseUrl +"/api/wx/login",
          method:'post',
          data:{
            code:res.code
          },
          success:res=>{
            resolve(res.data)
          }
        })
      })
    }).then(res=>{
      Object.assign(loginObj,JSON.parse(res.body))
      return new Promise((resolve,reject)=>{
        // 获取用户信息
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res.userInfo
                  Object.assign(loginObj, res.userInfo)
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                  resolve(res)
                }
              })
            }
          }
        })
      })
    }).then(res=>{
      wx.request({
        url: util.baseUrl +"/api/wx/insetUserInfo",
        method:'post',
        data:loginObj,
        success:res=>{
          console.log(res)
        }
      })
    })
  },
  globalData: {
    userInfo: null
  }
})