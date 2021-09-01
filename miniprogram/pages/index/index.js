//index.js
import { isNotEmptyString } from "../../util";
import { SYMBOL_USER_PROFILE } from "../../constants";
const app = getApp();

Page({
  data: {
    isAdmin: false
  },
  onLoad: function () {
    this.init();
  },
  /** initilization */
  init: async function () {
    /// setup app.globalData.openid, app.globalData.isAdmin from storage 
    /// (or cloud function `login` if not presented)    
    const resp_isAdmin = await wx.getStorage({ key: 'isAdmin' }).catch(console.error);
    let isAdmin = resp_isAdmin ? resp_isAdmin.data : false;
    wx.getStorage({
      key: 'openid',
      complete: async resp => {
        let openid = resp.data;
        if (!isNotEmptyString(openid)) {
          // 调用云函数 以获取 openid, isAdmin
          const res = await wx.cloud.callFunction({
            name: 'login',
            data: {}
          });
          openid = res.result.openid;
          isAdmin = res.result.isAdmin;
          console.log('[云函数] [login]', res.result);
          wx.setStorage({ key: 'openid', data: openid });
          wx.setStorage({ key: 'isAdmin', data: isAdmin });
        }
        app.globalData.openid = openid;
        app.globalData.isAdmin = isAdmin;
        this.setData({ isAdmin });
      }
    });
    /// setup app.globalData.userInfo from storage
    wx.getStorage({
      key: SYMBOL_USER_PROFILE,
      complete: resp => {
        const userInfoString = resp.data;
        if (isNotEmptyString(userInfoString)) {
          const userInfo = JSON.parse(userInfoString);
          app.globalData.userInfo = userInfo;
        }
      }
    });
  },
  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {
    if (this.data.mysort) {
      return {
        title: '欢迎您使用时代残党小程序',
        // imageUrl: ''
      };
    }
  },
});
