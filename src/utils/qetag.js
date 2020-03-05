import sha1 from 'js-sha1'
const fileType = require('file-type')

class Etag {
	chunkSize = 4 * 1024 * 1024
	offset = 0
	reader = new FileReader()

	constructor (file) {
	  this.fileInfo = null
	  this.shA1 = sha1.digest
	  this.sha1String = []
	  this.file = file
	  this.blockCount = 0
	}

	/**
	 * @description Array 2 Uint8Array
	 * @param {*} s
	 */
	concatArr2Uint8 (s) {
	  console.log(s, 's')
	  var tmp = []
	  for (var i of s) tmp = tmp.concat(i)
	  return new Uint8Array(tmp)
	}

	/**
	 * @description Uint8Array 2 Base64
	 * @param {*} u8Arr
	 * @param {*} urisafe
	 */
	Uint8ToBase64 (u8Arr, urisafe) {
	  const CHUNK_SIZE = 0x8000 // arbitrary number
	  const length = u8Arr.length
	  let index = 0
	  let result = ''
	  let slice
	  while (index < length) {
	    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length))
	    result += String.fromCharCode.apply(null, slice)
	    index += CHUNK_SIZE
	  }
	  return urisafe ? btoa(result).replace(/\//g, '_').replace(/\+/g, '-') : btoa(result)
	}

	/**
	 * @description 分区读取文件
	 * @param {*} file 文件
	 * @param {*} chunkCallback 分区回
	 * @param {*} endCallback 结束回调用
	 */
	readChunked (file, chunkCallback, endCallback) {
	  const fileSize = file.size
	  const readNext = () => {
	    const fileSlice = file.slice(this.offset, this.offset + this.chunkSize)
	    this.reader.readAsArrayBuffer(fileSlice)
	  }
	  this.reader.onload = () => {
	    if (this.reader.error) {
	      endCallback(this.reader.error || {})
	      return
	    }
	    this.offset += this.reader.result.byteLength
	    this.blockCount++
	    chunkCallback(this.reader.result, this.offset, fileSize)
	    if (this.offset >= fileSize) {
	      endCallback(null)
	      return
	    }
	    readNext()
	  }
	  this.reader.onerror = (err) => {
	    endCallback(err || {})
	  }
	  readNext()
	}

	getEtag () {
	  return new Promise((resolve, reject) => {
	    this.readChunked(this.file, (chunk, offs, total) => {
	      this.sha1String.push(this.shA1(chunk))
	      if (offs - chunk.byteLength === 0) {
	        this.fileInfo = fileType(chunk)
	      }
	    }, err => {
	      if (err) {
	        reject(err)
	      } else {
	        let sha1Buffer = this.concatArr2Uint8(this.sha1String)
	        let prefix = 0x16
	        // 如果大于4M，则对各个块的sha1结果再次sha1
	        console.log(this.blockCount)
	        if (this.blockCount > 1) {
	          prefix = 0x96
	          sha1Buffer = this.shA1(sha1Buffer.buffer)
	        } else {
	          sha1Buffer = Array.apply([], sha1Buffer)
	        }
	        sha1Buffer = this.concatArr2Uint8([[prefix], sha1Buffer])
	        console.log(this.Uint8ToBase64(sha1Buffer, true))
	        resolve({
	          md5: this.Uint8ToBase64(sha1Buffer, true),
	          typeInfo: this.fileInfo
	        })
	      }
	    })
	  })
	}
}

module.exports = Etag
