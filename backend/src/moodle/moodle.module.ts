import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MoodleController } from './moodle.controller';
import { MoodleService } from './moodle.service';

@Module({
  imports: [HttpModule],
  controllers: [MoodleController],
  providers: [MoodleService],
})
export class MoodleModule {}