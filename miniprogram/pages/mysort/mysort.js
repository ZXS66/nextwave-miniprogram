// pages/mysort/mysort.js
/// 创建排顺序
// const CONSTANTS = require('constants');
import { COLLECTION_MYSORT, COLLECTION_MYSORT_RESULT } from "../../constants";
import { parseBoolean } from "../../util";
const app = getApp();

Page({
	data: {
		/** current user profile information */
		userInfo: {},
		/** the topic name */
		topic: '',
		/** how many participants */
		amount: 2,
		/** should the participant specify his/her name */
		mustSpecifyName: false,
		/** if current user is administrator or not */
		isAdmin: false,
		/** available spots to be reserved */
		availableSpots: ['第 1 位', '第 2 位'],
		/** my reserved spot */
		mySpot: -1
	},

	onLoad: function (options) {
		this.setData({
			userInfo: app.globalData.userInfo,
			isAdmin: parseBoolean(options.isAdmin)
		});
	},

	/** topic name was changed */
	topicChanged: function (e) {
		const topic = e.detail.value;
		this.setData({ topic });
	},
	/** participants was changed */
	amountChanged: function (e) {
		const amount = e.detail.value;
		const availableSpots = Array.from({ length: amount }, (k, v) => `第 ${v + 1} 位`);
		this.setData({ amount, availableSpots });
	},
	mySpotChanged: function (e) {
		const mySpot = parseInt(e.detail.value);
		this.setData({ mySpot });
	},
	/** 参与人需填写姓名变更 */
	mustSpecifyNameChanged: function (e) {
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
		let userInfo = this.data.userInfo;
		if (!userInfo) {
			// 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
			const res = await wx.getUserProfile({
				desc: '获取头像昵称用于展示', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
			});
			userInfo = res.userInfo;
			this.setData({ userInfo });
			// update globally
			app.globalData.userInfo = userInfo;
			// persist the data for next usage
			wx.setStorage({ key: SYMBOL_USER_PROFILE, data: JSON.stringify(userInfo) });
		}
		console.log('start publishing mysort...');
		console.log(data);
		wx.showLoading({
			title: '发布中，请稍候…',
		});
		const db = wx.cloud.database();
		const res = await db.collection(COLLECTION_MYSORT).add({
			data
		}).catch(err => {
			wx.hideLoading();
			wx.showToast({ icon: 'error', title: '发布失败！' });
			console.error(err);
		});
		console.log('发布成功');
		console.log(res);
		if (this.data.isAdmin && this.data.mySpot !== -1) {
			const reservedSpot = this.data.mySpot + 1;
			const reservation = {
				mysortId: res._id,
				avatarUrl: userInfo.avatarUrl,
				nickName: userInfo.nickName,
				result: reservedSpot,
				time: new Date()
			};
			await db.collection(COLLECTION_MYSORT_RESULT).add({ data: reservation }).catch(err => {
				console.error('error occurred during update reservation.'); console.error(err);
			});
			console.log('publishing with reservation success!');
		}
		wx.hideLoading();
		wx.showToast({ icon: 'success', title: '发布成功！', });
		wx.navigateTo({
			url: '../mysort-result/mysort-result?_id=' + res._id,
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
