import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  async create(@Body() dto: CreateHistoryDto) {
    return this.historyService.create(dto);
  }

  @Get()
  async findAll() {
    return this.historyService.findAll();
  }

  @Get(":user_id")
  async findAllById(@Param("user_id") user_id: number) {
    return this.historyService.findAllById(user_id);
  }

  @Delete(":user_id")
  async clearByUserId(@Param("user_id") user_id: number) {
    return this.historyService.clearByUserId(user_id);
  }
}