import enquireJs from 'enquire.js'

export function isDef (v){
  return v !== undefined && v !== null
}

/**
 * Remove an item from an array.
 */
export function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

export function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

export function enquireScreen(call) {
  const handler = {
    match: function () {
      call && call(true)
    },
    unmatch: function () {
      call && call(false)
    }
  }
  enquireJs.register('only screen and (max-width: 767.99px)', handler)
}

export function uuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
/**
 * 删除字符串左右两边空白字符
 * @param var x 
 * */ 
export function myTrim(x) {
    let varType = getVarType(x);
    let isCanTrimType = ['string' /*, 'number'*/];
    let isCanTrim = isCanTrimType.indexOf(varType) >= 0;

    return (isCanTrim && x && x.replace(/^\s+|\s+$/gm,''))|| x;
}
/**
 * 获取变量类型
 * @param var param 
 * */ 
export function getVarType(param) {
  return Object.prototype.toString.call(param).toLowerCase().replace(/(\[object )|\]/g, '');
}

/**
 * 获取列名
 * @param number $num
*/
export function getExcelColumn($num) {
    let $letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    if ($num == 0) {
        return $letters[0];
    }
    $num--;//因为下标按1计算的
    let $tmp = '';
    while (true) {
        let $remain = $num % 26;
        $tmp = $letters[$remain] + $tmp;
        $num = parseInt($num / 26);
        if ($num == 0) {
            break;
        }
        $num--;
    }
    return $tmp;
}

/**
 * 获取文件图标
 * @param fileExtension 文件后缀
 * @returns {string} 文件图标
 */
export function getFileIcon(fileExtension){
  const def = "file";
  let returnType = def;
  let defObjList = {
    "file"        :"file",
    "file-excel"  :"file-excel",
    "file-image"  :"file-image",
    "file-pdf"  :"file-pdf",
    "file-ppt"  :"file-ppt",
    "file-word" :"file-word",
    "file-txt" :"file-text",
    "file-zip"  :"file-zip",
  }
  let imageListObj = {'bmp':1,'jpg':1,'png':1,'tif':1,'gif':1,'pcx':1,'tga':1,'exif':1,'fpx':1,'svg':1,'psd':1,'cdr':1,'pcd':1,'dxf':1,'ufo':1,'eps':1,'ai':1,'raw':1,'WMF':1,'webp':1,'avif':1,'apng':1};
  let packageListObj = {'tar':1,'gz':1,'tgz':1,'bz2':1,'zip':1,'rar':1,}
  let wordListObj = {'doc':1, 'docx':1, }
  let excelListObj = {'xls':1, 'xlsx':1, }
  let pptListObj = {'ppt':1, 'pptx':1, }
  let pdfListObj = {'pdf':1}
  let ext = fileExtension && fileExtension.replace('.', '').toLowerCase();
  
  if(ext){
    if(defObjList['file-'+ext]) return defObjList['file-'+ext];

    if(wordListObj[ext]) returnType = 'word';
    else if(excelListObj[ext]) returnType = 'excel';
    else if(pptListObj[ext]) returnType = 'ppt';
    else if(packageListObj[ext]) returnType = 'zip';
    else if(imageListObj[ext]) returnType = 'image';
    else if(pdfListObj[ext]) returnType = 'ppt';
    
    returnType = defObjList['file-'+returnType]? defObjList['file-'+returnType] : returnType;
  }
  return returnType;
}
// 转换字节为可读的格式（例如 KB, MB, GB）:
export function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
// 转换可读的格式为字节（例如 "1.5 MB"）
function sizeToBytes(size) {
  const sizes = ['Bytes', 'KB', 'MB',   'GB', 'TB'];
  const matches = size.match(/^(\d+(\.\d+)?)\s*(KB|MB|GB|TB)?$/);
  if (!matches) {
      throw new Error('Invalid size format');
  }
  const number = parseFloat(matches[1]);
  const unit = matches[2] || 'Bytes';
  const index = sizes.indexOf(unit);
  if (index === -1) {
      throw new Error('Invalid size unit');
  }
  return number * Math.pow(1024, index);
}

// 判断字符串是否为有效的 JSON 格式
export function isValidJSON(str) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
}
const _toString = Object.prototype.toString


// 数组去重
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}
// 获取路径文件名称
export function getFileName(path) {
  if (!path) return ''
  path = path.replace(/\\/g, '/')
  let endIndex = path.lastIndexOf('?')
  endIndex = endIndex > 0 ? endIndex : path.length
  return path.substring(path.lastIndexOf('/') + 1, endIndex)
}
// 获取路径文件名称后缀
export function getFileSuffix(path) {
  if (!path) return ''
  let filename = getFileName(path)
  return filename.substring(filename.lastIndexOf('.') + 1)
}
// 随机密码
export function randomPassword(len = 8) { 
  len = len && (len >= 8 && len <=20) && len || 8;
  let letterArr = "abcdefghijklmnopqrstuvwxyz".split("");
  letterArr = shuffle(letterArr);

  let numberArr = "0123456789".split("");
  numberArr = shuffle(numberArr);

  let specialCharactersArr = "!@#$%^&*()_+-=[]{};:,./<>?".split("");
  specialCharactersArr = shuffle(specialCharactersArr);

  let sliceLen = Math.ceil(len / 3);
  let sliceLenRest = len - sliceLen * 2;

  let passwowrdArr = [
    ...letterArr.slice(0, sliceLen),
    ...numberArr.slice(0, sliceLen),
    ...specialCharactersArr.slice(0, sliceLenRest),
  ];
  passwowrdArr = shuffle(passwowrdArr)
  return passwowrdArr.join("");
}
//  打散数组
export function shuffle(arr){
  return arr.sort(() => Math.random() - 0.5);
}
//  获取星座
export function getConstellation(date) { 
  if (!date) return '';
  let dateArr = date.substring(0, 10).split('-');
  const month = Number(dateArr[1]); // 月份从0开始，需要加1
  const day = Number(dateArr[2]);
  
  const constellationRanges = [
    { name: '摩羯座', start: [12, 22], end: [1, 19] },
    { name: '水瓶座', start: [1, 20], end: [2, 18] },
    { name: '双鱼座', start: [2, 19], end: [3, 20] },
    { name: '白羊座', start: [3, 21], end: [4, 19] },
    { name: '金牛座', start: [4, 20], end: [5, 20] },
    { name: '双子座', start: [5, 21], end: [6, 21] },
    { name: '巨蟹座', start: [6, 22], end: [7, 22] },
    { name: '狮子座', start: [7, 23], end: [8, 22] },
    { name: '处女座', start: [8, 23], end: [9, 22] },
    { name: '天秤座', start: [9, 23], end: [10, 23] },
    { name: '天蝎座', start: [10, 24], end: [11, 22] },
    { name: '射手座', start: [11, 23], end: [12, 21] }
  ];
  
  for (let i = 0; i < constellationRanges.length; i++) {
    const range = constellationRanges[i];
    const [startMonth, startDay] = range.start;
    const [endMonth, endDay] = range.end;
    
    if ((month === startMonth && day >= startDay) ||  (month === endMonth && day <= endDay)) {
      return range.name;
    }
  }
  
  return '摩羯座';
}