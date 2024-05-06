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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.dataSource.getRepository(User).findOne({ where: { email: email, activated: true } });
    if (user && user.pwd === pass) {
      return await this.transactionManager.executeInTransaction(async manager => {
        console.log("User validated, proceeding with user-specific transaction:", user.id);
        const sessionCode = await this.getUserSessionCode(manager, user.nom, user.pwd);
        return { ...user, sessionCode };
      }, user.id.toString());
    } else {
      console.log("No user found or password mismatch in AuthService");
      return null;
    }
  }
  async login(user: any) {
    if (!user.sessionCode) {
      throw new Error('Session code is missing in the user object');
    }
    const payload = { sessionCode: user.sessionCode };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  private async getUserSessionCode(manager: any, username: string, password: string): Promise<string> {
    const query = `SELECT security.get_user_code($1, $2) AS session_code`;
    const params = [username, password];
    const result = await manager.query(query, params);
    return result[0].session_code;
  }
}
