/**
 * 日志工具
 * 支持日志级别，不包含敏感信息
 */

import { appendFileSync, writeFileSync } from "node:fs";
import { config } from "../config/config";

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 当前日志级别（可通过环境变量配置）
 */
const currentLogLevel = parseLogLevel(Bun.env.LOG_LEVEL || 'INFO');

/**
 * 日志级别名称映射
 */
const levelNames: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

/**
 * 用户标识（从账号中提取前3位，保护隐私）
 */
const userIdentifier = config.credentials.account.slice(0, 3) + '***';

/**
 * 解析日志级别字符串
 */
function parseLogLevel(level: string): LogLevel {
  const upperLevel = level.toUpperCase();
  switch (upperLevel) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO;
  }
}

/**
 * 格式化时间戳
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 格式化日志消息
 */
function formatLogMessage(level: LogLevel, message: string): string {
  const timestamp = formatTimestamp();
  const levelName = levelNames[level];
  return `[${timestamp}] [${levelName}] [${userIdentifier}] ${message}`;
}

/**
 * 将日志写入控制台和文件
 */
function writeLog(level: LogLevel, message: string): void {
  const formattedMessage = formatLogMessage(level, message);
  
  // 控制台输出
  console.log(formattedMessage);
  
  // 文件输出（追加模式）
  try {
    appendFileSync("output.txt", formattedMessage + "\n", { encoding: "utf-8" });
  } catch (error) {
    // 如果写入文件失败，只在控制台输出错误
    console.error(`写入日志文件失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 清理日志文件（如果需要）
 */
export function clearLogFile(): void {
  try {
    writeFileSync("output.txt", "", { encoding: "utf-8" });
  } catch (error) {
    console.error(`清空日志文件失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 调试级别日志
 */
export function logDebug(message: string): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    writeLog(LogLevel.DEBUG, message);
  }
}

/**
 * 信息级别日志
 */
export function logInfo(message: string): void {
  if (currentLogLevel <= LogLevel.INFO) {
    writeLog(LogLevel.INFO, message);
  }
}

/**
 * 警告级别日志
 */
export function logWarn(message: string): void {
  if (currentLogLevel <= LogLevel.WARN) {
    writeLog(LogLevel.WARN, message);
  }
}

/**
 * 错误级别日志
 */
export function logError(message: string, error?: unknown): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    const errorMessage = error 
      ? `${message} - ${error instanceof Error ? error.message : String(error)}`
      : message;
    writeLog(LogLevel.ERROR, errorMessage);
  }
}

/**
 * 向后兼容的日志函数（别名）
 */
export const log = logInfo;