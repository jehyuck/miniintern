export type LoginRes = { accessToken: string; refreshToken: string };

export type UserSignInReqDto = {
  email: string;
  password: string;
};
