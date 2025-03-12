import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { SignInDTO } from './dto/signInDTO';
import { SignUpDTO } from './dto/signUp.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(
    @Body() signUpDto: SignUpDTO,
    @Res() res: Response,
  ): Promise<void> {
    res.json(await this.authService.signUp(signUpDto, res));
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() loginDto: SignInDTO, @Res() res: Response) {
    res.json(await this.authService.signIn(loginDto, res));
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    res.json(await this.authService.refreshToken(req, res));
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
