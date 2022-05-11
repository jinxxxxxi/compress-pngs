const fs = require('fs')
const config = require('../config.json')
const params = require('minimist')(process.argv.slice(2))

// 待匹配的文件格式
const type = config.type
function isPngPic(fileStats, fileName) {
  const isFile = fileStats.isFile() // 是文件
  const isPng = new RegExp(type).test(fileName)
  return isFile && isPng
}

function getFiles(filePath) {
  return new Promise((resolve, reject) => {
    let files
    try {
      files = fs.readdirSync(filePath)
      files = files.filter((item) => {
        const arr = item.split('.')
        return arr.length === 2 && arr[0]
      })
    } catch (err) {
      console.error('can not open this file')
      throw new Error(err)
    }
    resolve(files)
  })
}

function writeFile(target, data, fileName) {
  const path = target + '/' + fileName
  fs.writeFileSync(path, data)
}
module.exports = { isPngPic, getFiles, writeFile }
