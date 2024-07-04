import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Document } from './entities/document.entity';
import * as crypto from 'crypto';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private readonly cryptoSecretKey: Buffer;

  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    this.cryptoSecretKey = Buffer.from(this.configService.get<string>('CRYPTO_SECRET_KEY'), 'hex');
    if (this.cryptoSecretKey.length !== 32) {
      throw new Error('Invalid key length. CRYPTO_SECRET_KEY must be a 32-byte key.');
    }
  }

  async uploadFile(file: Express.Multer.File, activiteId: number): Promise<Document> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-ctr', this.cryptoSecretKey, iv);
      const encrypted_data = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

      const newDocument = this.documentRepository.create({
        activite: { id: activiteId },
        titre: file.originalname,
        mimetype: file.mimetype,
        iv: iv.toString('hex'),
        encrypted_data,
      });

      return manager.save(Document, newDocument);
    });
  }

  async downloadFile(documentId: number): Promise<{ document: Document, decryptedData: Buffer }> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const document = await manager.findOne(Document, { where: { id: documentId } });
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      const decipher = crypto.createDecipheriv('aes-256-ctr', this.cryptoSecretKey, Buffer.from(document.iv, 'hex'));
      const decryptedData = Buffer.concat([decipher.update(document.encrypted_data), decipher.final()]);

      return { document, decryptedData };
    });
  }
}
