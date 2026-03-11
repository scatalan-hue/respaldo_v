import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductResolver } from './resolvers/product.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { FilesModule } from '../../../general/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), FilesModule],
  providers: [ProductResolver, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
