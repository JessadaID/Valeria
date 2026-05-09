import { json } from '@sveltejs/kit';
import { checkoutSessions } from '$lib/server/checkoutSessions';

export async function POST({ request }) {
  const { amount } = await request.json();

  if (typeof amount !== 'number' || amount <= 0) {
    return json({ message: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' }, { status: 400 });
  }

  const calculatedAmount = amount;
  const paymentSessionId = `PAYMENT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  checkoutSessions.set(paymentSessionId, {
    amount: calculatedAmount.toFixed(2),
    currency: 'THB',
    createdAt: new Date(),
  });

  return json({ paymentSessionId: paymentSessionId });
}