export interface CommonRes<T> {
  code: number;
  msg: string;
  data: T;
}

export interface LoginResult {
  userInfo: {
    token: string;
  };
}

export interface DailyQuestion {
  questionId: number;
  rightAnswer: string[];
}

export interface DailyQuestionResult {
  questionOptions: DailyQuestion[];
}

export interface AnswerParam {
  questionId: number;
  queryTime: string;
  questionAnswer: string[];
}

export interface QuestionStatic {
  dateStr: string;
  correctNum: 0 | 1;
  practiceNum: 0 | 1;
  holiday: boolean | null;
  isCompete: boolean;
}

export interface QuestionStaticResult {
  questionStaticList: QuestionStatic[];
}

export type AnswerStatus = "answered" | "already_answered" | "already_wrong" | "holiday";

export interface AnswerDateResult {
  date: string;
  status: AnswerStatus;
}
