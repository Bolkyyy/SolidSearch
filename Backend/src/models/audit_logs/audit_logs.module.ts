import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit_logs.service';
import { AuditLogsController } from './audit_logs.controller';

@Module({
  providers: [AuditLogsService],
  controllers: [AuditLogsController]
})
export class AuditLogsModule {}
