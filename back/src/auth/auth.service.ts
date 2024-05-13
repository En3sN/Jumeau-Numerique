import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { User } from '../Entity/user.entity';
import { TransactionManager } from '../Shared/TransactionManager/TransactionManager';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private transactionManager: TransactionManager
  ) { }

  async validateUser(pseudo: string, pass: string): Promise<any> {
    const user = await this.dataSource.getRepository(User).findOne({ where: { pseudo: pseudo, activated: true } });
    if (user && user.pwd === pass) {
      return await this.transactionManager.executeInTransaction(async manager => {
        const sessionCode = await this.getUserSessionCode(manager, user.pseudo, user.pwd);
        return { ...user, sessionCode };
      });
    } else {
      console.log("No user found or password mismatch in AuthService");
      return null;
    }
  }

  async login(user: any) {
    const payload = { sessionCode: user.sessionCode };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async getUserSessionCode(manager: any, pseudo: string, password: string): Promise<string> {
    const query = `SELECT security.get_user_code($1, $2) AS session_code`;
    const params = [pseudo, password];
    const result = await manager.query(query, params);
    return result[0].session_code;
  }
}
