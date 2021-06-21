#!/usr/bin/env node
const tinify = require("tinify");
const params = require("minimist")(process.argv.slice(2));
const ProgressBar = require("progress");
const fs = require("fs");
const path = require("path");

// tinify 官方 key
tinify.key = "9gfxRWlW6Kbym9jlrPNmSHcKwLCr5wCP";
// 待匹配的文件格式
const type = ".png";

const bar = new ProgressBar("Compressing <:bar> :percent", { total: 10 });

const fileStats = {};
// 没传参数抛出错误
if (!params.src) {
  throw new Error("Expected src");
} else if (!params.target) {
  throw new Error("Expected target");
}

async function fileWalker(filePath) {
  // 根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, async function (err, files) {
    if (err) throw err;

    // 遍历读取到的文件列表
    await files.forEach(async (filename) => {
      // 获取当前文件的绝对路径
      let filedir = path.join(filePath, filename);
      // 根据文件路径获取文件信息，返回一个fs.Stats对象
      await fs.stat(filedir, async function (eror, stats) {
        const isFile = stats.isFile(); // 是文件
        const isDir = stats.isDirectory(); // 是文件夹
        const isPng = new RegExp(type).test(filename);
        if (isFile && isPng) {
          fileStats[filename] = {
            startSize: Math.floor(stats.size / 1024) + "kb", //压缩前大小
          };
          fs.readFile(filedir, function (err, sourceData) {
            if (err) throw err;
            tinify
              .fromBuffer(sourceData)
              .toBuffer(async function (err, resultData) {
                if (err) throw err;
                const newPath = params.target + "/" + filename;
                await fs.writeFile(newPath, resultData, async (err) => {
                  if (err) throw err;
                  await fs.stat(newPath, async function (eror, stats) {
                    if (err) throw err;
                    fileStats[filename] = {
                      ...fileStats[filename],
                      endSize: Math.floor(stats.size / 1024) + "kb",
                    }; //压缩前大小
                  });
                  bar.tick();
                });
                if (bar.complete) {
                  console.log("compress successfully");
                  await findEndPicSize(params.target);
                  for (let key in fileStats) {
                    console.info(
                      key,
                      "\t=>",
                      "|before",
                      fileStats[key].startSize,
                      "|after",
                      fileStats[key].endSize
                    );
                  }
                }
              });
          });
        }
        if (isDir) {
          fileWalker(filedir); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
        }
      });
    });
  });
}
async function findEndPicSize(filePath) {
  await fs.readdir(filePath, function (err, files) {
    if (err) throw err;
    files.forEach(async (filename) => {
      let filedir = path.join(filePath, filename);
      await fs.stat(filedir, async function (eror, stats) {
        if (err) throw err;
        fileStats[filename] = {
          ...fileStats[filename],
          endSize: Math.floor(stats.size / 1024) + "kb",
        }; //压缩前大小
      });
    });
  });
}
fileWalker(params.src);
