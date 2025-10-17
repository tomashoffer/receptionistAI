import { Controller, Post, Body, Get, UseInterceptors, UploadedFile, BadRequestException, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { VoiceService } from './voice.service';
import { ProcessVoiceDto, VoiceResponseDto, VoiceStatusDto } from './dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { UseGuards } from '@nestjs/common';

@ApiTags('voice')
@Controller('voice')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('process')
  @UseInterceptors(FileInterceptor('audio', {
    // Usar memoria en lugar de disco para tener acceso al buffer
    storage: undefined, // Esto hace que use memoria por defecto
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(wav|mp3|m4a|ogg|webm)$/)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Solo se permiten archivos de audio (wav, mp3, m4a, ogg, webm)'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  @ApiOperation({ summary: 'Procesar comando de voz desde archivo de audio' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Comando procesado exitosamente', type: VoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Archivo de audio inválido' })
  async processVoiceCommand(
    @UploadedFile() file: Express.Multer.File,
    @Query('sessionId') sessionId?: string,
    @AuthUser() user?: any,
  ) {
    console.log('📁 Received file:', { 
      filename: file?.filename, 
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      hasBuffer: !!file?.buffer,
      bufferLength: file?.buffer?.length 
    });

    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de audio');
    }

    if (!file.buffer) {
      throw new BadRequestException('El archivo de audio no contiene datos válidos');
    }

    // Generar un filename único para el procesamiento
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(7)}${extname(file.originalname)}`;
    
    return this.voiceService.processVoiceCommand(file.buffer, uniqueFilename, sessionId);
  }

  @Post('process-text')
  @ApiOperation({ summary: 'Procesar comando de voz desde texto (para testing)' })
  @ApiResponse({ status: 200, description: 'Comando procesado exitosamente', type: VoiceResponseDto })
  async processTextCommand(
    @Body() processVoiceDto: ProcessVoiceDto,
    @AuthUser() user?: any,
  ) {
    return this.voiceService.processTextCommand(processVoiceDto);
  }

  @Post('speak')
  @ApiOperation({ summary: 'Generar audio de texto usando OpenAI TTS' })
  @ApiResponse({ status: 200, description: 'Audio generado exitosamente' })
  async speak(@Body() body: { text: string }, @Res() res: any) {
    const audioBuffer = await this.voiceService.generateSpeech(body.text);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
    });
    
    res.send(audioBuffer);
  }

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado del servicio de voz' })
  @ApiResponse({ status: 200, description: 'Estado del servicio', type: VoiceStatusDto })
  async getStatus() {
    return this.voiceService.getStatus();
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtener historial de interacciones de voz' })
  @ApiResponse({ status: 200, description: 'Historial de interacciones' })
  async getInteractionHistory(
    @Query('sessionId') sessionId?: string,
    @AuthUser() user?: any,
  ) {
    return this.voiceService.getInteractionHistory(sessionId);
  }
}

