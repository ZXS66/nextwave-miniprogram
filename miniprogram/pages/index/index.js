//index.js
import { isNotEmptyString } from "../../util";
import { SYMBOL_USER_PROFILE } from "../../constants";
const app = getApp();

Page({
  data: {
  },

  onLoad: function () {
    this.tryInitUserOpenid();
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

  /** setup app.globalData.openid */
  tryInitUserOpenid: function () {
    wx.getStorage({
      key: 'openid',
      complete: async resp => {
        const openid = resp.data;
        if (!isNotEmptyString(openid)) {
          // 调用云函数 以获取 openid
          const res = await wx.cloud.callFunction({
            name: 'login',
            data: {}
          });
          openid = res.result.openid;
          console.log('[云函数] [login] user openid: ', openid);
          await wx.setStorage({ key: 'openid', data: openid });
        }
        app.globalData.openid = openid;
      }
    });
  }
});
