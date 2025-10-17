import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpStatus,
  Logger,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { PublicRoute } from '../../decorators/public-route.decorator';
import { Auth } from '../../decorators/http.decorators';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { RoleType } from '../../constants/role-type';
import { UserDto } from '../user/dto/user.dto';
import { ApiConfigService } from '../../shared/services/api-config.service';

@Controller('payments')
@ApiTags('Payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ApiConfigService,
  ) {}

  @Post('create')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPayment(@AuthUser() user: UserDto, @Body() createPaymentDto: CreatePaymentDto) {
    try {
      // Add the authenticated user ID to the payment
      const paymentData = {
        ...createPaymentDto,
        userId: user.id,
      };
      
      const result = await this.paymentsService.createPayment(paymentData);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error creating payment:', error);
      throw error;
    }
  }

  @Post('create-order')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @ApiOperation({ summary: 'Create a payment order in MercadoPago' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrder(@AuthUser() user: UserDto, @Body() createOrderDto: CreateOrderDto) {
    try {
      const result = await this.paymentsService.createOrder(createOrderDto, user.id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  @Get(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@AuthUser() user: UserDto, @Param('id') id: string) {
    try {
      const payment = await this.paymentsService.getPaymentById(id, user);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      this.logger.error('Error getting payment:', error);
      throw error;
    }
  }

  @Get('user/:userId')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @ApiOperation({ summary: 'Get payments by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
  })
  async getPaymentsByUser(@AuthUser() user: UserDto, @Param('userId') userId: string) {
    try {
      // Users can only see their own payments, admins can see any user's payments
      if (user.role !== RoleType.ADMIN && user.id !== userId) {
        throw new Error('Unauthorized: You can only view your own payments');
      }
      
      const payments = await this.paymentsService.getPaymentsByUserId(userId);
      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      this.logger.error('Error getting payments by user:', error);
      throw error;
    }
  }

  @Get('action/:actionId')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @ApiOperation({ summary: 'Get payments by action ID' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
  })
  async getPaymentsByAction(@AuthUser() user: UserDto, @Param('actionId') actionId: string) {
    try {
      const payments = await this.paymentsService.getPaymentsByActionId(actionId, user);
      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      this.logger.error('Error getting payments by action:', error);
      throw error;
    }
  }

  @Post('webhook')
  @PublicRoute() 
  @ApiOperation({ summary: 'Receive webhook notifications from MercadoPago' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async receiveWebhook(@Body() webhookData: any, @Res() res: Response) {
    try {
      this.logger.log('Webhook received');
      
      const result = await this.paymentsService.processWebhook(webhookData);
      
      return res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Error processing webhook',
      });
    }
  }

  @Get('success')
  @PublicRoute() 
  @ApiOperation({ summary: 'Success callback from MercadoPago - redirects to frontend' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend success page' })
  success(@Res() res: Response) {
    this.logger.log('Payment successful - redirecting to frontend');
    const frontendUrl = this.configService.frontendUrl;
    return res.redirect(`${frontendUrl}/payments/success`);
  }

  @Get('pending')
  @PublicRoute() 
  @ApiOperation({ summary: 'Pending callback from MercadoPago - redirects to frontend' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend pending page' })
  pending(@Res() res: Response) {
    this.logger.log('Payment pending - redirecting to frontend');
    const frontendUrl = this.configService.frontendUrl;
    return res.redirect(`${frontendUrl}/payments/pending`);
  }

  @Get('failure')
  @PublicRoute() 
  @ApiOperation({ summary: 'Failure callback from MercadoPago - redirects to frontend' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend failure page' })
  failure(@Res() res: Response) {
    this.logger.log('Payment failed - redirecting to frontend');
    const frontendUrl = this.configService.frontendUrl;
    return res.redirect(`${frontendUrl}/payments/failure`);
  }
}

