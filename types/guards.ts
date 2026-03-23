/**
 * 类型守卫和类型验证工具
 */

/**
 * 检查值是否为非空对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 验证登录结果
 */
export function isLoginResult(data: unknown): data is LoginResult {
  if (!isObject(data)) return false;
  
  const userInfo = data.userInfo;
  if (!isObject(userInfo)) return false;
  
  return typeof userInfo.token === 'string';
}

/**
 * 验证每日题目结果
 */
export function isDailyQuestionResult(data: unknown): data is DailyQuestionResult {
  if (!isObject(data)) return false;
  
  const questionOptions = data.questionOptions;
  if (!Array.isArray(questionOptions) || questionOptions.length === 0) return false;
  
  const firstQuestion = questionOptions[0];
  if (!isObject(firstQuestion)) return false;
  
  return typeof firstQuestion.questionId === 'number' && 
         Array.isArray(firstQuestion.rightAnswer);
}

/**
 * 验证题目统计结果
 */
export function isQuestionStaticResult(data: unknown): data is questionStaticResult {
  if (!isObject(data)) return false;
  
  const questionStaticList = data.questionStaticList;
  if (!Array.isArray(questionStaticList)) return false;
  
  return questionStaticList.every(item => 
    isObject(item) &&
    typeof item.dateStr === 'string' &&
    (item.correctNum === 0 || item.correctNum === 1) &&
    (item.practiceNum === 0 || item.practiceNum === 1) &&
    (item.holiday === null || typeof item.holiday === 'boolean') &&
    typeof item.isCompete === 'boolean'
  );
}
