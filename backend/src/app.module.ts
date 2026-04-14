import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoodleModule } from './moodle/moodle.module';

@Module({
  imports: [MoodleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
