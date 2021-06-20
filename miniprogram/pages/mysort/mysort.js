// pages/mysort/mysort.js
/// 创建排顺序
// const CONSTANTS = require('constants');
import { COLLECTION_MYSORT } from "../../constants";
const app = getApp();

Page({
  data: {
    userInfo: {},
    topic: '',
    amount: 2,
    mustSpecifyName: false
  },

  onLoad: function (options) {
    this.setData({ userInfo: app.globalData.userInfo });
  },

  /** 主题变更 */
  topicChanged: function (e) {
    const topic = e.detail.value;
    this.setData({ topic });
  },
  /** 参与人数变更 */
  sliderChanged: function (e) {
    const amount = e.detail.value;
    this.setData({ amount });
  },
  /** 参与人需填写姓名变更 */
  switchChanged: function (e) {
    const mustSpecifyName = e.detail.value;
    this.setData({ mustSpecifyName });
  },
  publishNow: async function () {
    const data = {
      topic: this.data.topic,
      amount: this.data.amount,
      mustSpecifyName: this.data.mustSpecifyName,
      time: new Date()
    };
    // form validation
    if (!(data.topic && data.topic.length)) {
      // topic is mandatory
      wx.showToast({
        icon: 'none',
        title: '主题不能为空！',
      });
      return;
    }
    // check if user profile was granted
    if (!this.data.userInfo) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      const res = await wx.getUserProfile({
        desc: '获取头像昵称用于展示', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      });
      const userInfo = res.userInfo;
      this.setData({ userInfo });
      // update globally
      app.globalData.userInfo = userInfo;
      // persist the data for next usage
      wx.setStorage({ key: SYMBOL_USER_PROFILE, data: JSON.stringify(userInfo) });
    }
    console.log('publish mysort...');
    console.log(data);
    const userInfo = this.data.userInfo;
    const db = wx.cloud.database();
    db.collection(COLLECTION_MYSORT).add({
      data,
      success: res => {
        console.log('发布成功');
        console.log(res);
        wx.showToast({
          icon: 'success',
          title: '发布成功！',
        });
        wx.navigateTo({
          url: '../mysort-result/mysort-result?_id=' + res._id,
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'error',
          title: '发布失败！'
        })
        console.error(err);
      }
    });
  },
  /** 回到主页 */
  goHome: function () {
    const pages = getCurrentPages();
    if (pages.length === 2) {
      wx.navigateBack()
    } else if (pages.length === 1) {
      wx.redirectTo({
        url: '../index/index',
      })
    } else {
      wx.reLaunch({
        url: '../index/index',
      })
    }
  }
});
