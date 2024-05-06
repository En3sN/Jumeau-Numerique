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
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // Vérifie d'abord l'utilisateur sans aucune transaction spécifique à l'utilisateur
    const user = await this.dataSource.getRepository(User).findOne({ where: { email: email, activated: true } });
    if (user && user.pwd === pass) {
      // L'utilisateur est validé, exécutez maintenant des opérations dans une transaction avec user.id
      return await this.transactionManager.executeInTransaction(async manager => {
        console.log("User validated, proceeding with user-specific transaction:", user.id);
        const { pwd, ...result } = user;
        return result;
      }, user.id.toString());  // Passe user.id comme argument pour la transaction
    } else {
      console.log("No user found or password mismatch in AuthService");
      return null;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }  
}
