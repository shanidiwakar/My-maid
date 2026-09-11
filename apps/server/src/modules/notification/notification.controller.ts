import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { NotificationService } from './notification.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { DeactivateDeviceTokenDto } from './dto/deactivate-device-token.dto';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) { }

    @Get()
    getNotifications(
        @CurrentUser() user: JwtPayload,
        @Query() query: NotificationQueryDto,
    ) {
        return this.notificationService.getNotifications(
            user.sub,
            query,
        );
    }

    @Get('unread-count')
    getUnreadCount(
        @CurrentUser() user: JwtPayload,
        @Query() query: NotificationQueryDto,
    ) {
        return this.notificationService.getUnreadCount(
            user.sub,
            query.audience,
        );
    }

    @Patch('read-all')
    markAllAsRead(
        @CurrentUser() user: JwtPayload,
        @Query() query: NotificationQueryDto,
    ) {
        return this.notificationService.markAllAsRead(
            user.sub,
            query.audience,
        );
    }

    @Patch(':id/read')
    markAsRead(
        @CurrentUser() user: JwtPayload,
        @Param('id') notificationId: string,
    ) {
        return this.notificationService.markAsRead(
            user.sub,
            notificationId,
        );
    }

    @Post('device-token')
    @ApiMessage('Device token registered successfully')
    registerDeviceToken(
        @CurrentUser() user: JwtPayload,
        @Body() dto: RegisterDeviceTokenDto,
    ) {
        return this.notificationService.registerDeviceToken(
            user.sub,
            dto,
        );
    }

    @Delete('device-token')
    @ApiMessage('Device token deactivated successfully')
    deactivateDeviceToken(
        @CurrentUser() user: JwtPayload,
        @Body() dto: DeactivateDeviceTokenDto,
    ) {
        return this.notificationService.deactivateDeviceToken(
            user.sub,
            dto.token,
        );
    }
}