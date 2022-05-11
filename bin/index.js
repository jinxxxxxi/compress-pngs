#!/usr/bin/env node
const tinify = require('tinify')
const params = require('minimist')(process.argv.slice(2))
const ProgressBar = require('progress')
const fs = require('fs')
const path = require('path')
const { isPngPic, getFiles, writeFile } = require('./utils.js')
const config = require('../config.json')
// tinify 官方 key
tinify.key = config.tinyKey
// 进度条
let bar = null
let barStep = 10
const picSizeComparation = {}
let sourceSrc = '' //源文件地址
let isNeedNewFile = false

// 没传参数抛出错误;
if (!params.local && !params.src) {
  throw new Error('Expected src or local')
}
if (params.local || params.src) {
  sourceSrc = params.src || process.cwd()
  targetSrc = params.target || `${sourceSrc}/${Date.now()}_pngs`
  isNeedNewFile = !!targetSrc
}

async function getCompressedPicSize(fileName) {
  const path = targetSrc + '/' + fileName
  const picStats = fs.statSync(path)
  picSizeComparation[fileName] = {
    ...picSizeComparation[fileName],
    endSize: Math.floor(picStats.size / 1024) + 'kb'
  } //压缩后大小
  await bar.tick(barStep)
  if (bar.complete) {
    for (let key in picSizeComparation) {
      console.info(
        key,
        '\t=>',
        '|before'.blue,
        picSizeComparation[key].startSize,
        '|after'.blue,
        picSizeComparation[key].endSize
      )
    }
  }
}

async function compressPic(fileStats, fileName, picture) {
  // 压缩前大小
  picSizeComparation[fileName] = {
    startSize: Math.floor(fileStats.size / 1024) + 'kb'
  }
  // 压缩
  await tinify.fromBuffer(picture).toBuffer(function (err, resultData) {
    if (err) throw err
    writeFile(targetSrc, resultData, fileName)
    getCompressedPicSize(fileName)
  })
}

function main(sourcePath) {
  getFiles(sourcePath).then((files) => {
    // 进度条初始化
    bar = new ProgressBar('Compressing <:bar> :percent', {
      // 有一个apple隐藏文件
      total: files.length * barStep
    })

    if (isNeedNewFile && !fs.existsSync(targetSrc)) {
      fs.mkdirSync(targetSrc)
    }

    files.forEach((fileName) => {
      // 获取当前文件的绝对路径
      let filedir = path.join(sourcePath, fileName)
      // 当前文件状态
      const fileStats = fs.statSync(filedir)
      if (isPngPic(fileStats, fileName)) {
        const picture = fs.readFileSync(filedir)
        compressPic(fileStats, fileName, picture)
      }
    })
  })
}

main(sourceSrc)
