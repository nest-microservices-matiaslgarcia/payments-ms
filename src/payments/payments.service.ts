import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import Stripe from 'stripe';
import { envs } from 'src/config';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

  private readonly stripe = new Stripe(
    envs.stripeSecret
  )

  async createPaymentSession(createPaymentDto: CreatePaymentDto) {

    try {

      const { currency, items, orderId } = createPaymentDto

      const lineItems = items.map(item => {
        return {
          price_data: {
            currency,
            product_data: {
              name: item.name
            },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: item.quantity
        }
      })
      const session = await this.stripe.checkout.sessions.create({
        payment_intent_data: {
          metadata: {
            orderId: orderId
          }
        },
        line_items: lineItems,
        mode: 'payment',
        success_url: envs.stripeSuccess,
        cancel_url: envs.stripeCancel
      })

      return session
    } catch (error) {

    }
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event
    const endpointSecret = envs.webhookSecret

    try {
      event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret)
      
      switch(event.type){
        case 'charge.succeeded':
          console.log({
            metadata: event.data.object,
            orderId: event.data.object.metadata.orderId
          })  
        break
        default:
          console.log(`Event ${event.type} not handled`)  
      }
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return
    }
    return res.status(200).json({ sig })
  }

}
