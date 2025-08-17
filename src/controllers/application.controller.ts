import { AppError } from '../errors/appError';
import { applicationService } from '../services/application.service';
import type { Handler } from '../utils/http';
import { ok } from '../utils/response';
import type { ApplicationResListDto } from '../dto/applicationDto';
type ApplicationContoller = {
  apply: Handler<{ applicationId: number }, never, { id: string }>;
  listMine: Handler<ApplicationResListDto, null>;
};

export const applicationContrller = {
  apply: (async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw AppError.badRequest();

    const appId = await applicationService.apply(req.user!.userId, id);

    return res.status(201).json(ok({ applicationId: appId }));
  }) satisfies Handler<{ applicationId: number }, never, { id: string }>,
  listMine: (async (req, res) => {
    const list = await applicationService.listMine(req.user!.userId);
    return res.status(200).json(ok(list));
  }) satisfies Handler<ApplicationResListDto, null>,
} satisfies ApplicationContoller;
