import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Controller('profile')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('Profile')
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService,
    ) { }

    @Get()
    getProfile(@CurrentUser() user: JwtPayload) {
        return this.profileService.getProfile(user.sub);
    }
    
    @Put()
    updateProfile(
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateProfileDto,
    ) {
        console.log('PUT /profile hit');
  console.log(user);
  console.log(dto);

        return this.profileService.updateProfile(
            user.sub,
            dto,
        );
    }
}