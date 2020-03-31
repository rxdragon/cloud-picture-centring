import hash from 'js-sha1'
const fileType = require('file-type')

const chunkSize = 4 * 1024 * 1024
const shA1 = hash.digest

export default class QiNiuETag {
    currentLength = 0
    chunkTime = 0
    sha1String = []
    type = ''

    async updateBlob (blob) {
      let i = 0
      while (i < blob.size) {
        const size = Math.min(chunkSize, blob.size - i, chunkSize - this.currentLength)
        const to = i + size
        const chunkData = await this.readBlobToArrayBuffer(blob.slice(i, to))
        const chunkSha1 = shA1(chunkData)
        this.sha1String.push(chunkSha1)
        if (this.chunkTime === 0) {
          this.type = fileType(chunkData)
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

    concatArr2Uint8 (s) {
      var tmp = []
      for (var i of s) tmp = tmp.concat(i)
      return new Uint8Array(tmp)
    }

    readBlobToArrayBuffer (blob) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = () => resolve(fileReader.result)
        fileReader.onerror = reject

        fileReader.readAsArrayBuffer(blob)
      })
    }

    get sha1Buffer () {
      let returnData = this.concatArr2Uint8(this.sha1String)
      let prefix
      if (this.chunkTime >= 1) {
        prefix = [0x96]
        returnData = shA1(returnData.buffer)
      } else {
        prefix = [0x16]
        returnData = Array.apply([], returnData)
      }
      returnData = this.concatArr2Uint8([[prefix], returnData])
      return returnData
    }

    get getEtag () {
      const CHUNK_SIZE = 0x8000 // arbitrary number
      const length = this.sha1Buffer.length
      let index = 0
      let result = ''
      let slice
      while (index < length) {
        slice = this.sha1Buffer.subarray(index, Math.min(index + CHUNK_SIZE, length))
        result += String.fromCharCode.apply(null, slice)
        index += CHUNK_SIZE
      }
      return btoa(result).replace(/\//g, '_').replace(/\+/g, '-')
    }

    get typeInfo () {
      return this.type
    }

    get fileInfo () {
      return {
        sha1: this.getEtag,
        typeInfo: this.typeInfo
      }
    }
}
