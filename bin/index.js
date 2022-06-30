#!/usr/bin/env node
const tinify = require('tinify')
const commander = require('commander')
const params = require('minimist')(process.argv.slice(2))
const colors = require('colors/safe')
const ora = require('ora')
const ProgressBar = require('progress')
const fs = require('fs')
const path = require('path')
const { isPngPic, getFiles, writeFile } = require('./utils.js')
const config = require('../config.json')
const pkg = require('../package.json')

// tinify 官方 key
tinify.key = config.tinyKey
// 进度条
let bar = null
let barStep = 10
let pngNums = 0
const picSizeComparation = {}
let sourceSrc = '' //源文件地址
let isNeedNewFile = false
const spinner = ora('Loading...').start()

commander.version(pkg.version).description('A pciture compress toll')
commander
  .option('-s, --src', 'source location')
  .option('-l, --local', 'use pwd with location')
  .option('-t, --target', 'target location')

commander.parse(process.argv)

if (params.l || params.s || params.src || params.local) {
  sourceSrc = params?.s || params?.src || process.cwd()
  targetSrc = params?.t || params?.target || `${sourceSrc}/${Date.now()}_pngs`
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
        'before',
        colors.blue(picSizeComparation[key].startSize),
        ' | ',
        'after',
        colors.green(picSizeComparation[key].endSize)
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

    if (Object.keys(picSizeComparation).length === pngNums) {
      spinner.stop()
    }
  })
}

function changeLoading(color, text) {
  spinner.color = color
  spinner.text = text
}

function main(sourcePath) {
  changeLoading('green', 'starting reading pictures')
  getFiles(sourcePath).then((files) => {
    changeLoading('green', 'Comperssing...')
    // 缓存图片数量
    pngNums = files.length
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
