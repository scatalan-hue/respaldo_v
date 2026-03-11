import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { CountryResolver } from './resolvers/country.resolver';
import { CountryService } from './services/country.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  providers: [CountryResolver, CountryService],
})
export class CountryModule {}
