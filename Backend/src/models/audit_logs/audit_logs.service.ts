import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLogs } from './audit_logs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditLogsService {
    constructor (
        @InjectRepository(AuditLogs)
        private readonly auditLogsRepository: Repository<AuditLogs>
    ) {}

    async findall() {
        return await this.auditLogsRepository.find();
    }
}
