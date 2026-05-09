import redis from '$lib/server/redis';

const VITE_PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const keycache = "homepage:image";

    try {
        const cachedImages = await redis.get(keycache);

        if (cachedImages) {
            return {
                goods: JSON.parse(cachedImages)
            };
        }

        const respond = await fetch(
            `https://pixabay.com/api/?key=${VITE_PIXABAY_API_KEY}&order=popular&per_page=8&safesearch=true`
        );

        if (!respond.ok) {
            throw new Error(`API responded with status: ${respond.status}`);
        }

        const data = await respond.json();
        const goods = data.hits || [];

        if (goods.length > 0) {
            await redis.set(keycache, JSON.stringify(goods), "EX", 3600);
        }

        return {
            goods
        };
    } catch (error) {
        console.error("Redis or API Error:", error);
        return {
            goods: []
        };
    }
}
