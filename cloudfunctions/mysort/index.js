// 云函数入口文件
const cloud = require('wx-server-sdk');
// import { COLLECTION_MYSORT, COLLECTION_MYSORT_RESULT } from "./constants";
// import { isNotEmptyString } from "./util";

/** collection name of mysort */
const COLLECTION_MYSORT = 'mysort';
/** collection name of mysort_result */
const COLLECTION_MYSORT_RESULT = 'mysort_result'
/** storage key for saving user profile */
const SYMBOL_USER_PROFILE = 'userInfo';

/** check if given data is not empty string */
const isNotEmptyString = (data) => {
  return typeof (data) === 'string' && data.length;
};

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { avatarUrl, nickName, mysortId } = event;
  const db = cloud.database();
  if (isNotEmptyString(mysortId)) {
    // 参与排序
    const query_mysort = await db.collection(COLLECTION_MYSORT).doc(mysortId).get();
    if (!(query_mysort && query_mysort.data && query_mysort.data.amount)) {
      // mysort 找不到，或者 amount 值不对
      throw `invalid lottery id`;
    }
    const maxValue = query_mysort.data.amount;
    let presentedValue = [];
    const query_mysortResult = await db.collection(COLLECTION_MYSORT_RESULT).where({ mysortId }).get();
    if (query_mysortResult && query_mysortResult.data && query_mysortResult.data.length) {
      presentedValue = query_mysortResult.data.map(_ => _.result);
    }
    if (presentedValue.length === maxValue) {
      /// 排序已完成！
      throw 'the lottery is over';
    }
    if (query_mysortResult.data.some(d => d._openid === openid)) {
      /// 不可重复参与！
      throw 'can\'t join the lottery twice times';
    }
    let randomValue;
    do {
      randomValue = Math.ceil(Math.random() * maxValue);
    } while (presentedValue.includes(randomValue));
    const record = { _openid: openid, avatarUrl, nickName, mysortId, result: randomValue, time: new Date() };
    const record_added = await db.collection(COLLECTION_MYSORT_RESULT).add({ data: record });
    return record_added;
  } else {
    // 获取“我创建的”和“我参与的”
    const resp_create = await db.collection(COLLECTION_MYSORT).where({ _openid: openid }).get();
    const mysort_create = resp_create.data;
    const resp_join = db.collection(COLLECTION_MYSORT_RESULT).
      aggregate().
      match({ _openid: openid }).
      lookup({
        from: COLLECTION_MYSORT,
        localField: 'mysortId',
        foreignField: '_id',
        as: COLLECTION_MYSORT
      }).end();
    const mysort_join = resp_join.data || [];
    return {
      openid,
      join: mysort_join,
      create: mysort_create
    };
  }
}