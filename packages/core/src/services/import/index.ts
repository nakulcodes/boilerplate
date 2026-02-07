import { ImportService, DefaultImportService } from './import.service';

export const importService = {
  provide: ImportService,
  useClass: DefaultImportService,
};

export { ImportService, DefaultImportService };
export * from './import.types';
