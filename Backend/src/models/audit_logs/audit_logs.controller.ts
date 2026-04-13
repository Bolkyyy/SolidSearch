import { Controller, Get } from '@nestjs/common';
import { AuditLogsService } from './audit_logs.service';

@Controller('audit-logs')
export class AuditLogsController {
    constructor(private readonly auditLogsController: AuditLogsService) {}

    @Get()
    async findall() {
        return await this.auditLogsController.findall();
    }
}
