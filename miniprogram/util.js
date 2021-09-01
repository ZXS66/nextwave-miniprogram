/** check if given data is not empty array */
export const isNotEmptyArray = (data) => {
  return Array.isArray(data) && data.length;
};

/** check if given data is not empty string */
export const isNotEmptyString = (data) => {
  return typeof (data) === 'string' && data.length;
};

/** get date string */
export const dateFormat = (dt) => {
  if (isNotEmptyString(dt)) {
    dt = new Date(dt);
  }
  if (dt instanceof Date) {
    function fx(num) {
      return num < 10 ? '0' + num : num;
    }
    return `${dt.getFullYear()}-${fx(dt.getMonth() + 1)}-${fx(dt.getDate())} ${fx(dt.getHours())}:${fx(dt.getMinutes())}`;  //:${fx(dt.getSeconds())}
  }
  return '';
};
/** parse string value as boolean */
export const parseBoolean = (value) => {
  if (typeof (value) === 'number')
    return value > 0;
  if (isNotEmptyString(value)) {
    const parsedNum = Number.parseFloat(value);
    if (!isNaN(parsedNum)) {
      return parsedNum > 0;
    }
    const value_lowercase = value.trim().toLowerCase();
    const truthy = ['true', '1', 't', 'yes', 'y'];
    return truthy.includes(value_lowercase);
  }
  return false;
};