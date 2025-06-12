// src/routes/api/create-payment-session/+server.js
import { json } from '@sveltejs/kit';
// ฟังก์ชันจำลอง: บันทึกข้อมูลเซสชันการชำระเงินลงในฐานข้อมูล/หน่วยความจำชั่วคราว
// ในความเป็นจริง คุณจะใช้ฐานข้อมูลจริง เช่น Redis, PostgreSQL หรือ MongoDB
import { checkoutSessions } from '$lib/server/checkoutSessions';

export async function POST({ request }) {
  const { amount } = await request.json(); // เปลี่ยนจาก cartItems เป็น amount

  // ตรวจสอบว่า amount ถูกส่งมาและเป็นตัวเลขที่ถูกต้อง
  if (typeof amount !== 'number' || amount <= 0) {
    return json({ message: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' }, { status: 400 });
  }

  // **สำคัญ:** ในสถานการณ์นี้ เราได้รับยอดเงินรวมมาจาก Client โดยตรง
  // เนื่องจากโจทย์ระบุว่าทุกรูปราคาเท่ากันและ Client ส่งยอดรวมมา
  // หากในอนาคตมีการเปลี่ยนแปลง เช่น สินค้ามีราคาต่างกัน หรือ Client ส่งรายละเอียดสินค้ามา
  // จำเป็นต้องคำนวณยอดเงินที่ฝั่ง Server ใหม่อีกครั้งจากข้อมูลสินค้าในฐานข้อมูล
  // เพื่อยืนยันความถูกต้องและป้องกันการปลอมแปลง
  const calculatedAmount = amount; // ใช้ยอดเงินที่ได้รับโดยตรง

  // สร้าง ID สำหรับเซสชันการชำระเงิน (UUID หรือ ID ที่ไม่ซ้ำกัน)
  const paymentSessionId = `PAYMENT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // บันทึกยอดเงินที่คำนวณได้ลงใน Map จำลอง (ในโลกจริงคือฐานข้อมูล)
  checkoutSessions.set(paymentSessionId, {
    amount: calculatedAmount.toFixed(2), // จัดรูปแบบทศนิยมให้มี 2 ตำแหน่ง
    currency: 'THB',
    createdAt: new Date(),
    // อาจจะเก็บข้อมูลอื่นๆ เช่น userId, status
    // ไม่จำเป็นต้องเก็บ cartItems ที่นี่แล้ว ถ้า Client ส่งแค่ยอดรวม
  });
  // ส่ง ID ของเซสชันการชำระเงินกลับไปให้ Client
  return json({ paymentSessionId:paymentSessionId });
}