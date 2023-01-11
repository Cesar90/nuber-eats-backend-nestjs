import { UploadsController } from './upload.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers:[UploadsController]
})
export class UploadsModule {}
