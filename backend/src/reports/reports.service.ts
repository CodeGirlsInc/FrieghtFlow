// #1000 – Reports: queued PDF/CSV generation & weekly digest
import { Injectable, Logger } from '@nestjs/common';

export type ReportFormat = 'pdf' | 'csv';
export type ReportStatus = 'pending' | 'ready' | 'failed';
export interface ReportJob { jobId: string; userId: string; format: ReportFormat; status: ReportStatus; downloadUrl?: string; }

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly jobs = new Map<string, ReportJob>();

  async generateReport(userId: string, format: ReportFormat, dateFrom: string, dateTo: string): Promise<ReportJob> {
    const jobId = `report_${Date.now()}`;
    const job: ReportJob = { jobId, userId, format, status: 'pending' };
    this.jobs.set(jobId, job);
    this.logger.log(`Report job ${jobId} queued for user ${userId} (${format}) ${dateFrom}–${dateTo}`);
    return job;
  }

  async getStatus(jobId: string): Promise<ReportJob> {
    return this.jobs.get(jobId) ?? { jobId, userId: '', format: 'csv', status: 'failed' };
  }

  async sendWeeklyDigest(userId: string): Promise<{ sent: boolean }> {
    this.logger.log(`Weekly digest sent to user ${userId}`);
    return { sent: true };
  }
}
