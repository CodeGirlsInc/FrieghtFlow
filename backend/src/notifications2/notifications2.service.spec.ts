import { Test, TestingModule } from '@nestjs/testing';
import { Notifications2Service } from './notifications2.service';

describe('Notifications2Service', () => {
  let service: Notifications2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Notifications2Service],
    }).compile();

    service = module.get<Notifications2Service>(Notifications2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
