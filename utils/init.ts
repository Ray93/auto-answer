/**
 * 应用初始化工具
 */

import { config } from "../config/config";
import { login } from "../api/api";
import { ConfigError } from "../errors/errors";

/**
 * 初始化应用环境
 */
export function initializeEnvironment(): void {
  Bun.env.TZ = config.timezone;
}

/**
 * 执行登录流程
 */
export async function performLogin(): Promise<void> {
  try {
    await login();
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }
    throw new Error(`登录失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 初始化应用（设置环境并登录）
 */
export async function initializeApp(): Promise<void> {
  initializeEnvironment();
  await performLogin();
}