
import { error } from '@sveltejs/kit';
import { checkoutSessions } from '$lib/server/checkoutSessions';
import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

export async function load({ url }) {
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    throw error(400, 'ไม่พบรหัสเซสชันการชำระเงิน');
  }

  const session = checkoutSessions.get(sessionId);

  if (!session) {
    throw error(404, 'ไม่พบเซสชันการชำระเงิน หรือหมดอายุแล้ว');
  }

  const promptpayId = '0951236881';
  const payload = generatePayload(promptpayId, { amount: parseFloat(session.amount) });
  const qrCodeDataUrl = await QRCode.toDataURL(payload);


  return {
    amount: parseFloat(session.amount),
    sessionId: sessionId,
    currency: session.currency,
    promptpayId,
    qrCodeDataUrl
  };
}