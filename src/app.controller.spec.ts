import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return status ok and version', () => {
      const result = appController.root();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('health', () => {
    it('should return status ok and version', () => {
      const result = appController.health();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
    });
  });
});