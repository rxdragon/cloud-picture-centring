import md5 from 'js-md5'
const fileType = require('file-type')

const chunkSize = 4 * 1024 * 1024

export default class YunMd5 {
    currentLength = 0
    chunkTime = 0
    hash = md5.create()
    fileInfo = ''

    async updateBlob (blob) {
      let i = 0
      while (i < blob.size) {
        const size = Math.min(chunkSize, blob.size - i, chunkSize - this.currentLength)
        const to = i + size
        const chunkData = await this.readBlobToArrayBuffer(blob.slice(i, to))
        this.hash.update(chunkData)
        if (this.chunkTime === 0) {
          this.fileInfo = fileType(chunkData)
        }
        this.currentLength += size
        // 切换到下一个分块
        if (this.currentLength === chunkSize) {
          this.changeCurrent()
        }
        i = to
      }
    }

    changeCurrent () {
      if (this.currentLength > 0) {
        this.chunkTime++
        this.currentLength = 0
      }
    }

    get md5Info () {
      return this.hash.hex()
    }

    get typeInfo () {
      return this.fileInfo
    }

    get fileInfo () {
      return {
        md5: this.md5Info,
        typeInfo: this.typeInfo
      }
    }
}
