const { Uploader } = require('lin-mizar/lin/file');
const { File } = require('lin-mizar');
const { config } = require('lin-mizar/lin/config');
const fs = require('fs');
const path = require('path');

class LocalUploader extends Uploader {
  /**
   * 处理文件对象
   * { size, encoding, fieldname, filename, mimeType, data }
   */
  async upload (files) {
    const arr = [];
    for (const file of files) {
      // 由于stream的特性，当读取其中的数据时，它的buffer会被消费
      // 所以此处深拷贝一份计算md5值
      const md5 = this.generateMd5(file);
      const siteDomain = config.getItem('siteDomain', 'http://localhost');
      // 检查md5存在
      const exist = await File.findOne({
        where: {
          md5: md5
        }
      });
      if (exist) {
        arr.push({
          key: file.fieldname,
          id: exist.id,
          path: `${exist.path}`,
          url: `${siteDomain}/assets/${exist.path}`
        });
      } else {
        const { absolutePath, relativePath, realName } = this.getStorePath(
          file.filename
        );
        const target = fs.createWriteStream(absolutePath);
        await target.write(file.data);
        const ext = path.extname(realName);
        const saved = await File.createRecord(
          {
            path: relativePath,
            // type: 1,
            name: realName,
            extension: ext,
            size: file.size,
            md5: md5
          },
          true
        );
        arr.push({
          key: file.fieldname,
          id: saved.id,
          path: `${saved.path}`,
          url: `${siteDomain}/assets/${saved.path}`
        });
      }
    }
    return arr;
  }
}

module.exports = { LocalUploader };
