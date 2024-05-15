import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { Utilisateur } from '../Entity/utilisateur.entity';
import { TransactionManager } from '../Shared/TransactionManager/TransactionManager';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private transactionManager: TransactionManager
  ) { }

  async validateUser(pseudo: string, pass: string): Promise<any> {
    const user = await this.dataSource.getRepository(Utilisateur).findOne({ where: { pseudo: pseudo, activated: true } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.pwd);
    
    if (!isPasswordValid) {
      // If the password is not valid, check if it's an unhashed password
      if (user.pwd === pass) {
        // Hash the unhashed password and update the user record
        const hashedPassword = await bcrypt.hash(pass, 10);
        user.pwd = hashedPassword;
        await this.dataSource.getRepository(Utilisateur).save(user);
      } else {
        console.log("No user found or password mismatch in AuthService");
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    return await this.transactionManager.executeInTransaction(async manager => {
      const sessionCode = await this.getUserSessionCode(manager, user.pseudo, user.pwd);
      return { ...user, sessionCode };
    });
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
