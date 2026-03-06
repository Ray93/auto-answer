/**
 * HTTP 请求工具
 * 支持超时、重试和错误处理
 */

import { config } from "../config/config";
import { APIError, NetworkError, isAPIError, isRetryableError } from "../errors/errors";
import { logError } from "./logger";

/**
 * 创建带超时的 AbortController
 */
function createTimeoutController(timeoutMs: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
}

/**
 * 带重试的 HTTP 请求
 */
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await enhancedFetch<T>(url, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 如果是最后一次尝试或错误不可重试，直接抛出
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw lastError;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  throw lastError;
}

/**
 * 增强的 fetch 函数（带超时）
 */
async function enhancedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const { controller, timeoutId } = createTimeoutController(config.api.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    if (!response.ok) {
      throw new APIError(
        `HTTP 错误: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    
    const data: CommonRes<T> = await response.json();
    
    if (data.code === 200) {
      return data.data;
    } else {
      throw new APIError(data.msg, data.code);
    }
  } catch (error) {
    // 处理超时错误
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new NetworkError(`请求超时（${config.api.timeout}ms）`);
    }
    
    // 如果已经是我们的自定义错误，直接抛出
    if (isAPIError(error) || error instanceof NetworkError) {
      logError(error.message);
      throw error;
    }
    
    // 网络错误包装
    if (error instanceof TypeError) {
      const networkError = new NetworkError('网络请求失败', error);
      logError(networkError.message);
      throw networkError;
    }
    
    // 其他未知错误
    const errorMessage = error instanceof Error ? error.message : String(error);
    const wrappedError = new Error(errorMessage);
    logError(errorMessage);
    throw wrappedError;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 自定义 fetch 封装（向后兼容，使用重试机制）
 */
export async function customfetch<T>(url: string, options?: RequestInit): Promise<T> {
  return fetchWithRetry<T>(
    url,
    options,
    config.api.retryAttempts,
    config.api.retryDelay
  );
}