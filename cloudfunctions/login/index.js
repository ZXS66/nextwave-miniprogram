// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const admins = [
  'oEIq04oxA4iQg1LsHAPdcfVAcxo0', // ZXS-WeChat // super admin
  'oEIq04r1HHpFHuUG1hwvGwt7rA9M', // jx-9jiang  // ZXS
  'oEIq04kJhSBUfobWgp6wjqFgYYUA',  // songchuangxia  // 徐奕蓓
  'oEIq04vWGW4JcYHVPdYUm5pxGi4k', // 刘贝贝
];

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext();

  const openid = wxContext.OPENID;
  return {
    event,
    openid,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    env: wxContext.ENV,
    isAdmin: admins.some(_ => _ === openid)
  }
}

