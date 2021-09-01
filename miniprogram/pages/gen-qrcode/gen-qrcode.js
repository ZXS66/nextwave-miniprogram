import { isNotEmptyString } from '../../util';
import { qrcode, svg2url } from "pure-svg-code";

Page({
    /** Page initial data */
    data: {
        /** text content to be generated QR code */
        content: '',
        /** src data to be rendered in the image component */
        result: ''
    },

    /** Lifecycle function--Called when page load */
    onLoad: function (options) {
    },

    /** Lifecycle function--Called when page is initially rendered */
    onReady: function () {

    },

    /** Lifecycle function--Called when page show */
    onShow: function () {
        // TODO: get content from clipboard 
        // and generate QR code automatically if it is not empty
    },

    /** Lifecycle function--Called when page hide */
    onHide: function () {

    },

    /** Lifecycle function--Called when page unload */
    onUnload: function () {

    },

    /** Page event handler function--Called when user drop down */
    onPullDownRefresh: function () {

    },

    /** Called when page reach bottom */
    onReachBottom: function () {

    },

    /** Called when user click on the top right corner to share */
    onShareAppMessage: function () {
        return {
            title: '生成二维码小工具'
        };
    },
    /** 待生成二维码文本内容更改 */
    contentChanged: function (e) {
        const newContent = e.detail.value;
        if (newContent !== this.data.content) {
            this.setData({ content: newContent });
            this.genQRCode(newContent);
        }
    },
    /** implementation of generating QR code */
    genQRCode: function (content) {
        if (isNotEmptyString(content)) {
            const svgString = qrcode(content);
            const result = svg2url(svgString);
            this.setData({ result });
        }
    }
});
