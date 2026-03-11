import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractModule } from '../contracts/contract/contract.module';
import { StampModule } from '../stamp/stamp.module';
import { MovementController } from './controllers/movement.controller';
import { Movement } from './entity/movement.entity';
import { MovementLatestView } from './entity/views/movement-latest.view.entity';
import { MovementPaymentView } from './entity/views/movement-payment.view.entity';
import { MovementsView } from './entity/views/movement.view.entity';
import { MovementResolver } from './resolvers/movement.resolver';
import { MovementPaymentViewResolver } from './resolvers/views/movement-payment.view.resolver';
import { MovementViewResolver } from './resolvers/views/movement.view.resolver';
import { MovementService } from './services/movement.service';
import { MovementLatestViewService } from './services/views/movement-latest.view.service';
import { MovementPaymentViewService } from './services/views/movement-payment.view.service';
import { MovementViewService } from './services/views/movement.view.service';
import { MovementValidationService } from './services/movement.validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movement, MovementsView, MovementPaymentView, MovementLatestView]), ContractModule, StampModule],
  providers: [
    MovementService,
    MovementValidationService,
    MovementResolver,
    MovementViewResolver,
    MovementViewService,
    MovementPaymentViewService,
    MovementPaymentViewResolver,
    MovementLatestViewService,
  ],
  exports: [MovementService, MovementValidationService, MovementViewService, MovementPaymentViewService, MovementLatestViewService],
  controllers: [MovementController],
})
export class MovementModule {}
