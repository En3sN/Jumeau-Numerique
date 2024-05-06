import { Module } from '@nestjs/common';
import { TransactionManager } from './TransactionManager/TransactionManager';

@Module({
  providers: [TransactionManager],
  exports: [TransactionManager]  
})
export class SharedModule {}
