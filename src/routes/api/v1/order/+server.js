import { json } from "@sveltejs/kit";
import { supabaseServer as supabase } from "$lib/server/supabaseServer";

export async function POST({ request }) {
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (e) {
        return json({ message: "ข้อมูลที่ส่งมาไม่อยู่ในรูปแบบ JSON ที่ถูกต้อง" }, { status: 400 });
    }

    const { userId, totalamount, status, createdAt } = requestBody;

    const missingFields = [];
    if (userId === undefined) missingFields.push("userId");
    if (totalamount === undefined) missingFields.push("totalamount");
    if (!status) missingFields.push("status");
    if (!createdAt) missingFields.push("createdAt");

    if (missingFields.length > 0) {
        return json({ message: `กรุณาระบุข้อมูลที่จำเป็นให้ครบถ้วน: ${missingFields.join(', ')}` }, { status: 400 });
    }

    if (typeof totalamount !== 'number' || isNaN(totalamount)) {
        return json({ message: "totalamount ต้องเป็นตัวเลขที่ไม่ติดลบ" }, { status: 400 });
    }
    if (typeof status !== 'string' || status.trim() === '') {
        return json({ message: "status ต้องเป็นสตริงที่ไม่ใช่ค่าว่าง" }, { status: 400 });
    }

    if (typeof createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(createdAt)) {
        return json({ message: "createdAt ต้องอยู่ในรูปแบบ ISO date string ที่ถูกต้อง (เช่น YYYY-MM-DDTHH:mm:ss.sssZ)" }, { status: 400 });
    }

    const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert([
            {
                user_id: userId,
                total_amount: totalamount,
                status: status,
                created_at: createdAt
            }
        ])
        .select()
        .single();

    if (insertError) {
        console.error('Supabase insert error:', insertError);
        return json({ message: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อในระบบ", details: insertError.message }, { status: 500 });
    }

    if (!newOrder) {
        console.error('Order data not returned after insert, though no explicit error from Supabase.');
        return json({ message: "ไม่สามารถสร้างคำสั่งซื้อได้ หรือไม่พบข้อมูลหลังจากการสร้าง" }, { status: 500 });
    }
    return json(newOrder, { status: 201 });
}
