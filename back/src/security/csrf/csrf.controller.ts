import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('csrf')
export class CsrfController {
  @Get()
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const csrfToken = (req as Request & { csrfToken: () => string }).csrfToken();
    res.json({ csrfToken });
  }
}
