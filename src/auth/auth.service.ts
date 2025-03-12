import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { SignInDTO } from './dto/signInDTO';
import e from 'express';
import { SignUpDTO } from './dto/signUp.dto';
import { User } from '../users/entity/user.entity';
import { CustomException } from '../exceptions/custom.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../role/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async signIn(
    loginDto: SignInDTO,
    res: e.Response,
  ): Promise<{ userID: number; userName: string; userRole: string; userEmail: string; access_token: string }> {
    console.log(loginDto);
    const user = await this.usersService.findOne(loginDto.email);
    console.log(user);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      // secure: true, // Set to true if using HTTPS
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });

    return {
      userID: user.id,
      userName: user.name,
      userRole: user.role.name,
      userEmail: user.email,
      access_token: accessToken,
    };
  }

  async signUp(signUpDto: SignUpDTO, res: e.Response) {
    const foundUser = await this.usersService.findOne(signUpDto.email);
    if (foundUser) {
      throw new CustomException('User email already exists', 400);
    }

    const role = await this.roleRepository.findOne({
      where: { name: 'USER' }});

    const user = new User();
    user.name = signUpDto.name;
    user.email = signUpDto.email;
    user.password = await bcrypt.hash(signUpDto.password, 10);
    user.role = role as Role;

    const savedUser = await this.usersService.create(user);
    const payload = { sub: savedUser.id, username: savedUser.email };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      // secure: true, // Set to true if using HTTPS
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/refresh_token',
    });

    return {
      access_token: accessToken,
    };
  }

  async refreshToken(req: e.Request ,res: e.Response) {
    const refreshToken: string = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.usersService.findOne(payload.username);
      if (!user) {
        throw new UserNotFoundException();
      }

      const newAccessToken = await this.jwtService.signAsync({ sub: user.id, username: user.email });
      const newRefreshToken = await this.jwtService.signAsync({ sub: user.id, username: user.email }, { expiresIn: '30d' });

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        // secure: true, // Set to true if using HTTPS
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/refresh_token',
      });

      return {
        userID: user.id,
        userName: user.name,
        userRole: user.role.name,
        userEmail: user.email,
        access_token: newAccessToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
