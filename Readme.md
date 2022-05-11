# 说明

命令行工具，用于将指定文件 A 下的 png 图压缩到指定文件 B

# 下载

npm install compress-pngs -g

# 命令行使用

1.  compress-png --src[源地址] --target[目标地址]
2.  增加 --local 参数，表示从当前目录下获取[源地址]，会优先获取[src]参数； [local]和[src]必须得有一个

# 注意

- 目前只支持一级目录下的 png 文件， 不支持递归
- github 地址： https://github.com/Zakisee/compress-pngs
