import AlipaySdk from 'alipay-sdk';
import AlipayFormData from 'alipay-sdk/lib/form';
import { PaymentProvider } from './index';

export class AlipayProvider implements PaymentProvider {
  private alipay: AlipaySdk;

  constructor() {
    this.alipay = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID!,
      privateKey: process.env.ALIPAY_PRIVATE_KEY!,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipaydev.com/gateway.do',
    });
  }

  async createOrder(params: {
    orderId: string;
    amount: number;
    subject: string;
    description?: string;
  }) {
    const formData = new AlipayFormData();
    formData.setMethod('get');
    formData.addField('notifyUrl', `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/alipay/notify`);
    formData.addField('returnUrl', `${process.env.NEXT_PUBLIC_APP_URL}/wallet?status=success`);
    formData.addField('bizContent', {
      outTradeNo: params.orderId,
      totalAmount: params.amount.toFixed(2),
      subject: params.subject,
      body: params.description || params.subject,
    });

    const result = await this.alipay.exec('alipay.trade.precreate', formData);

    if (result.code === '10000') {
      return {
        paymentUrl: result.qrCode, // 二维码链接，前端生成二维码
        orderId: params.orderId,
      };
    } else {
      throw new Error(result.subMsg || '创建支付订单失败');
    }
  }

  async verifyPayment(orderId: string) {
    const formData = new AlipayFormData();
    formData.setMethod('get');
    formData.addField('bizContent', {
      outTradeNo: orderId,
    });

    const result = await this.alipay.exec('alipay.trade.query', formData);

    return {
      success: result.code === '10000',
      paid: result.tradeStatus === 'TRADE_SUCCESS' || result.tradeStatus === 'TRADE_FINISHED',
      amount: result.totalAmount ? parseFloat(result.totalAmount) : undefined,
    };
  }

  async processCallback(data: any) {
    // 验证签名
    const signValid = this.alipay.checkNotifySign(data);
    if (!signValid) {
      throw new Error('签名验证失败');
    }

    return {
      orderId: data.out_trade_no,
      success: data.trade_status === 'TRADE_SUCCESS',
      amount: parseFloat(data.total_amount),
    };
  }

  async refund(params: { orderId: string; amount: number; reason?: string }) {
    const formData = new AlipayFormData();
    formData.setMethod('get');
    formData.addField('bizContent', {
      outTradeNo: params.orderId,
      refundAmount: params.amount.toFixed(2),
      refundReason: params.reason || '用户申请退款',
    });

    const result = await this.alipay.exec('alipay.trade.refund', formData);

    return {
      success: result.code === '10000' && result.fundChange === 'Y',
      refundId: result.tradeNo,
    };
  }
}
