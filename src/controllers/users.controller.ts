import { ok } from '../utils/response';
import { UsersService } from '../services/users.service';
import type { Handler } from '../utils/http';
import type { UserCreatedRes, UserSignupReqDto } from '../dto/usersDto';

type UsersController = {
  signup: Handler<UserCreatedRes, UserSignupReqDto>;
};

export const usersController = {
  signup: (async (req, res) => {
    const { userId } = await UsersService.signUp(req.body);
    res.status(201).json(ok({ userId }));
  }) satisfies Handler<UserCreatedRes, UserSignupReqDto>,
} satisfies UsersController;
