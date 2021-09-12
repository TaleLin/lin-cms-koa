import sharp from "sharp";
import svgCaptcha from "svg-captcha";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";
import { config } from "lin-mizar";

const iv = Buffer.from(randomBytes(8)).toString("hex");
const secret = config.getItem("secret");
const key = createHash("sha256")
  .update(String(secret))
  .digest("base64")
  .substr(0, 32);

/**
 * 加密
 *
 * @param {string} value 需要加密的信息
 * @returns 加密后的值
 */
function aesEncrypt(value) {
  const cipher = createCipheriv("aes-256-ctr", key, iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/**
 * 解密
 *
 * @param {string} encrypted 需要解密的信息
 * @returns 解密后的值
 */
function aesDecrypt(encrypted) {
  const cipher = createDecipheriv("aes-256-ctr", key, iv);
  let decrypted = cipher.update(encrypted, "hex", "utf8");
  decrypted += cipher.final("utf8");
  return decrypted;
}

/**
 * 给 tag 加密
 */
function getTag(captcha) {
  const date = new Date();
  // 5 分钟后过期
  date.setMinutes(date.getMinutes() + 5);
  const info = {
    captcha,
    expired: date.getTime(),
  };

  return aesEncrypt(JSON.stringify(info));
}

/**
 * 校验验证码是否正确
 */
function verifyCaptcha(loginCaptcha, tag) {
  if (!loginCaptcha || !tag) {
    return false;
  }
  const decrypted = aesDecrypt(tag);
  try {
    const { captcha, expired } = JSON.parse(decrypted);
    // 大小写不敏感
    if (
      loginCaptcha.toLowerCase() !== captcha.toLowerCase() ||
      new Date().getTime() > expired
    ) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
}

/**
 * 生成验证码图片及对称加密用到的 tag
 */
async function generateCaptcha() {
  const captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    fontSize: 45, // 验证码字号
    noise: Math.floor(Math.random() * 5), // 干扰线条数目
    width: 80, // 宽度
    height: 40, // 高度
    color: true, // 验证码字符是否有颜色，默认是没有，但是如果设置了背景颜色，那么默认就是有字符颜色
    background: "#fff", // 背景色
  });

  const { data, text } = captcha;
  const str = await sharp(Buffer.from(data))
    .png()
    .toBuffer();
  const image = "data:image/jpg;base64," + str.toString("base64");

  return {
    image,
    tag: getTag(text),
  };
}

export { generateCaptcha, verifyCaptcha };
