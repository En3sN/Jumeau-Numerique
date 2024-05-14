import { Global, Module } from '@nestjs/common';
import { TransactionManager } from './TransactionManager/TransactionManager';

@Global()
@Module({
  providers: [TransactionManager],
  exports: [TransactionManager]  
})
export class SharedModule {
  static TypeOrmModule: any;
}
