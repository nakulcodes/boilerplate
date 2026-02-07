import { ExportService, DefaultExportService } from './export.service';

export const exportService = {
  provide: ExportService,
  useClass: DefaultExportService,
};

export { ExportService, DefaultExportService };
export * from './export.types';
