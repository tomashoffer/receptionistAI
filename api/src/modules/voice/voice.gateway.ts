import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { JwtService } from '@nestjs/jwt';
import { ApiConfigService } from '../../shared/services/api-config.service';

@WebSocketGateway({
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/voice',
})
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VoiceGateway.name);
  private connectedClients = new Map<string, Socket>();

  constructor(
    private readonly voiceService: VoiceService,
    private readonly jwtService: JwtService,
    private readonly configService: ApiConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Verificar autenticación
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.authConfig.privateKey,
        });
        
        client.data.userId = payload.userId;
        client.data.role = payload.role;
        this.connectedClients.set(client.id, client);
        
        this.logger.log(`Cliente conectado: ${client.id} (Usuario: ${payload.userId})`);
        
        // Enviar confirmación de conexión
        client.emit('connected', {
          message: 'Conectado al servicio de voz',
          sessionId: client.id,
        });
      } else {
        this.logger.warn(`Cliente sin token: ${client.id}`);
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`Error en conexión: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('voice_audio')
  async handleVoiceAudio(
    @MessageBody() data: { audio: Buffer; sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Audio recibido de ${client.id}, sesión: ${data.sessionId}`);
      
      // Procesar audio con el servicio de voz
      const result = await this.voiceService.processVoiceCommand(
        data.audio,
        `audio_${Date.now()}.webm`,
        data.sessionId,
      );

      // Enviar respuesta al cliente
      client.emit('voice_response', result);

      // Si hay una respuesta de texto, generar audio con ElevenLabs
      if (result.response) {
        try {
          const audioBuffer = await this.voiceService.generateSpeechWithElevenLabs(result.response);
          
          // Enviar audio al cliente
          client.emit('voice_audio_response', {
            audio: audioBuffer.toString('base64'),
            text: result.response,
            sessionId: data.sessionId,
          });
        } catch (error) {
          this.logger.error('Error generando audio con ElevenLabs:', error);
          // Fallback a notificación de texto
          client.emit('voice_ended', { sessionId: data.sessionId });
        }
      }
    } catch (error) {
      this.logger.error(`Error procesando audio: ${error.message}`);
      client.emit('error', {
        message: 'Error procesando audio',
        sessionId: data.sessionId,
      });
    }
  }

  @SubscribeMessage('text_message')
  async handleTextMessage(
    @MessageBody() data: { text: string; sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Mensaje de texto recibido: ${data.text}`);
      
      // Procesar texto con el servicio de voz
      const result = await this.voiceService.processTextCommand({
        text: data.text,
        sessionId: data.sessionId,
      });

      // Enviar respuesta al cliente
      client.emit('voice_response', result);

      // Generar audio con ElevenLabs
      if (result.response) {
        try {
          const audioBuffer = await this.voiceService.generateSpeechWithElevenLabs(result.response);
          
          client.emit('voice_audio_response', {
            audio: audioBuffer.toString('base64'),
            text: result.response,
            sessionId: data.sessionId,
          });
        } catch (error) {
          this.logger.error('Error generando audio con ElevenLabs:', error);
          client.emit('voice_ended', { sessionId: data.sessionId });
        }
      }
    } catch (error) {
      this.logger.error(`Error procesando texto: ${error.message}`);
      client.emit('error', {
        message: 'Error procesando mensaje',
        sessionId: data.sessionId,
      });
    }
  }

  @SubscribeMessage('end_conversation')
  async handleEndConversation(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Conversación terminada: ${data.sessionId}`);
    client.emit('conversation_ended', { sessionId: data.sessionId });
  }
}
