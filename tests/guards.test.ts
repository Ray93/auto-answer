/**
 * 类型守卫测试
 */

import { describe, test, expect } from "bun:test";
import {
  isObject,
  isLoginResult,
  isDailyQuestionResult,
  isQuestionStaticResult,
} from "../types/guards";

describe("类型守卫测试", () => {
  test("isObject", () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: "value" })).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject("string")).toBe(false);
    expect(isObject(123)).toBe(false);
  });

  test("isLoginResult", () => {
    const validResult = {
      userInfo: {
        token: "test-token-123",
      },
    };
    expect(isLoginResult(validResult)).toBe(true);

    const invalidResult1 = { userInfo: {} };
    expect(isLoginResult(invalidResult1)).toBe(false);

    const invalidResult2 = { userInfo: { token: 123 } };
    expect(isLoginResult(invalidResult2)).toBe(false);

    const invalidResult3 = {};
    expect(isLoginResult(invalidResult3)).toBe(false);
  });

  test("isDailyQuestionResult", () => {
    const validResult = {
      questionOptions: [
        {
          questionId: 1,
          rightAnswer: ["A", "B"],
        },
      ],
    };
    expect(isDailyQuestionResult(validResult)).toBe(true);

    const invalidResult1 = {
      questionOptions: [],
    };
    expect(isDailyQuestionResult(invalidResult1)).toBe(false);

    const invalidResult2 = {
      questionOptions: [
        {
          questionId: "1",
          rightAnswer: ["A"],
        },
      ],
    };
    expect(isDailyQuestionResult(invalidResult2)).toBe(false);

    const invalidResult3 = {};
    expect(isDailyQuestionResult(invalidResult3)).toBe(false);
  });

  test("isQuestionStaticResult", () => {
    const validResult = {
      questionStaticList: [
        {
          dateStr: "2024-01-01",
          correctNum: 1,
          practiceNum: 0,
          holiday: false,
          isCompete: true,
        },
        {
          dateStr: "2024-01-02",
          correctNum: 0,
          practiceNum: 1,
          holiday: null, // 测试 null 值
          isCompete: false,
        },
      ],
    };
    expect(isQuestionStaticResult(validResult)).toBe(true);

    const invalidResult1 = {
      questionStaticList: [
        {
          dateStr: "2024-01-01",
          correctNum: 2, // invalid
          practiceNum: 0,
          holiday: false,
          isCompete: true,
        },
      ],
    };
    expect(isQuestionStaticResult(invalidResult1)).toBe(false);

    const invalidResult2 = {};
    expect(isQuestionStaticResult(invalidResult2)).toBe(false);

    // 测试 holiday 为 null 的边界情况
    const resultWithNullHoliday = {
      questionStaticList: [
        {
          dateStr: "2024-01-01",
          correctNum: 0,
          practiceNum: 0,
          holiday: null,
          isCompete: true,
        },
      ],
    };
    expect(isQuestionStaticResult(resultWithNullHoliday)).toBe(true);

    // 测试 holiday 为无效类型（字符串）
    const resultWithInvalidHoliday = {
      questionStaticList: [
        {
          dateStr: "2024-01-01",
          correctNum: 0,
          practiceNum: 0,
          holiday: "false" as any,
          isCompete: true,
        },
      ],
    };
    expect(isQuestionStaticResult(resultWithInvalidHoliday)).toBe(false);
  });
});
