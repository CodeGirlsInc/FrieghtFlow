export class CreateReportDto {
  title: string;
  description?: string;
  type: string; // ReportType enum value
  format: string; // ReportFormat enum value
  startDate?: Date;
  endDate?: Date;
  originCountry?: string;
  destinationCountry?: string;
  shipmentType?: string;
  shipmentId?: string;
  filters?: string; // JSON string of additional filters
}