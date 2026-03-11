import { Test, TestingModule } from '@nestjs/testing';
import { PageBlockItemResolver } from '../src/main/cms/page-config/page-block/resolvers/page-block-item.resolver'; //relative path is avaliable but not absolutely

describe('pageblockitemresolver', () => {
  let pageBlockItemResolver: PageBlockItemResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PageBlockItemResolver],
    }).compile();

    pageBlockItemResolver = module.get<PageBlockItemResolver>(PageBlockItemResolver);
  });

  it('should be defined', () => {
    expect(pageBlockItemResolver).toBeDefined();
  });
});
