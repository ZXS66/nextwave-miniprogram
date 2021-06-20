import { COLLECTION_MYSORT, COLLECTION_MYSORT_RESULT, SYMBOL_USER_PROFILE } from "../../constants";
import { dateFormat, isNotEmptyString } from "../../util";
// pages/mine/mine.js
const app = getApp();

Page({
  /**
   * initial data
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    hasUserInfo: false,
    logged: false,
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl'), // 如需尝试获取用户信息可改为false
    mysort_join: [], // 我参加的
    mysort_create: [],  // 我发起的
  },
  onLoad: function () {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
  },
  onShow: async function () {
    const db = wx.cloud.database();
    const formData = { _openid: app.globalData.openid };
    const that = this;

    // 调用云函数 (coming soon...)
    const resp = await wx.cloud.callFunction({
      name: 'mysort',
      data: {}
    }).catch(err => {
      console.error('[云函数] [mysort] error: ', err.errMsg);
      return err;
    });
    const result = resp.result;
    if (result) {
      that.setData({
        mysort_join: result.join,
        mysort_create: result.create
      });
    }
    // // 我参加的
    // db.collection(COLLECTION_MYSORT_RESULT).where(formData).get().then(response => {
    //   const mysort_join = response.data;
    //   if (mysort_join && mysort_join.length) {
    //     mysort_join.forEach(v => {
    //       v._time = dateFormat(v.time);
    //     });
    //   }
    //   that.setData({mysort_join});
    //   // console.log('joined');
    //   // console.log(mysort_join);
    // }, console.error);
    // // 我发起的
    // db.collection(COLLECTION_MYSORT).where(formData).get().then(response => {
    //   const mysort_create = response.data;
    //   if (mysort_create && mysort_create.length) {
    //     mysort_create.forEach(v => {
    //       v._time = dateFormat(v.time);
    //     });
    //   }
    //   that.setData({ mysort_create });
    // });
  },
  getUserProfile: async function () {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    const res = await wx.getUserProfile({
      desc: '获取头像昵称用于展示', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    });
    const userInfo = res.userInfo;
    this.setData({
      userInfo,
      hasUserInfo: true,
      avatarUrl: userInfo.avatarUrl,
    });
    // update globally
    app.globalData.userInfo = userInfo;
    // persist the data for next usage
    wx.setStorage({ key: SYMBOL_USER_PROFILE, data: JSON.stringify(userInfo) });
  },
  // the open-type="getUserInfo" is deprecated now, use getUserProfile now
  /** getUserInfo callback */
  onGetUserInfo: function (e) {
    const userInfo = e.detail.userInfo;
    if (!this.data.logged && userInfo) {
      console.log('never be invoked now!');
      // this.setData({
      //   logged: true,
      //   hasUserInfo: true,
      //   userInfo,
      //   avatarUrl: userInfo.avatarUrl,
      // })
      // app.globalData.userInfo = userInfo;
      // wx.setStorage({key:SYMBOL_USER_PROFILE, data:JSON.stringify(userInfo)});
    }
  },
});
