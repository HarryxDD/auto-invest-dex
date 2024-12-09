import { Module } from '@nestjs/common';
import { OrmModule } from '@/orm/orm.module';
import { RegistryProvider } from '@/providers/registry.provider';
import { PoolController } from './controllers/pool.controller';
import { PoolService } from './services/pool.service';
import { PortfolioService } from '@/portfolio/services/portfolio.service';
import { PoolActivityService } from './services/pool-activity.service';
import { SyncEvmPoolActivityService } from './services/sync-evm-pool-activity.service';
import { SyncEvmPoolService } from './services/sync-evm-pool.service';
import { EVMPoolController } from './controllers/evm-pool.controller';
import { SignatureService } from '@/providers/signature.provider';

@Module({
  imports: [OrmModule],
  providers: [
    RegistryProvider,
    PoolService,
    PoolActivityService,
    PortfolioService,
    SyncEvmPoolActivityService,
    SyncEvmPoolService,
    SignatureService,
  ],
  controllers: [PoolController, EVMPoolController],
})
export class PoolModule {}
