const { Uploader } = require('lin-mizar/lin/file');
const { File } = require('lin-mizar');
const { config } = require('lin-mizar/lin/config');
const fs = require('fs');
const path = require('path');
const { cloneDeep } = require('lodash');

class LocalUploader extends Uploader {
  /**
   * 处理文件流
   * @param {object[]} files 文件流数组
   */
  async upload (files) {
    const arr = [];
    for (const stream of files) {
      // 由于stream的特性，当读取其中的数据时，它的buffer会被消费
      // 所以此处深拷贝一份计算md5值
      const tmpStream = cloneDeep(stream);
      const md5 = this.generateMd5(tmpStream);
      const siteDomain = config.getItem('siteDomain', 'http://localhost');
      // 检查md5存在
      const exist = await File.findOne({
        where: {
          md5: md5
        }
      });
      if (exist) {
        arr.push({
          key: stream.fieldname,
          id: exist.id,
          url: `${siteDomain}/assets/${exist.path}`
        });
      } else {
        const { absolutePath, relativePath, realName } = this.getStorePath(
          stream.filename
        );
        const target = fs.createWriteStream(absolutePath);
        await stream.pipe(target);
        const ext = path.extname(realName);
        // stream.filename tream.filedname stream.mimeType stream.readableLength
        const saved = await File.createRecord(
          {
            path: relativePath,
            // type: 1,
            name: realName,
            extension: ext,
            size: stream._readableState.length,
            md5: md5
          },
          true
        );
        arr.push({
          key: stream.fieldname,
          id: saved.id,
          url: `${siteDomain}/assets/${saved.path}`
        });
      }
    }
    return arr;
  }
}

module.exports = { LocalUploader };
