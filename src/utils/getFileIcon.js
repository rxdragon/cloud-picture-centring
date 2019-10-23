console.log(global, 'global')
console.log(global.electron, 'electron')
// const { app } = global.electron.remote 
console.log(electron)

// 封装一个函数
// export function getFileIcon (path) {
//   return new Promise((resolve) => {
//     const defaultIcon = 'some-default.jpg'
//     if (!path) return resolve(defaultIcon)
//     return app.getFileIcon(path, (err, nativeImage) => {
//       if (err) {
//         return resolve(defaultIcon)
//       }
//       return resolve(nativeImage.toDataURL()) // 使用base64展示图标
//     })
//   })
// }
