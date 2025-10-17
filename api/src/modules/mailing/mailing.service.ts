import { Injectable } from '@nestjs/common';
import { EmailOptions } from './mailing-types';
import { ApiConfigService } from '../../shared/services/api-config.service';
import * as nodemailer from 'nodemailer';


@Injectable()
export class MailingService {
    constructor(
       readonly apiConfigService: ApiConfigService,
    ) {}
 
    

   async sendViaSMTP(emailDetails: EmailOptions) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            logger: true
        } as any);

        const info = await transporter.sendMail({
            from: emailDetails.from || '"PlanYourTrip Support" <noreply@planyourtrip.com>',
            to: emailDetails.to,
            subject: emailDetails.subject,
            text: emailDetails.text,
            html: emailDetails.html,
            bcc: emailDetails.bcc,
        });

        console.log('Correo enviado: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('No se pudo enviar el correo electrónico');
    }
}

    

}