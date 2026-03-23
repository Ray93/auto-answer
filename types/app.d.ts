interface LoginInfo {
  account: string;
  password: string;
}

interface LoginResult {
  userInfo: {
    token: string;
  };
}

interface DailyQuestion {
  questionId: number;
  rightAnswer: string[];
}

interface DailyQuestionResult {
  questionOptions: [DailyQuestion];
}

interface AnswerParam {
  questionId: number;
  queryTime: string;
  questionAnswer: string[];
}

interface CommonRes<T> {
  code: number;
  msg: string;
  data: T;
}

interface QuestionStatic {
  dateStr: string;
  correctNum: 0 | 1;
  practiceNum: 0 | 1;
  holiday: boolean | null;
  isCompete: boolean;
}

interface questionStaticResult {
  questionStaticList: QuestionStatic[];
}
