import fs from "fs";
import path from "path";
import xlsx from "yh-node-xlsx";

const LOG_TYPE = {
  WARNING: 1,
  ERROR: 2,
  LOG: 3,
  DONE: 4
};

function formatKey(key) {
  let arr = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z"
    ],
    code = "{0}#{1}{2}{3}#",
    l = arr.length;

  key = decodeKey(key);
  return (
    code
      .replace(/\{0\}/g, arr[Math.floor(Math.random() * l)])
      .replace(/\{1\}/g, arr[Math.floor(Math.random() * l)])
      .replace(/\{2\}/g, arr[Math.floor(Math.random() * l)])
      .replace(/\{3\}/g, arr[Math.floor(Math.random() * l)]) + key
  );
}

function decodeKey(key) {
  if (!key) {
    return "";
  }

  return key.replace(/^[a-zA-Z]\#[a-zA-Z][a-zA-Z][a-zA-Z]\#/g, "");
}

function getDirname(filePath) {
  if (path.extname(filePath) !== "") {
    return path.dirname(filePath);
  }
  return filePath;
}

function loadFile(src) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });
}

function loadJson(src) {
  return loadFile(src)
    .then(data => {
      return JSON.parse(data);
    })
    .catch(err => {
      log(err.error, LOG_TYPE.error);
      return {};
    });
}

function loadJsonSync(src) {
  try {
    return JSON.parse(fs.readFileSync(src));
  } catch (e) {
    return {};
  }
}

