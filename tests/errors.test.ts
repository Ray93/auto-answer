/**
 * 错误处理测试
 */

import { describe, test, expect } from "bun:test";
import {
  APIError,
  NetworkError,
  ConfigError,
  ValidationError,
  AuthError,
  isAPIError,
  isNetworkError,
  isConfigError,
  isValidationError,
  isAuthError,
  isRetryableError,
} from "../errors/errors";

describe("错误类测试", () => {
  test("APIError", () => {
    const error = new APIError("API 错误", 400);
    expect(error.name).toBe("APIError");
    expect(error.message).toBe("API 错误");
    expect(error.code).toBe(400);
    expect(isAPIError(error)).toBe(true);
  });

  test("NetworkError", () => {
    const originalError = new Error("网络连接失败");
    const error = new NetworkError("网络错误", originalError);
    expect(error.name).toBe("NetworkError");
    expect(error.message).toBe("网络错误");
    expect(error.originalError).toBe(originalError);
    expect(isNetworkError(error)).toBe(true);
  });

  test("ConfigError", () => {
    const error = new ConfigError("缺少必需的配置");
    expect(error.name).toBe("ConfigError");
    expect(error.message).toBe("缺少必需的配置");
    expect(isConfigError(error)).toBe(true);
  });

  test("ValidationError", () => {
    const error = new ValidationError("验证失败", "email");
    expect(error.name).toBe("ValidationError");
    expect(error.message).toBe("验证失败");
    expect(error.field).toBe("email");
    expect(isValidationError(error)).toBe(true);
  });

  test("AuthError", () => {
    const error = new AuthError("认证失败");
    expect(error.name).toBe("AuthError");
    expect(error.message).toBe("认证失败");
    expect(isAuthError(error)).toBe(true);
  });
});

describe("错误类型守卫测试", () => {
  test("类型守卫应该正确识别错误类型", () => {
    const apiError = new APIError("API 错误");
    const networkError = new NetworkError("网络错误");
    const configError = new ConfigError("配置错误");
    const validationError = new ValidationError("验证错误");
    const authError = new AuthError("认证错误");
    const genericError = new Error("普通错误");

    expect(isAPIError(apiError)).toBe(true);
    expect(isAPIError(networkError)).toBe(false);
    expect(isAPIError(configError)).toBe(false);

    expect(isNetworkError(networkError)).toBe(true);
    expect(isNetworkError(apiError)).toBe(false);

    expect(isConfigError(configError)).toBe(true);
    expect(isConfigError(apiError)).toBe(false);

    expect(isValidationError(validationError)).toBe(true);
    expect(isValidationError(apiError)).toBe(false);

    expect(isAuthError(authError)).toBe(true);
    expect(isAuthError(apiError)).toBe(false);

    expect(isAPIError(genericError)).toBe(false);
  });
});

describe("isRetryableError 测试", () => {
  test("网络错误应该可重试", () => {
    const error = new NetworkError("网络连接失败");
    expect(isRetryableError(error)).toBe(true);
  });

  test("5xx API 错误应该可重试", () => {
    const error = new APIError("服务器错误", 500);
    expect(isRetryableError(error)).toBe(true);
  });

  test("4xx API 错误不应该重试", () => {
    const error = new APIError("客户端错误", 400);
    expect(isRetryableError(error)).toBe(false);
  });

  test("无错误代码的 API 错误应该可重试", () => {
    const error = new APIError("未知错误");
    expect(isRetryableError(error)).toBe(true);
  });

  test("其他错误不应该重试", () => {
    const error = new Error("普通错误");
    expect(isRetryableError(error)).toBe(false);
  });
});