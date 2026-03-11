import { ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { FileInfo } from '../entities/file-info.entity';
import { FilesService } from '../services/files.service';

@Resolver((of) => FileInfo)
export class FilesResolver {
  constructor(private readonly service: FilesService) {}

  @Query(() => FileInfo, { name: 'file' })
  async findOne(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string, @CurrentContext() context): Promise<FileInfo> {
    return this.service.findOne(context, id);
  }

  @ResolveField(() => String, { name: 'url' })
  async getUrl(@Parent() file: FileInfo, @CurrentContext() context): Promise<String> {
    return '/attachment/files/static/' + file.id + '.' + file.fileExtension;
  }
}
