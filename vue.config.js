/* eslint-disable no-console */
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
  productionSourceMap: true, // 生产环境是否开启source map
  integrity: false, // 内容安全策略及子资源完整性
  pages: {
    index: 'src/main.js',
    workbench: 'WorkbenchSrc/main.js'
  },
  configureWebpack: (c) => {
    const config = {
      resolve: {
        alias: {
          '@': resolve('src'),
          '@SelectBox': resolve('src/components/SelectBox'),
          '@AssessmentComponents': resolve('src/components/AssessmentComponents'),
          '@electronMain': resolve('src/electronMain')
        }
      },
      externals: {
        'electron': 'require("electron")',
        'fs': 'require("fs")',
        'original-fs': 'require("original-fs")'
      }
    }
    return config
  },
  transpileDependencies: ['single-spa','qiankun','import-html-entry'],
  chainWebpack: config => {
    if (config.plugins.has('progress') && process.env.CI_RUNNER_ID) {
      config.plugins.delete('progress')
    }
  },
  css: {
  },
  pluginOptions: {
    electronBuilder: {
      mainProcessWatch: ['src/background-main.js', 'src/electronMain'], // 检测主进程文件变化时候重新编译
      builderOptions: {
        appId: 'com.example.app',
        productName: '缦图云端',
        copyright: 'Copyright © 2021'
      }
    },
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        resolve('src/styles/variables.less')
      ]
    }
  }
}
