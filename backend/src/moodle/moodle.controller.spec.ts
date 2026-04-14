import { Test, TestingModule } from '@nestjs/testing';
import { MoodleController } from './moodle.controller';

describe('MoodleController', () => {
  let controller: MoodleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoodleController],
    }).compile();

    controller = module.get<MoodleController>(MoodleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
