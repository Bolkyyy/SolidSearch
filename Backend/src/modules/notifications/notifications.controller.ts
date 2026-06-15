import { BadRequestException, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private parseUserId(raw: string): number {
    const id = parseInt(raw, 10);
    if (!id || id <= 0) throw new BadRequestException('userId is required');
    return id;
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.notificationsService.findAll(this.parseUserId(userId));
  }

  @Patch('read-all')
  markAllAsRead(@Query('userId') userId: string) {
    return this.notificationsService.markAllAsRead(this.parseUserId(userId));
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, this.parseUserId(userId));
  }

  @Delete('clear-all')
  clearAll(@Query('userId') userId: string) {
    return this.notificationsService.clearAll(this.parseUserId(userId));
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.notificationsService.remove(id, this.parseUserId(userId));
  }
}
