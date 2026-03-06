import CryptoJS from "crypto-js";
import { config } from "../config/config";

/**
 * 对字符串进行加密
 *
 * @param str 待加密的字符串
 * @returns 加密后的字符串（Base64编码）
 */
export function encryption(str: string) {
  const keyString = Buffer.from(config.credentials.key, "base64").toString("utf-8");
  const y = CryptoJS.enc.Utf8.parse(str);
  const c = CryptoJS.enc.Utf8.parse(keyString);
  const s = CryptoJS.enc.Utf8.parse(config.credentials.iv);
  const S = CryptoJS.AES.encrypt(y, c, { iv: s, mode: CryptoJS.mode.CBC });
  return CryptoJS.enc.Base64.stringify(S.ciphertext);
}