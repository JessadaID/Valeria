import redis from '$lib/server/redis';

const VITE_PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

async function fetchPixabay(params) {
    const query = new URLSearchParams({
        key: VITE_PIXABAY_API_KEY,
        safesearch: 'true',
        ...params
    });
    const response = await fetch(`https://pixabay.com/api/?${query}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.hits || [];
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const goodsKey = "homepage:image";
    const sidebarKey = "sidebar:random_images";

    try {
        const [cachedGoods, cachedSidebar] = await Promise.all([
            redis.get(goodsKey),
            redis.get(sidebarKey)
        ]);

        let goods = cachedGoods ? JSON.parse(cachedGoods) : null;
        let randomImages = cachedSidebar ? JSON.parse(cachedSidebar) : null;

        const fetchPromises = [];

        if (!goods) {
            fetchPromises.push(
                fetchPixabay({ order: 'popular', per_page: 8 })
                    .then(async (data) => {
                        goods = data;
                        if (goods.length > 0) {
                            await redis.set(goodsKey, JSON.stringify(goods), "EX", 3600);
                        }
                    })
            );
        }

        if (!randomImages) {
            fetchPromises.push(
                fetchPixabay({ order: 'latest', per_page: 4, image_type: 'photo' })
                    .then(async (data) => {
                        randomImages = data;
                        if (randomImages.length > 0) {
                            await redis.set(sidebarKey, JSON.stringify(randomImages), "EX", 3600);
                        }
                    })
            );
        }

        if (fetchPromises.length > 0) {
            await Promise.all(fetchPromises);
        }

        return {
            goods: goods || [],
            randomImages: randomImages || []
        };
    } catch (error) {
        console.error("Redis or API Error in +page.server.js:", error);
        return {
            goods: [],
            randomImages: []
        };
    }
}
