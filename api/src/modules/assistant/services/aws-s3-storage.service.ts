import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

@Injectable()
export class AwsS3StorageService {
  private readonly logger = new Logger(AwsS3StorageService.name);
  private s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get('AWS_REGION') || 'us-east-1';
    this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME') || 'receptionistai-knowledge-files';

    // Obtener credenciales y limpiar espacios en blanco (común problema)
    let accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID') || '';
    let secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY') || '';
    
    // Limpiar espacios en blanco al inicio y final (problema común)
    accessKeyId = accessKeyId.trim();
    secretAccessKey = secretAccessKey.trim();

    // Logs de depuración (sin mostrar el secret completo)
    this.logger.log(`🔍 AWS S3 Config - Region: ${this.region}, Bucket: ${this.bucketName}`);
    this.logger.log(`🔍 AWS Access Key ID: ${accessKeyId ? `${accessKeyId.substring(0, 8)}...` : 'NO CONFIGURADO'}`);
    this.logger.log(`🔍 AWS Secret Access Key: ${secretAccessKey ? '***' + secretAccessKey.substring(secretAccessKey.length - 4) : 'NO CONFIGURADO'}`);
    this.logger.log(`🔍 AWS Access Key ID length: ${accessKeyId.length} (debe ser 20)`);
    this.logger.log(`🔍 AWS Secret Access Key length: ${secretAccessKey.length} (debe ser 40)`);

    if (!accessKeyId || !secretAccessKey) {
      this.logger.error(`❌ AWS S3 credentials no configuradas. Las operaciones de S3 fallarán.`);
      this.logger.error(`❌ Configura AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en las variables de entorno.`);
      this.logger.error(`❌ Verifica que el archivo .env esté en la raíz del proyecto y que Docker Compose lo esté leyendo.`);
    } else {
      // Validar formato básico de las credenciales
      if (accessKeyId.length !== 20) {
        this.logger.warn(`⚠️ AWS_ACCESS_KEY_ID tiene longitud incorrecta (${accessKeyId.length}), debería ser 20 caracteres`);
      }
      if (secretAccessKey.length !== 40) {
        this.logger.warn(`⚠️ AWS_SECRET_ACCESS_KEY tiene longitud incorrecta (${secretAccessKey.length}), debería ser 40 caracteres`);
      }
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(`✅ AWS S3 inicializado - Bucket: ${this.bucketName}, Region: ${this.region}`);
  }

  /**
   * Genera la ruta S3 para un archivo de knowledge base
   * Estructura: archivos/{businessId}/{filename}
   */
  private getS3Key(businessId: string, filename: string): string {
    const businessIdClean = businessId.replace(/[^a-zA-Z0-9-]/g, '-');
    return `archivos/${businessIdClean}/${filename}`;
  }

  /**
   * Verifica si un archivo existe en S3
   */
  async fileExists(s3Key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        })
      );
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Sube un archivo a S3
   */
  async uploadFile(
    businessId: string,
    filename: string,
    content: string | Buffer,
    contentType: string = 'text/markdown'
  ): Promise<string> {
    try {
      const s3Key = this.getS3Key(businessId, filename);
      const body = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: body,
          ContentType: contentType,
          Metadata: {
            businessId,
            filename,
            uploadedAt: new Date().toISOString(),
          },
        })
      );

      this.logger.log(`✅ Archivo subido a S3: ${s3Key}`);
      return s3Key;
    } catch (error) {
      this.logger.error(`Error subiendo archivo ${filename} a S3:`, error);
      throw error;
    }
  }

  /**
   * Sube un archivo desde una ruta local a S3
   */
  async uploadFileFromPath(
    businessId: string,
    filename: string,
    filePath: string,
    contentType: string = 'text/markdown'
  ): Promise<string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    return await this.uploadFile(businessId, filename, content, contentType);
  }

  /**
   * Descarga un archivo de S3
   */
  async downloadFile(s3Key: string): Promise<Buffer> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        })
      );

      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(`Error descargando archivo ${s3Key} de S3:`, error);
      throw error;
    }
  }

  /**
   * Elimina un archivo de S3
   */
  async deleteFile(s3Key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        })
      );

      this.logger.log(`✅ Archivo eliminado de S3: ${s3Key}`);
    } catch (error) {
      this.logger.error(`Error eliminando archivo ${s3Key} de S3:`, error);
      throw error;
    }
  }

  /**
   * Busca o crea un archivo en S3 (upsert)
   * Si existe, lo actualiza. Si no, lo crea.
   * Retorna el s3Key
   */
  async findOrCreateFile(
    businessId: string,
    filename: string,
    content: string | Buffer,
    contentType: string = 'text/markdown'
  ): Promise<string> {
    const s3Key = this.getS3Key(businessId, filename);
    const exists = await this.fileExists(s3Key);

    if (exists) {
      // Actualizar archivo existente (S3 sobrescribe automáticamente)
      this.logger.log(`Archivo existe en S3, actualizando: ${s3Key}`);
    } else {
      this.logger.log(`Archivo no existe en S3, creando: ${s3Key}`);
    }

    // Subir/actualizar archivo
    await this.uploadFile(businessId, filename, content, contentType);
    return s3Key;
  }

  /**
   * Obtiene la URL pública del archivo (si el bucket es público)
   * O genera una URL pre-firmada temporal
   */
  getFileUrl(s3Key: string, expiresIn: number = 3600): string {
    // Si el bucket es público, retornar URL directa
    const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;
    
    // Nota: Para URLs pre-firmadas, usar getSignedUrl de @aws-sdk/s3-request-presigner
    // Por ahora retornamos la URL pública si el bucket lo permite
    return publicUrl;
  }
}

