const path = require('path')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const ProgressPlugin = require('webpack').ProgressPlugin

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  filenameHashing: true, // 是否使用md5码
  lintOnSave: true, // eslint 错误处理，true表示对待eslint错误为warnings，warnings不会导致编译失败
  productionSourceMap: true, // 生产环境是否开启source map
  integrity: false, // 内容安全策略及子资源完整性
  devServer: {
    disableHostCheck: true,
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: {
      '/': {
        target: 'http://localhost:3000',
        ws: false,
        changOrigin: true
      }
    }
  },
  configureWebpack: (c) => {
    const config = {
      resolve: {
        alias: {
          '@': resolve('src'),
          '@SelectBox': resolve('src/components/SelectBox'),
          '@electronMain': resolve('src/electronMain')
        }
      },
      externals: {
        'electron': 'require("electron")',
        'fs': 'require("fs")',
        'original-fs': 'require("original-fs")'
      },
      plugins: [
        new StyleLintPlugin({
          configFile: '.stylelintrc',
          files: ['./src/assets/**/*.less', './src/**/*.vue']
        })
      ]
    }
    if (process.env.CI_COMMIT_SHA) {
      c.plugins = c.plugins.filter(pluginItem => !(pluginItem instanceof ProgressPlugin))
    }
    return config
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
