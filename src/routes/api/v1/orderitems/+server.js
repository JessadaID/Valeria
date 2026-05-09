import { json } from "@sveltejs/kit";
import { supabaseServer as supabase } from "$lib/server/supabaseServer";

export async function POST({ request }) {
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (e) {
        return json({ message: "ข้อมูลที่ส่งมาไม่อยู่ในรูปแบบ JSON ที่ถูกต้อง" }, { status: 400 });
    }

    const { orderId, imageId, price, type } = requestBody;

    const missingFields = [];
    if (orderId === undefined) missingFields.push("orderId");
    if (imageId === undefined) missingFields.push("imageId");
    if (price === undefined) missingFields.push("price");
    if (type === undefined) missingFields.push("type");

    if (missingFields.length > 0) {
        return json({ message: `กรุณาระบุข้อมูลที่จำเป็นให้ครบถ้วน: ${missingFields.join(', ')}` }, { status: 400 });
    }

    if (typeof orderId !== 'string') {
        return json({ message: "orderId ต้องเป็นตัวอักษร" }, { status: 400 });
    }

    if (typeof imageId !== 'string' && typeof imageId !== 'number') {
        return json({ message: "imageId ต้องเป็นสตริงหรือตัวเลข" }, { status: 400 });
    }
    if (typeof price !== 'number' || price < 0) {
        return json({ message: "price ต้องเป็นตัวเลขที่ไม่ติดลบ" }, { status: 400 });
    }

    const { data: newOrderItem, error: insertError } = await supabase
        .from('order_items')
        .insert([
            {
                order_id: orderId,
                image_id: imageId,
                price: price,
                type: type,
            }
        ])
        .select()
        .single();

    if (insertError) {
        console.error('Supabase insert order_item error:', insertError);
        return json({ message: "เกิดข้อผิดพลาดในการเพิ่มรายการสินค้าในคำสั่งซื้อ", details: insertError.message }, { status: 500 });
    }

    if (!newOrderItem) {
        console.error('Order item data not returned after insert, though no explicit error from Supabase.');
        return json({ message: "ไม่สามารถเพิ่มรายการสินค้าในคำสั่งซื้อได้ หรือไม่พบข้อมูลหลังจากการเพิ่ม" }, { status: 500 });
    }

    return json(newOrderItem, { status: 201 });
}
