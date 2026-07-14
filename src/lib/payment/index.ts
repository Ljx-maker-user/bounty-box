import { AlipayProvider } from './alipay-provider';
// import { WechatProvider } from './wechat-provider';

export interface PaymentProvider {
  createOrder(params: {
    orderId: string;
    amount: number;
    subject: string;
    description?: string;
  }): Promise<{ paymentUrl: string; orderId: string }>;

  verifyPayment(orderId: string): Promise<{
    success: boolean;
    paid: boolean;
    amount?: number;
  }>;

  processCallback(data: any): Promise<{
    orderId: string;
    success: boolean;
    amount: number;
  }>;

  refund(params: {
    orderId: string;
    amount: number;
    reason?: string;
  }): Promise<{ success: boolean; refundId?: string }>;
}

class MockPaymentProvider implements PaymentProvider {
  private orders: Map<string, { paid: boolean; amount: number }> = new Map();

  async createOrder(params: { orderId: string; amount: number; subject: string }) {
    this.orders.set(params.orderId, { paid: false, amount: params.amount });
    return {
      paymentUrl: `/mock-payment/${params.orderId}?amount=${params.amount}`,
      orderId: params.orderId,
    };
  }

  async verifyPayment(orderId: string) {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, paid: false };
    return { success: true, paid: order.paid, amount: order.amount };
  }

  async processCallback(data: any) {
    const order = this.orders.get(data.orderId);
    if (!order) throw new Error('Order not found');
    order.paid = true;
    return { orderId: data.orderId, success: true, amount: data.amount };
  }

  async refund(params: { orderId: string; amount: number }) {
    this.orders.delete(params.orderId);
    return { success: true, refundId: `refund_${params.orderId}` };
  }
}

let provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;
  const type = process.env.PAYMENT_PROVIDER || 'mock';
  
  switch (type) {
    case 'alipay':
      provider = new AlipayProvider();
      return provider;
    case 'wechat':
      // provider = new WechatProvider();
      // return provider;
      throw new Error('WeChat provider not yet implemented');
    case 'mock':
    default:
      provider = new MockPaymentProvider();
      return provider;
  }
}
