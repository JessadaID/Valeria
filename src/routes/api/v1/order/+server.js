import { json } from "@sveltejs/kit";
import { supabase } from "$lib/supabaseClient";

export async function POST({ request }) {
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (e) {
        // Handle cases where the request body is not valid JSON
        return json({ message: "ข้อมูลที่ส่งมาไม่อยู่ในรูปแบบ JSON ที่ถูกต้อง" }, { status: 400 });
    }

    const { userId, totalamount, status, createdAt } = requestBody;

    // --- Input Validation ---
    // Check for the presence of all required fields
    const missingFields = [];
    if (userId === undefined) missingFields.push("userId");
    if (totalamount === undefined) missingFields.push("totalamount");
    if (!status) missingFields.push("status"); // Checks for empty string, null, undefined
    if (!createdAt) missingFields.push("createdAt");

    if (missingFields.length > 0) {
        return json({ message: `กรุณาระบุข้อมูลที่จำเป็นให้ครบถ้วน: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // Additional type and format validation (examples)
    if (typeof totalamount !== 'number' || isNaN(totalamount)) {
        return json({ message: "totalamount ต้องเป็นตัวเลขที่ไม่ติดลบ" }, { status: 400 });
    }
    if (typeof status !== 'string' || status.trim() === '') {
        return json({ message: "status ต้องเป็นสตริงที่ไม่ใช่ค่าว่าง" }, { status: 400 });
    }
    // Basic ISO 8601 date string validation. You might want a more robust library for complex validation.
    if (typeof createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(createdAt)) {
        return json({ message: "createdAt ต้องอยู่ในรูปแบบ ISO date string ที่ถูกต้อง (เช่น YYYY-MM-DDTHH:mm:ss.sssZ)" }, { status: 400 });
    }
    // --- End Input Validation ---

    // --- Database Interaction ---
    // Insert the new order into the 'orders' table
    // IMPORTANT: Adjust 'user_id', 'total_amount', and 'created_at' to match your actual Supabase column names.
    // Supabase typically uses snake_case for column names (e.g., user_id).
    const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert([
            {
                user_id: userId,         // Assuming your column is 'user_id'
                total_amount: totalamount, // Assuming your column is 'total_amount'
                status: status,
                created_at: createdAt    // Ensure this column in Supabase is of type timestamp or timestamptz
            }
        ])
        .select() // Select all columns of the inserted row. Supabase returns the inserted data.
        .single(); // We expect a single row to be inserted and returned.

    if (insertError) {
        console.error('Supabase insert error:', insertError);
        // It's good practice to log the detailed error on the server
        // and return a more generic error message to the client.
        return json({ message: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อในระบบ", details: insertError.message }, { status: 500 });
    }

    if (!newOrder) {
        // This case might occur if .single() doesn't find the inserted row,
        // though it's unlikely if the insert itself didn't error and .select() is used.
        console.error('Order data not returned after insert, though no explicit error from Supabase.');
        return json({ message: "ไม่สามารถสร้างคำสั่งซื้อได้ หรือไม่พบข้อมูลหลังจากการสร้าง" }, { status: 500 });
    }

    // --- Success Response ---
    // On successful creation, return the newly created order object.
    // Your client-side `insertOrder` function expects `orderData.id`,
    // so `orderData` should be the order object itself.
    return json(newOrder, { status: 201 }); // HTTP 201 Created status
}
