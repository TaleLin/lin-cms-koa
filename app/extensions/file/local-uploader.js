const { Uploader } = require('lin-mizar/lin/file');
const fs = require('fs');

class LocalUploader extends Uploader {
  /**
   * 处理文件流
   * @param {object[]} files 文件流数组
   */
  async upload (files) {
    for (const stream of files) {
      const filepath = this.getStorePath(stream.filename);
      const target = fs.createWriteStream(filepath);
      await stream.pipe(target);
    }
  }
}

module.exports = { LocalUploader };
