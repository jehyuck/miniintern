import { ok } from '../utils/response';
import { UsersService } from '../services/users.service';
import type { Handler } from '../utils/http';
import type { UserCreatedRes, UserPatchReqDto, UserSignupReqDto } from '../dto/usersDto';

type UsersController = {
  signup: Handler<UserCreatedRes, UserSignupReqDto>;
  patchMe: Handler<null, UserPatchReqDto>;
};

export const usersController = {
  signup: (async (req, res) => {
    const { userId } = await UsersService.signUp(req.body);
    res.status(201).json(ok({ userId }));
  }) satisfies Handler<UserCreatedRes, UserSignupReqDto>,
  patchMe: (async (req, res) => {
    await UsersService.patchMe(req.user.userId, req.body);
    return res.status(204).json(ok(null));
  }) satisfies Handler<null, UserPatchReqDto>,
} satisfies UsersController;
