import { json } from '@sveltejs/kit';
import redis from '$lib/server/redis';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const email = url.searchParams.get('email');
    if (!email) {
        return json({ error: 'Email is required' }, { status: 400 });
    }

    try {
        const cartData = await redis.get(`cart:${email}`);
        const items = cartData ? JSON.parse(cartData) : [];
        return json(items);
    } catch (error) {
        console.error('Redis GET Error:', error);
        return json({ error: 'Failed to fetch cart from Redis' }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { email, items } = await request.json();
        if (!email) {
            return json({ error: 'Email is required' }, { status: 400 });
        }

        // Store cart items in Redis for 7 days
        await redis.set(`cart:${email}`, JSON.stringify(items), 'EX', 60 * 60 * 24 * 7);
        return json({ success: true });
    } catch (error) {
        console.error('Redis POST Error:', error);
        return json({ error: 'Failed to save cart to Redis' }, { status: 500 });
    }
}
