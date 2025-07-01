import { json } from "@sveltejs/kit";
import { supabase } from "$lib/supabaseClient";

export async function POST({ request }) {
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (e) {
        return json({ message: "ข้อมูลที่ส่งมาไม่อยู่ในรูปแบบ JSON ที่ถูกต้อง" }, { status: 400 });
    }

    const { orderId, imageId, price } = requestBody;

    // --- Input Validation ---
    const missingFields = [];
    if (orderId === undefined) missingFields.push("orderId");
    if (imageId === undefined) missingFields.push("imageId"); // Assuming imageId can be 0, so check for undefined
    if (price === undefined) missingFields.push("price");

    if (missingFields.length > 0) {
        return json({ message: `กรุณาระบุข้อมูลที่จำเป็นให้ครบถ้วน: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // Additional type validation
    if (typeof orderId !== 'string') {
        return json({ message: "orderId ต้องเป็นตัวอักษร" }, { status: 400 });
    }
    // imageId could be a string or number depending on your schema, adjust if necessary
    if (typeof imageId !== 'string' && typeof imageId !== 'number') {
         return json({ message: "imageId ต้องเป็นสตริงหรือตัวเลข" }, { status: 400 });
    }
    if (typeof price !== 'number' || price < 0) {
        return json({ message: "price ต้องเป็นตัวเลขที่ไม่ติดลบ" }, { status: 400 });
    }
    // --- End Input Validation ---


    // --- Database Interaction ---
    // IMPORTANT: Adjust 'order_id', 'image_id' to match your actual Supabase column names in 'order_items' table.
    // Supabase typically uses snake_case for column names.
    const { data: newOrderItem, error: insertError } = await supabase
        .from('order_items') // Assuming your table is named 'order_items'
        .insert([
            {
                order_id: orderId,    // Maps to your 'order_id' column (foreign key to orders table)
                image_id: imageId,    // Maps to your 'image_id' or 'product_id' column
                price: price,
                // created_at: new Date().toISOString(), // Optional: if your table doesn't auto-set timestamps
            }
        ])
        .select() // Select all columns of the inserted row.
        .single(); // We expect a single row to be inserted.

    if (insertError) {
        console.error('Supabase insert order_item error:', insertError);
        return json({ message: "เกิดข้อผิดพลาดในการเพิ่มรายการสินค้าในคำสั่งซื้อ", details: insertError.message }, { status: 500 });
    }

    if (!newOrderItem) {
        console.error('Order item data not returned after insert, though no explicit error from Supabase.');
        return json({ message: "ไม่สามารถเพิ่มรายการสินค้าในคำสั่งซื้อได้ หรือไม่พบข้อมูลหลังจากการเพิ่ม" }, { status: 500 });
    }

    // --- Success Response ---
    // The client-side function doesn't strictly need the created item back,
    // but it's good practice to return the created resource.
    return json(newOrderItem, { status: 201 }); // HTTP 201 Created
}
