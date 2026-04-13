import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit_logs.service';
import { AuditLogsController } from './audit_logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogs } from './audit_logs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogs])],
  providers: [AuditLogsService],
  controllers: [AuditLogsController],
  exports: [AuditLogsService]
})
export class AuditLogsModule {}
