// 요청 바디 DTO
export type UserSignupReqDto = {
  email: string;
  password: string;
};

// 성공 응답 DTO
export type UserCreatedRes = {
  userId: number;
};
