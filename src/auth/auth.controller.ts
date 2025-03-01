import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
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

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
