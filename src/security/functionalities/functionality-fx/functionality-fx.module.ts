import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FunctionalityFx } from "./entities/functionality-fx.entity";

@Module({
  imports: [TypeOrmModule.forFeature([FunctionalityFx])]
})
export class FunctionalityFxModule {}