function writeJson(data, outPath) {
  createFolder(path.dirname(outPath));
  return new Promise((resolve, reject) => {
    fs.writeFile(outPath, JSON.stringify(data, "", 2), err => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

var styles = {
  bold: ["\x1B[1m", "\x1B[22m"],
  italic: ["\x1B[3m", "\x1B[23m"],
  underline: ["\x1B[4m", "\x1B[24m"],
  inverse: ["\x1B[7m", "\x1B[27m"],
  strikethrough: ["\x1B[9m", "\x1B[29m"],
  white: ["\x1B[37m", "\x1B[39m"],
  grey: ["\x1B[90m", "\x1B[39m"],
  black: ["\x1B[30m", "\x1B[39m"],
  blue: ["\x1B[34m", "\x1B[39m"],
  cyan: ["\x1B[36m", "\x1B[39m"],
  green: ["\x1B[32m", "\x1B[39m"],
  magenta: ["\x1B[35m", "\x1B[39m"],
  red: ["\x1B[31m", "\x1B[39m"],
  yellow: ["\x1B[33m", "\x1B[39m"],
  whiteBG: ["\x1B[47m", "\x1B[49m"],
  greyBG: ["\x1B[49;5;8m", "\x1B[49m"],
  blackBG: ["\x1B[40m", "\x1B[49m"],
  blueBG: ["\x1B[44m", "\x1B[49m"],
  cyanBG: ["\x1B[46m", "\x1B[49m"],
  greenBG: ["\x1B[42m", "\x1B[49m"],
  magentaBG: ["\x1B[45m", "\x1B[49m"],
  redBG: ["\x1B[41m", "\x1B[49m"],
  yellowBG: ["\x1B[43m", "\x1B[49m"]
};

function log(message, type = LOG_TYPE.LOG) {
  let logText = ["", "Warning", "Error", "Log", "Success"];
  message = `[${logText[type]}][${message}]`;

  switch (type) {
    case LOG_TYPE.WARNING:
      console.log(styles["yellow"][0] + "%s" + styles["yellow"][1], message);
      break;
    case LOG_TYPE.ERROR:
      console.log(styles["red"][0] + "%s" + styles["red"][1], message);
      break;
    default:
      console.log(message);
  }
}

function loadExcel(xlsxPath, sheetName) {
  let data = xlsx.parse(xlsxPath);
  let outData = [];
  data.forEach(item => {
    if (sheetName) {
      if (item.name === sheetName) {
        outData = item.data;
        return false;
      }
      outData = [];
    } else {
      outData = item.data;
      return false;
    }
  });
  outData = outData.filter(item => item.length > 0);
  return outData;
}

function writeExcel(data, outPath, sheetName) {
  createFolder(path.dirname(outPath));
  if (data && data.length > 0 && typeof data[0] !== "object") {
    data = data.map(item => [item]);
  }

  let buffer = xlsx.build([
    {
      name: sheetName || "语言包",
      data: data
    }
  ]);

  return new Promise((resolve, reject) => {
    fs.writeFile(outPath, buffer, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function writeTextFile(filename, content) {
  createFolder(path.dirname(filename));
  fs.writeFileSync(filename, content);
}

function createFolder(folder) {
  folder = path.resolve(folder);
  var originDir = folder;
  try {
    if (fs.existsSync(folder)) return;

    while (!fs.existsSync(folder + "/..")) {
      folder += "/..";
    }

    while (originDir.length <= folder.length) {
      fs.mkdirSync(folder, "0777");
      folder = folder.substring(0, folder.length - 3);
    }
  } catch (e) {
    console.log(e);
  }
}

function deepMerge(oldObj, newObj) {
  for (let key in newObj) {
    if (newObj.hasOwnProperty(key)) {
      let oldT = oldObj[key],
        newT = newObj[key];

      if (oldT) {
        if (Object.prototype.toString.call(newT) === "[object Object]") {
          deepMerge(oldT, newT);
        } else {
          oldObj[key] = newT;
        }
      } else {
        oldObj[key] = newT;
      }
    }
  }
}

function mergeObject(main, other) {
  if (Object.prototype.toString.call(main) === "[object Array]") {
    return [...new Set(main.concat(other))];
  }

  for (let key in other) {
    let data = other[key];
    if (
      main[key] !== undefined &&
      typeof main[key] === "object" &&
      typeof data === "object"
    ) {
      main[key] = mergeObject(main[key], data);
    } else {
      main[key] = data;
    }
  }

  return main;
}

function partMerge(obj, main) {
  let outData = {};
  if (getType(main) === "Array") {
    main.map(item => {
      outData[item] = obj[item] || "";
    });
  } else {
    for (let key in main) {
      outData[key] = obj[key] || main[key];
    }
  }
  return outData;
}

function scanFolder(folder) {
  var fileList = [],
    folderList = [],
    itemList = [],
    walk = function(folder, fileList, folderList) {
      var files = fs.readdirSync(folder);
      files.forEach(function(item) {
        var tmpPath = folder + "/" + item,
          stats = fs.statSync(tmpPath);

        if (stats.isDirectory()) {
          walk(tmpPath, fileList, folderList);
          folderList.push(path.resolve(tmpPath));
          itemList.push(item);
        } else {
          fileList.push(path.resolve(tmpPath));
        }
      });
    };

  walk(folder, fileList, folderList);

  return {
    files: fileList,
    folders: folderList,
    items: itemList
  };
}

function createFolder(folder, callback) {
  var originDir = folder;
  try {
    if (fs.existsSync(folder)) return;

    let list = [folder];
    folder = path.dirname(folder);
    while (!fs.existsSync(folder)) {
      list.push(folder);
      folder = path.dirname(folder);
    }

    while (list.length > 0) {
      fs.mkdirSync(list.pop());
    }

    if (callback) callback();
  } catch (e) {
    console.log(e);
  }
}

function copyFile(src, dist) {
  createFolder(path.dirname(dist));
  fs.createReadStream(src).pipe(fs.createWriteStream(dist));
}

function correctPath(filePath) {
  filePath += "";

  if (!path.isAbsolute(filePath)) {
    filePath = path.join(process.cwd(), filePath);
    console.log(filePath);
  }
  return filePath.replace(/\\/g, "/");
}

function trim(text) {
  return text.replace(/(^\s+)|(\s+$)/g, "");
}

function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

function string2Regexp(str) {
  if (getType(str) === "RegExp") {
    return str;
  }

  if (/^\//.test(str)) {
    let index = str.lastIndexOf("/");
    if (index === 0) {
      return new RegExp(str);
    }

    let t = str.substring(1, index),
      k = str.substring(index + 1);
    return new RegExp(t, k);
  }

  return new RegExp(str);
}

function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj instanceof RegExp) {
    return new RegExp(RegExp);
  }

  let newObj = new obj.constructor();
  for (let key in obj) {
    newObj[key] = deepClone(obj[key]);
  }
  return newObj;
}

function getNowFormatDate() {
  var date = new Date(),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    strDate = date.getDate(),
    hour = date.getHours(),
    min = date.getMinutes(),
    second = date.getSeconds();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + month + strDate + hour + min + second;
  return currentdate;
}
export {
  formatKey,
  decodeKey,
  deepMerge,
  loadJsonSync,
  loadFile,
  loadJson,
  loadExcel,
  scanFolder,
  createFolder,
  copyFile,
  writeTextFile,
  string2Regexp,
  writeExcel,
  correctPath,
  writeJson,
  mergeObject,
  partMerge,
  getDirname,
  LOG_TYPE,
  deepClone,
  getType,
  trim,
  log,
  getNowFormatDate
};
