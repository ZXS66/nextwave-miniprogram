/// handy utility functions

/// remember always update the shadow copies (under cloudfunctions folder) to the latest version
/// (same module restriction for cloud function)

/** get date string */
export const dateFormat = (dt) => {
  if (dt instanceof Date) {
    function fx(num) {
      return num < 10 ? '0' + num : num;
    }
    return `${dt.getFullYear()}-${fx(dt.getMonth() + 1)}-${fx(dt.getDate())} ${fx(dt.getHours())}:${fx(dt.getMinutes())}`;  //:${fx(dt.getSeconds())}
  }
  return '';
};

/** check if given data is not empty array */
export const isNotEmptyArray = (data) => {
  return Array.isArray(data) && data.length;
};

/** check if given data is not empty string */
export const isNotEmptyString = (data) => {
  return typeof (data) === 'string' && data.length;
};