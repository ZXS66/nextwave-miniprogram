// miniprogram/pages/mysort-result/mysort-result.js
import { COLLECTION_MYSORT, COLLECTION_MYSORT_RESULT, SYMBOL_USER_PROFILE } from "../../constants";
import { dateFormat, isNotEmptyArray, isNotEmptyString } from "../../util";

const app = getApp();
Page({
  /**
   * Page initial data
   */
  data: {
    /** mysort id */
    id: '', // mysort id
    /** whether show the dialog or not */
    showDialog404: false,
    dialog404Buttons: [{ text: '确定' }],
    /** details of the mysort */
    mysort: null,
    /** details of mysort_result */
    mysortResult: [],
    /** can user join the mysort */
    canJoin: false,
    /** user-specify name */
    name: ''
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    if (options && options._id && options._id.length) {
      this.setData({ id: options._id });
    } else {
      wx.showToast({
        icon: 'none',
        title: '_id is mandatory!',
      });
      this.tapDialog404Button();
    }
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
    this.refresh();
  },
  /** refresh all the data */
  refresh: function () {
    const db = wx.cloud.database();
    // get details of mysort by id
    db.collection(COLLECTION_MYSORT).doc(this.data.id).get().then(response => {
      const mysort = response.data;
      if (mysort && mysort.topic) {
        mysort._time = dateFormat(mysort.time);
        this.setData({ mysort });
        console.log(COLLECTION_MYSORT_RESULT + ':');
        console.log(mysort);
      }
    }, function (err) {
      console.log('getting mysort_result by id with error');
      console.error(err);
      wx.showToast({
        icon: 'none',
        title: '出错了！'
      });
    });
    // get details of mysort_result by id of mysort
    db.collection(COLLECTION_MYSORT_RESULT).where({
      mysortId: this.data.id
    }).get().then(response => {
      const mysortResult = response.data || [];
      if (isNotEmptyArray(mysortResult)) {
        mysortResult.forEach(_ => _._time = dateFormat(_.time));
        this.setData({ mysortResult });
      }
      // check if current user has joined the mysort before or not
      const openid = app.globalData.openid;
      const canJoin = !(mysortResult.some(_ => _._openid === openid));
      this.setData({ canJoin });
    }, err => {
      console.log('getting mysort_result by id with error');
    });
  },
  nameChanged: function (e) {
    const name = e.detail.value;
    this.setData({ name });
  },
  /** callback for dialog 404 confirm button */
  tapDialog404Button: () => {
    wx.navigateBack();
  },
  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    // update the latest mysort-result
    this.refresh();
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {
    if (this.data.mysort) {
      return {
        title: '排顺序：' + this.data.mysort.topic,
        // imageUrl: ''
      };
    }
  },
  /** 参与 */
  join: async function () {
    const name = this.data.name;
    const mustSpecifyName = this.data.mysort.mustSpecifyName;
    if (mustSpecifyName && !isNotEmptyString(name)) {
      wx.showToast({
        icon: 'error',
        title: '必须指定姓名',
      });
      return;
    }
    // 获取用户头像昵称
    let userInfo = app.globalData.userInfo;
    if (!userInfo) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      const res = await wx.getUserProfile({
        desc: '获取头像昵称用于展示', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      });
      userInfo = res.userInfo;
      // update globally
      app.globalData.userInfo = userInfo;
      app.globalData.openid = userInfo.openid;
      // persist the data for next usage
      wx.setStorage({ key: SYMBOL_USER_PROFILE, data: JSON.stringify(userInfo) });
      wx.setStorage({ key: 'openid', data: userInfo.openid });
    }
    // 调用云函数参与排序
    const formData = {
      mysortId: this.data.id,
      avatarUrl: userInfo.avatarUrl,
      nickName: mustSpecifyName ? name : userInfo.nickName
    };
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'mysort',
      data: formData
    }).then(resp => {
      wx.hideLoading();
      wx.showToast({
        icon: 'success',
        title: '参与成功！'
      });
      this.onPullDownRefresh();
    }, err => {
      wx.hideLoading();
      wx.showToast({
        icon: 'error',
        title: '参与失败！'
      });
      console.error(err);
    });
  }
});
