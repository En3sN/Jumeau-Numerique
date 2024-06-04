import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { Utilisateur } from '../utilisateur/Entities/utilisateur.entity';
import { TransactionManager } from '../Shared/TransactionManager/TransactionManager';
import * as bcrypt from 'bcrypt';
import { format } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private transactionManager: TransactionManager
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.dataSource.getRepository(Utilisateur).findOne({ where: { email: email, activated: true } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.pwd);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.transactionManager.executeInTransaction(async manager => {
      const sessionCode = await this.getUserSessionCode(manager, user.email, user.pwd);
      return { ...user, sessionCode };
    });
  }
  
  async login(user: any) {
    const payload = {
      id: user.id,
      sessionCode: user.sessionCode,
      issuedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async getUserSessionCode(manager: any, email: string, password: string): Promise<string> {
    const query = `SELECT security.get_user_code($1, $2) AS session_code`;
    const params = [email, password];
    const result = await manager.query(query, params);
    return result[0].session_code;
  }
}
