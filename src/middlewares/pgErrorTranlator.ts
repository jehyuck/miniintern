import { AppError } from '../errors/appError';

type PgError = Error & {
  code?: string;
  constraint?: string;
  column?: string;
  detail?: string;
};

export function translatePgError(e: unknown): AppError | null {
  const err = e as PgError;
  if (e instanceof AppError) return e;
  switch (err?.code) {
    case '23505': {
      if (err.constraint === 'userId_title_unique') {
        return AppError.conflict('동일 제목의 클래스가 이미 존재합니다.');
      }
      return AppError.conflict('중복으로 생성할 수 없습니다.');
    }
    case '23514': {
      // check_violation
      switch (err.constraint) {
        case 'chk_mclass_time_order':
          return AppError.badRequest(
            'endDate는 startDate 이후여야 하고, applyDeadline은 startDate 이전/동일이어야 합니다.',
          );
        case 'chk_mclass_capacity_positive':
          return AppError.badRequest('capacity는 1 이상이어야 합니다.');
        default:
          return AppError.badRequest('입력 값이 제약 조건을 위반했습니다.');
      }
    }
    case '23503': // foreign_key_violation
      return AppError.badRequest('연관된 리소스를 찾을 수 없습니다.');
    case '23502': // not_null_violation
      return AppError.badRequest('필수 필드가 누락되었습니다.');
    case '22P02': // invalid_text_representation (예: 잘못된 날짜/숫자 형식)
      return AppError.badRequest('입력 형식이 올바르지 않습니다.');
    default:
      console.log('데이터베이스 에러' + err);
      return AppError.internal('데이터베이스 오류가 발생했습니다.');
  }
}
