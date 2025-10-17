import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { PaymentEntity } from './payment.entity';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/create-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
// Referencias a actions eliminadas - proyecto anterior

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private client: MercadoPagoConfig;
  private preference: Preference;
  private payment: Payment;

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private readonly configService: ApiConfigService,
    // ActionsService eliminado - proyecto anterior
  ) {
    // Initialize MercadoPago client
    this.client = new MercadoPagoConfig({
      accessToken: this.configService.mercadoPagoConfig.accessToken,
    });

    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);
  }

  /**
   * Create a new payment and MercadoPago preference
   */
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      // Create payment record in database
      const payment = this.paymentRepository.create({
        id: `payment-${Date.now()}`,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'ARS',
        description: createPaymentDto.description,
        actionId: createPaymentDto.actionId,
        userId: createPaymentDto.userId,
        status: 'pending',
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // Create MercadoPago preference
      const orderData: CreateOrderDto = {
        title: createPaymentDto.description || 'Payment',
        quantity: 1,
        price: createPaymentDto.amount,
        description: createPaymentDto.description,
      };

      const preference = await this.createMercadoPagoPreference(orderData);

      // Update payment with MercadoPago preference ID
      if (preference.id) {
        savedPayment.mercadopagoPreferenceId = preference.id;
        await this.paymentRepository.save(savedPayment);
      }

      this.logger.log(`Payment created: ${savedPayment.id}`);

      return {
        payment: savedPayment,
        checkoutUrl: preference.init_point,
        sandboxCheckoutUrl: preference.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Create a payment order in MercadoPago (original method)
   */
  async createOrder(orderData: CreateOrderDto, userId?: string) {
    try {
      const preference = await this.createMercadoPagoPreference(orderData);
      
      let actionId: string | undefined;

      // Create payment record in database as PENDING
      const payment = this.paymentRepository.create({
        id: uuidv4(),
        amount: orderData.price,
        currency: 'ARS',
        description: orderData.description || orderData.title,
        status: 'pending',
        mercadopagoPreferenceId: preference.id || undefined,
        externalReference: preference.external_reference,
        userId: userId || undefined,
        actionId: actionId,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // If actionType is VEHICLE_INFORM, create the action and link it to the payment
      // if (orderData.actionType === ActionType.VEHICLE_INFORM && userId) {
      //   const action = await this.createVehicleInformAction(userId, orderData, savedPayment.id);
      //   actionId = action.id;
      //   
      //   // Update payment with the action ID
      //   savedPayment.actionId = actionId;
      //   await this.paymentRepository.save(savedPayment);
      //   
      //   this.logger.log(`Vehicle inform action created: ${actionId}, linked to payment: ${savedPayment.id}`);
      // }

      this.logger.log(`Order created with payment ID: ${savedPayment.id}`);

      return {
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        paymentId: savedPayment.id,
        actionId: actionId,
      };
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Create a Vehicle inform action
   */
  // private async createVehicleInformAction(userId: string, orderData: CreateOrderDto, paymentId: string) {
  //   const createActionDto: CreateActionDto = {
  //     action: ActionType.VEHICLE_INFORM,
  //     data: [{
  //       type: orderData.vehicleInformType || VehicleInformTypes.LITE,
  //     }],
  //     status: 'TO_DO', 
  //     description: orderData.description || orderData.title,
  //     payment_status: ActionPaymentStatus.PENDING, 
  //     comments: `Payment created for VEHICLE INFORM ${orderData.vehicleInformType || 'LITE'} - Amount: $${orderData.price}`,
  //     user_docs: [],
  //     admin_docs: [],
  //     car_id: orderData.carId || '', 
  //     user_id: userId,
  //     payment_id: paymentId, 
  //   };

  // ActionsService eliminado - proyecto anterior
  // }

  /**
   * Create a payment preference in MercadoPago
   */
  private async createMercadoPagoPreference(orderData: CreateOrderDto) {
    try {
      const webhookUrl = this.configService.mercadoPagoConfig.webhookUrl;

      // Generate unique external reference for this payment
      const externalRef = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const body = {
        items: [
          {
            id: uuidv4(),
            title: orderData.title,
            quantity: orderData.quantity,
            unit_price: orderData.price,
            currency_id: 'ARS', 
            description: orderData.description || orderData.title,
          },
        ],
        external_reference: externalRef, 
        back_urls: {
          success: `${webhookUrl.replace('/webhook', '/success')}`,
          failure: `${webhookUrl.replace('/webhook', '/failure')}`,
          pending: `${webhookUrl.replace('/webhook', '/pending')}`,
        },
        auto_return: 'approved',
        notification_url: webhookUrl,
      };

      this.logger.log('Creating MercadoPago preference with body:', JSON.stringify(body));

      const response = await this.preference.create({ body });

      this.logger.log('MercadoPago preference created:', response.id);

      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        external_reference: externalRef, // Return external reference for storage
      };
    } catch (error) {
      this.logger.error('Error creating MercadoPago preference:', error);
      throw error;
    }
  }

  /**
   * Process webhook notification from MercadoPago
   */
  async processWebhook(webhookData: any) {
    try {
      this.logger.log('=== WEBHOOK DATA COMPLETA ===');
      this.logger.log('WEBHOOK COMPLETO RAW:', JSON.stringify(webhookData, null, 2));

      // Aquí puedes agregar la lógica para procesar el webhook
      // Por ejemplo, actualizar el estado de un pedido en la base de datos
      
      if (webhookData.type === 'payment') {
        this.logger.log(`Payment webhook received:`, JSON.stringify(webhookData.data, null, 2));
        
        // Find payment by preference_id relationship or recent pending payments
        const foundPayment = await this.findPaymentByPreferenceIdOrRecent(webhookData);
        
        if (!foundPayment) {
          this.logger.warn(`Payment not found for webhook data: ${JSON.stringify(webhookData)}`);
          return { status: 'not_found', paymentId: webhookData.data.id };
        }

        // Fetch real payment data from MercadoPago API to get the actual status
        const mpPaymentData = await this.fetchPaymentFromMercadoPago(webhookData.data.id);
        this.logger.log(`Payment ID: ${webhookData.data.id}, Status: ${mpPaymentData.status}, Method: ${mpPaymentData.payment_type}`);
        
        // Update payment status in database using the real status from MercadoPago
        const mpStatus = mpPaymentData.status; // "approved", "rejected", "pending", etc.
        const paymentStatus = mpStatus === 'approved' ? 'paid' : 'pending';
        
        const updateData: UpdatePaymentStatusDto = {
          status: paymentStatus,
          mercadopagoPaymentId: webhookData.data.id,
          paymentMethod: mpPaymentData.payment_type || 'mercadopago',
          mercadopagoData: webhookData,
        };

        const updatedPayment = await this.updatePaymentDirectly(foundPayment, updateData);

        // If payment is associated with an action, update the action's payment status
        // if (updatedPayment.actionId) {
        //   await this.updateActionPaymentStatus(updatedPayment.actionId, ActionPaymentStatus.PAID);
        //   this.logger.log(`Action ${updatedPayment.actionId} payment status updated to PAID`);
        // }

        return {
          status: 'processed',
          paymentId: updatedPayment.id,
          mercadopagoPaymentId: webhookData.data.id,
          actionId: updatedPayment.actionId,
        };
      }

      return {
        status: 'received',
        type: webhookData.type,
      };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw error;
    }
  }

  /**
   * Update payment status from webhook
   */
  async updatePaymentStatus(updateData: UpdatePaymentStatusDto) {
    try {
      const { mercadopagoPaymentId, ...updateFields } = updateData;

      let payment: PaymentEntity;

      if (mercadopagoPaymentId) {
        // Find payment by MercadoPago payment ID
        const foundPayment = await this.paymentRepository.findOne({
          where: { mercadopagoPaymentId },
        });
        
        if (!foundPayment) {
          throw new NotFoundException(`Payment with MercadoPago ID ${mercadopagoPaymentId} not found`);
        }
        
        payment = foundPayment;
      } else {
        throw new Error('MercadoPago payment ID is required');
      }

      // Update payment
      Object.assign(payment, updateFields);
      const updatedPayment = await this.paymentRepository.save(payment);

      this.logger.log(`Payment ${payment.id} updated to status: ${updateData.status}`);

      return updatedPayment;
    } catch (error) {
      this.logger.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string, user?: any): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'action'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // Users can only see their own payments, admins can see any payment
    if (user && user.role !== 'ADMIN' && payment.userId !== user.id) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Get payments by user ID
   */
  async getPaymentsByUserId(userId: string): Promise<PaymentEntity[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['action'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get payments by action ID
   */
  async getPaymentsByActionId(actionId: string, user?: any): Promise<PaymentEntity[]> {
    const query: any = {
      where: { actionId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    };

    // Comentario eliminado - proyecto anterior
    if (user && user.role !== 'ADMIN') {
      query.where.userId = user.id;
    }

    return this.paymentRepository.find(query);
  }

  /**
   * Find payment by webhook data using preference ID relationship
   */
  private async findPaymentByPreferenceIdOrRecent(webhookData: any): Promise<PaymentEntity | null> {
    try {
      // First try to find by mercadopago_payment_id if it exists
      let payment = await this.paymentRepository.findOne({
        where: { mercadopagoPaymentId: webhookData.data.id },
      });

      if (payment) {
        return payment;
      }

      // ✅ SECURE APPROACH: Query MercadoPago API to get external_reference
      // Why this is more secure:
      // 1. Webhook only contains payment_id, not external_reference
      // 2. We query MercadoPago API to get full payment data including external_reference
      // 3. We stored the external_reference when creating the preference
      // 4. This creates a secure link between webhook and our database record
      try {
        const mpPaymentData = await this.fetchPaymentFromMercadoPago(webhookData.data.id);
        
        if (mpPaymentData.external_reference) {
          // Find payment by external reference (most secure)
          const paymentByRef = await this.paymentRepository.findOne({
            where: { externalReference: mpPaymentData.external_reference },
          });

          if (paymentByRef) {
            this.logger.log(`✅ Found payment by external_reference: ${paymentByRef.id}`);
            return paymentByRef;
          }

          this.logger.log(`No payment found with external_reference: ${mpPaymentData.external_reference}`);
        }

        // Fallback: find by preference_id if available
        if (mpPaymentData.preference_id) {
          const paymentByPref = await this.paymentRepository.findOne({
            where: { mercadopagoPreferenceId: mpPaymentData.preference_id },
          });

          if (paymentByPref) {
            this.logger.log(`Found payment by preference_id: ${paymentByPref.id}`);
            return paymentByPref;
          }
        }

      } catch (mpError) {
        this.logger.warn(`Failed to fetch payment data from MercadoPago: ${mpError.message}`);
      }

      // Last resort: warn about unsafe fallback
      this.logger.warn(`⚠️ UNSAFE FALLBACK: Using most recent pending payment`);
      const recentPayments = await this.paymentRepository.find({
        where: {
          mercadopagoPaymentId: IsNull(),
          status: 'pending'
        },
        order: { createdAt: 'DESC' },
        take: 1
      });

      if (recentPayments.length > 0) {
        const mostRecentPayment = recentPayments[0];
        this.logger.log(`⚠️ Using most recent pending payment: ${mostRecentPayment.id} for webhook payment: ${webhookData.data.id}`);
        return mostRecentPayment;
      }

      this.logger.log(`No payment found for webhook payment: ${webhookData.data.id}`);
      return null;
    } catch (error) {
      this.logger.error('Error finding payment by webhook data:', error);
      return null;
    }
  }

  /**
   * Update payment directly using the found payment entity
   */
  private async updatePaymentDirectly(payment: PaymentEntity, updateData: UpdatePaymentStatusDto): Promise<PaymentEntity> {
    try {
      const { mercadopagoPaymentId, ...updateFields } = updateData;

      // Update payment fields
      Object.assign(payment, updateFields);

      // Set mercadopago payment id
      if (mercadopagoPaymentId) {
        payment.mercadopagoPaymentId = mercadopagoPaymentId;
      }

      const updatedPayment = await this.paymentRepository.save(payment);
      
      this.logger.log(`Payment ${payment.id} updated successfully`);
      this.logger.log(`Payment status: ${updateData.status}`);
      this.logger.log(`Payment method: ${updateData.paymentMethod}`);
      
      return updatedPayment;
    } catch (error) {
      this.logger.error('Error updating payment directly:', error);
      throw error;
    }
  }

  /**
   * Fetch payment data from MercadoPago API
   */
  private async fetchPaymentFromMercadoPago(paymentId: string) {
    try {
      const paymentData = await this.payment.get({ id: paymentId });
      
      this.logger.log(`MercadoPago payment data:`, {
        id: paymentData?.id,
        external_reference: paymentData?.external_reference,
        preference_id: (paymentData as any)?.preference_id,
        status: paymentData?.status,
        payment_type: paymentData?.payment_type_id
      });
      
      return {
        external_reference: paymentData?.external_reference,
        preference_id: (paymentData as any)?.preference_id,
        status: paymentData?.status,
        payment_type: paymentData?.payment_type_id
      };
    } catch (error) {
      this.logger.error(`Error fetching payment ${paymentId} from MercadoPago:`, error);
      throw error;
    }
  }

  /**
   * Update action payment status
   */
  // private async updateActionPaymentStatus(actionId: string, paymentStatus: ActionPaymentStatus) {
  //   try {
  //     this.logger.log(`Updating action ${actionId} payment status to ${paymentStatus}`);
  //     
  // ActionsService eliminado - proyecto anterior
  //     
  //     this.logger.log(`✅ Action ${actionId} payment status successfully updated to ${paymentStatus}`);
  //   } catch (error) {
  //     this.logger.error('Error updating action payment status:', error);
  //     throw error;
  //   }
  // }
}

