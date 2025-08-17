import type { MclassCreateReqDto } from '../dto/mclassDto';
import { mclassService } from '../services/mclass.service';
import type { Handler } from '../utils/http';
import { ok } from '../utils/response';
type MclassController = {
  create: Handler<number, MclassCreateReqDto>;
};

export const mClassController = {
  create: (async (req, res) => {
    const userId = req.user.userId;
    const mclassId = await mclassService.create({ ...req.body, userId });

    res.status(201).json(ok(mclassId));
  }) satisfies Handler<number, MclassCreateReqDto>,
} satisfies MclassController;
