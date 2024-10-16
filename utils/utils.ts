import CryptoJS from "crypto-js";
import { appendFileSync } from "node:fs";

export async function customfetch<T>(url: string, options?: RequestInit) {
  try {
    const data: CommonRes<T> = await fetch(url, options).then((response) => response.json());
    if (data.code === 200) {
      return data.data;
    } else {
      throw new Error(data.msg);
    }
  } catch (error) {
    log(error as string);
    throw new Error(error as string);
  }
}

const key = Buffer.from(Bun.env.KEY as string, "base64").toString("utf-8");
const iv = Bun.env.IV as string;

/**
 * 对字符串进行加密
 *
 * @param str 待加密的字符串
 * @returns 加密后的字符串（Base64编码）
 */
export function encryption(str: string) {
  const y = CryptoJS.enc.Utf8.parse(str);
  const c = CryptoJS.enc.Utf8.parse(key);
  const s = CryptoJS.enc.Utf8.parse(iv);
  const S = CryptoJS.AES.encrypt(y, c, { iv: s, mode: CryptoJS.mode.CBC });
  return CryptoJS.enc.Base64.stringify(S.ciphertext);
}

export function log(str: string) {
  const handledStr = `${Bun.env.ACCOUNT}: ${str}`;
  console.log(handledStr);
  appendFileSync("output.txt", handledStr + "\n", { encoding: "utf-8" });
}
