import type { MclassCreateReqDto, MclassDeleteReqDto, MclassResListDto } from '../dto/mclassDto';
import { mclassService } from '../services/mclass.service';
import type { Handler } from '../utils/http';
import { ok } from '../utils/response';

type MclassController = {
  create: Handler<number, MclassCreateReqDto>;
  readAll: Handler<MclassResListDto, null>;
  delete: Handler<number, MclassDeleteReqDto>;
};

export const mClassController = {
  create: (async (req, res) => {
    const userId = req.user.userId;
    const mclassId = await mclassService.create({ ...req.body, userId });

    res.status(201).json(ok(mclassId));
  }) satisfies Handler<number, MclassCreateReqDto>,
  readAll: async (req, res) => {
    const dto = await mclassService.readAll();
    res.status(200).json(ok(dto));
  },
  delete: (async (req, res) => {
    const deletedId = await mclassService.delete({
      userId: req.user.userId,
      mclassId: req.body.mclassId,
    });

    res.status(204).json(ok(deletedId));
  }) satisfies Handler<number, MclassDeleteReqDto>,
} satisfies MclassController;
