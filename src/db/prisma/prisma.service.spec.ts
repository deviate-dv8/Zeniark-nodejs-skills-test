import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should connect to the DB on module init', async () => {
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockReturnValueOnce(Promise.resolve());
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await service.$disconnect();
  });
});
