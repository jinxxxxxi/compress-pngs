const fs = require('fs')
const ProgressBar = require('progress')
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
    } catch (err) {
      console.error('can not open this file')
      throw new Error(err)
    }
    bar = new ProgressBar('Compressing <:bar> :percent', {
      // 有一个apple隐藏文件
      total: (files.length - 1) * 10
    })
    resolve(files)
  })
}

function writeFile(data, fileName) {
  const path = params.target + '/' + fileName
  fs.writeFileSync(path, data)
}
module.exports = { isPngPic, getFiles, writeFile }
