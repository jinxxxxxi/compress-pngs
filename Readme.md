# 说明

命令行工具，用于将指定目录**Dir1**下的 png 图片 压缩到指定目录**Dir2**

# 下载

npm install compress-pngs -g

# 命令行使用

1.  compress-png --src[源地址] --target[目标地址] （**都必须是绝对地址**）
2.  增加 --local 参数，表示从当前目录下获取[源地址]，会优先获取[src]参数； [local]和[src]必须得有一个
3.  target 参数可选，若不传则会在当前文件下面创建一个[timestamp]\_png 目录

# 注意

- 目前只支持一级目录下的 png 文件， 不支持递归
- github 地址： https://github.com/Zakisee/compress-pngs
