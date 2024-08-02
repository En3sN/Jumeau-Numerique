import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TypeCreneau } from './Entities/type-creneau.entity';

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

  async getJsonRdvCreneaux(activiteId: number, semaine: number, year: number, duree: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.query(
        `SELECT planning.get_json_rdv_creneaux($1, $2, $3, $4) AS result`,
        [activiteId, semaine, year, duree]
      );
      return result[0].result;
    } finally {
      await queryRunner.release();
    }
  }

  async getRdvPlages(activiteId: number, semaine: number, year: number, duree: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.query(
        `SELECT * FROM planning.get_rdv_plages($1, $2, $3, $4)`,
        [activiteId, semaine, year, duree]
      );
      return result;
    } finally {
      await queryRunner.release();
    }
  }

  async getIntervals(listDate: string[]): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.query(
        `SELECT * FROM planning.get_intervals($1::timestamp[])`,
        [listDate]
      );
      return result;
    } finally {
      await queryRunner.release();
    }
  }

  async getIntervalWithException(dDeb: string, dFin: string, activiteId: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.query(
        `SELECT * FROM planning.get_intervalwithexception($1, $2, $3)`,
        [dDeb, dFin, activiteId]
      );
      return result;
    } finally {
      await queryRunner.release();
    }
  }

  async getIntervalWithoutRdv(dDeb: string, dFin: string, activiteId: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.query(
        `SELECT * FROM planning.get_intervalwithoutrdv($1, $2, $3)`,
        [dDeb, dFin, activiteId]
      );
      return result;
    } finally {
      await queryRunner.release();
    }
  }

  async getRecurentFroWeek(dDeb: string, dFin: string, week: number, year: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.query(
        `SELECT * FROM planning.get_recurentfroweek($1, $2, $3, $4)`,
        [dDeb, dFin, week, year]
      );
      return result;
    } finally {
      await queryRunner.release();
    }
  }
}
