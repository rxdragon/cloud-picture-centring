const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  filenameHashing: true, // 是否使用md5码
  lintOnSave: true, // eslint 错误处理，true表示对待eslint错误为warnings，warnings不会导致编译失败
  productionSourceMap: false, // 生产环境关闭source map
  integrity: false, // 内容安全策略及子资源完整性
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
        '@SelectBox': resolve('src/components/SelectBox')
      }
    },
    externals: {
      "electron": 'require("electron")'
    }
  },
  css: {
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        'appId': 'com.example.app',
        'productName': '缦图云端', // 项目名，也是生成的安装文件名，即aDemo.exe
        'copyright': 'Copyright © 2019'// 版权信息
      }
    }
  }
}
