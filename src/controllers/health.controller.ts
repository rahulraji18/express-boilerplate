import { Request, Response } from 'express';

export class HealthController {
  public check(req: Request, res: Response): void {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
  }
}
