import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Document } from './Entities/document.entity';
import * as crypto from 'crypto';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import * as archiver from 'archiver';
import { Response } from 'express';

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

  async uploadFiles(files: Express.Multer.File[], activiteId?: number, serviceId?: number): Promise<Document[]> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const uploadedDocuments: Document[] = [];

      for (const file of files) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-ctr', this.cryptoSecretKey, iv);
        const encryptedData = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

        const newDocument = this.documentRepository.create({
          activite: activiteId ? { id: activiteId } : undefined,
          service: serviceId ? { id: serviceId } : undefined,
          titre: file.originalname,
          mimetype: file.mimetype,
          iv: iv.toString('hex'),
          encrypted_data: encryptedData,
        });

        const savedDocument = await manager.save(Document, newDocument);
        uploadedDocuments.push(savedDocument);
      }

      return uploadedDocuments;
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

  async getDocumentsByActiviteId(activiteId: number): Promise<Document[]> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.find(Document, { where: { activite: { id: activiteId } } });
    });
  }

  async getDocumentsByServiceId(serviceId: number): Promise<Document[]> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.find(Document, { where: { service: { id: serviceId } } });
    });
  }

  async downloadFilesByActiviteId(activiteId: number, res: Response) {
    const documents = await this.getDocumentsByActiviteId(activiteId);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="documents_${activiteId}.zip"`);

    archive.pipe(res);

    for (const document of documents) {
      const decipher = crypto.createDecipheriv('aes-256-ctr', this.cryptoSecretKey, Buffer.from(document.iv, 'hex'));
      const decryptedData = Buffer.concat([decipher.update(document.encrypted_data), decipher.final()]);

      archive.append(decryptedData, { name: document.titre });
    }

    await archive.finalize();
  }

  async downloadFilesByServiceId(serviceId: number, res: Response) {
    const documents = await this.getDocumentsByServiceId(serviceId);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="documents_${serviceId}.zip"`);

    archive.pipe(res);

    for (const document of documents) {
      const decipher = crypto.createDecipheriv('aes-256-ctr', this.cryptoSecretKey, Buffer.from(document.iv, 'hex'));
      const decryptedData = Buffer.concat([decipher.update(document.encrypted_data), decipher.final()]);

      archive.append(decryptedData, { name: document.titre });
    }

    await archive.finalize();
  }

  async deleteFile(documentId: number): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const document = await manager.findOne(Document, { where: { id: documentId } });
      if (!document) {
        throw new NotFoundException('Document not found');
      }
      await manager.remove(Document, document);
    });
  }
}
