import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TypeCreneau } from './entities/type-creneau.entity';

@Injectable()
export class TypesService {
  constructor(private connection: Connection) {}


  async findAll(): Promise<string[]> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.query(`
        SELECT unnest(enum_range(NULL::planning.type_creneau))::text as type_creneau;
      `);
      return result.map(row => row.type_creneau);
    } finally {
      await queryRunner.release();
    }
  }
}