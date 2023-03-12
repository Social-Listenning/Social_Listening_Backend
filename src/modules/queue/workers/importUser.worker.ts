import {
  Processor,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
} from '@nestjs/bull';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { UserService } from 'src/modules/users/services/user.service';
import * as xlsx from 'xlsx';

@Processor('importUser')
export class ImportUserWorker {
  private readonly logger = new Logger(ImportUserWorker.name);

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
    this.logger.log(`Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
    );
  }

  @Process()
  async importUser(
    job: Job<{
      file: Express.Multer.File;
      owner: string;
    }>,
  ): Promise<boolean> {
    const { file, owner } = job.data;

    const dataFromExcel = this.readExcelFile(file.path);
    await this.userService.importData(dataFromExcel, owner);

    return true;
  }

  private readExcelFile(filePath: string) {
    const workBook = xlsx.readFile(filePath);
    const sheetName = workBook?.SheetNames[0];
    const sheet: xlsx.WorkSheet = workBook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(sheet);
    return jsonData;
  }
}