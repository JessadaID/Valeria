// src/routes/qr-code/+page.server.js
import { error } from '@sveltejs/kit';
import { checkoutSessions } from '$lib/server/checkoutSessions';
import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';
// จำลองการดึงข้อมูลเซสชันการชำระเงินจาก "ฐานข้อมูล"
// (ต้องเป็น Map ตัวเดียวกับใน +server.js หรือเชื่อมต่อกับฐานข้อมูลจริง)

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    throw error(400, 'ไม่พบรหัสเซสชันการชำระเงิน');
  }

  const session = checkoutSessions.get(sessionId); // ดึงข้อมูลเซสชัน

  if (!session) {
    throw error(404, 'ไม่พบเซสชันการชำระเงิน หรือหมดอายุแล้ว');
  }

  const promptpayId = '0951236881';
  const payload = generatePayload(promptpayId, { amount: parseFloat(session.amount)});
  const qrCodeDataUrl = await QRCode.toDataURL(payload);
  // ส่งค่าเงินที่ดึงมาได้กลับไปให้หน้า +page.svelte

  return {
    amount: parseFloat(session.amount),
    sessionId: sessionId,
    currency: session.currency,
    promptpayId,
    qrCodeDataUrl
  };
}