import { Controller, Get } from '@nestjs/common';
import { EntitiesService } from './entities.service';

@Controller('entities')
export class EntitiesModuleController {
    constructor(private readonly entitiesService: EntitiesService) {}

    @Get()
    async findall() {
        return await this.entitiesService.findall();
    }
}