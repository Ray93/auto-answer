/**
 * 自定义错误类型
 */

/**
 * API 错误基类
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 网络错误
 */
export class NetworkError extends Error {
  constructor(
    message: string = '网络请求失败',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * 配置错误
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * 验证错误
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 认证错误
 */
export class AuthError extends Error {
  constructor(message: string = '认证失败') {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * 错误类型守卫
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isConfigError(error: unknown): error is ConfigError {
  return error instanceof ConfigError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(error: unknown): boolean {
  if (isNetworkError(error)) return true;
  if (isAPIError(error)) {
    // HTTP 5xx 错误或特定错误代码可重试
    return !error.code || error.code >= 500;
  }
  return false;
}