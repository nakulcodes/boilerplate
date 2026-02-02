import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../../database/repositories';
import { AuthService } from '../../services/auth.service';
import { LoginCommand } from './login.command';
import { LoginResponseDto } from '../../dtos/auth-response.dto';

@Injectable()
export class Login {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResponseDto> {
    // Find user by email with organization relation
    const email = command.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({
      where: { email },
      relations: { organization: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Incorrect email or password provided');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await this.authService.comparePasswords(
      command.password,
      user.password ?? '',
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect email or password provided');
    }

    // Generate access and refresh tokens
    const accessToken = this.authService.generateAccessToken(
      user,
      user.role?.permissions ?? [],
    );
    const refreshToken = this.authService.generateRefreshToken(user);
    const refreshTokenExpires = this.authService.getRefreshTokenExpiry();

    // Store refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = refreshTokenExpires;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? '',
        lastName: user.lastName,
        organizationId: user.organizationId,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
      },
    };
  }
}
