<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
  import Loading from '$lib/component/Loading.svelte';

    let orders = [];
    let loading = true;
    let error = null;
    let currentUser = null;
    let expandedOrders = new Set();

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
    }

    async function fetchOrders() {
        loading = true;
        error = null;

        await checkUser();
        if (!currentUser) return;
        
        try {
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (orderError) {
                throw orderError;
            }

            if (orderData && orderData.length > 0) {
                const processedOrders = await Promise.all(
                    orderData.map(async (order) => {
                        if (order.order_items && order.order_items.length > 0) {
                            const processedItems = await Promise.all(
                                order.order_items.map(async (item) => {
                                    if (item.image_id) {
                                        try {
                                            const pixabayApiKey = import.meta.env.VITE_PIXABAY_API_KEY;
                                            const pixabayUrl = `https://pixabay.com/api/?key=${pixabayApiKey}&id=${item.image_id}`;
                                            const response = await fetch(pixabayUrl);
                                            const pixabayData = await response.json();
                                            if (pixabayData.hits && pixabayData.hits.length > 0) {
                                                item.imageUrl = pixabayData.hits[0].webformatURL;
                                                item.thumbnailUrl = pixabayData.hits[0].previewURL;
                                                item.tag = pixabayData.hits[0].tags || item.tag || 'ไม่ระบุชื่อสินค้า';
                                            } else {
                                                item.imageUrl = 'https://via.placeholder.com/400x300';
                                                item.thumbnailUrl = 'https://via.placeholder.com/150x100';
                                            }
                                        } catch (imageError) {
                                            console.warn('Failed to fetch image:', imageError);
                                            item.imageUrl = 'https://via.placeholder.com/400x300';
                                            item.thumbnailUrl = 'https://via.placeholder.com/150x100';
                                        }
                                    } else {
                                        item.imageUrl = 'https://via.placeholder.com/400x300';
                                        item.thumbnailUrl = 'https://via.placeholder.com/150x100';
                                    }
                                    return item;
                                })
                            );
                            order.order_items = processedItems;
                        }
                        return order;
                    })
                );
                orders = processedOrders;
            } else {
                orders = [];
            }
        } catch (err) {
            error = err.message;
            console.error('Error fetching orders:', err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        checkUser().then(() => fetchOrders());
    });

    $: if (currentUser?.id && orders.length === 0 && !loading && !error) {
        fetchOrders();
    }

    function toggleOrderExpansion(orderId) {
        if (expandedOrders.has(orderId)) {
            expandedOrders.delete(orderId);
        } else {
            expandedOrders.add(orderId);
        }
        expandedOrders = expandedOrders;
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatPrice(price) {
        if (typeof price !== 'number') return '฿0.00';
        return `฿${price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
    }

    function getStatusClasses(status) {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'ชำระเงินแล้ว':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled':
            case 'ยกเลิก':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'awaiting_payment':
            case 'รอชำระเงิน':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    function getStatusname(status) {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'ชำระเงินแล้ว';
            case 'cancelled':
                return 'ยกเลิก';
            case 'awaiting_payment':
                return 'รอชำระเงิน';
            default:
                return status || 'ไม่ระบุสถานะ';
        }
    }

</script>

<div class="min-h-screen bg-gray-50 ">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">
                        ประวัติการสั่งซื้อ
                    </h1>
                    <p class="text-gray-600 ">จัดการและติดตามคำสั่งซื้อทั้งหมดของคุณ</p>
                </div>
            
            </div>
        </div>

        {#if loading}
            <div class="bg-white  rounded-2xl shadow-sm border border-gray-200  p-12">
                <Loading />
                <div class="text-center text-gray-500  mt-4">
                    กำลังโหลดประวัติการสั่งซื้อ...
                </div>
            </div>
            
        {:else if error}
            <div class="bg-white rounded-2xl shadow-sm border border-red-200  p-8">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 bg-red-100  rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-red-600 " fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-red-800 ">เกิดข้อผิดพลาด</h3>
                        <p class="text-red-600  mt-1">{error}</p>
                    </div>
                </div>
            </div>
            
        {:else if !currentUser?.id}
            <div class="bg-white 0 rounded-2xl shadow-sm border border-gray-200  p-16">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gray-100  rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900  mb-3">กรุณาเข้าสู่ระบบ</h3>
                    <p class="text-gray-600 ">เพื่อดูประวัติการสั่งซื้อของคุณ</p>
                </div>
            </div>
            
        {:else if orders.length === 0}
            <div class="bg-white  rounded-2xl shadow-sm border border-gray-200  p-16">
                <div class="text-center">
                    <div class="w-20 h-20 bg-gray-100  rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900  mb-3">ไม่พบประวัติการสั่งซื้อ</h3>
                    <p class="text-gray-600 ">เมื่อคุณทำการสั่งซื้อแล้ว รายการจะแสดงที่นี่</p>
                </div>
            </div>
            
        {:else}
            <div class="space-y-6">
                {#each orders as order (order.id)}
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                        <div class="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">
                                            คำสั่งซื้อ #{order.id}
                                        </h3>
                                        <p class="text-sm text-gray-600">
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center gap-4">
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium border {getStatusClasses(order.status)}">
                                        {getStatusname(order.status)}
                                    </span>
                                    <div class="text-right">
                                        <div class="text-2xl font-bold text-gray-900">
                                            {formatPrice(order.total_amount || 0)}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            {order.order_items?.length || 0} รายการ
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="p-6">
                            {#if order.order_items && order.order_items.length > 0}
                                <div class="flex items-center gap-4 mb-4">
                                    <div class="flex -space-x-2">
                                        {#each order.order_items.slice(0, 3) as item}
                                            <img 
                                                src={item.thumbnailUrl} 
                                                alt={item.tag || 'Product'} 
                                                class="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
                                                loading="lazy"
                                            />
                                        {/each}
                                        {#if order.order_items.length > 3}
                                            <div class="w-12 h-12 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center">
                                                <span class="text-xs font-medium text-gray-600">
                                                    +{order.order_items.length - 3}
                                                </span>
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    <button 
                                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                        on:click={() => toggleOrderExpansion(order.id)}
                                    >
                                        {expandedOrders.has(order.id) ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                                        <svg 
                                            class="w-4 h-4 transform transition-transform duration-200 {expandedOrders.has(order.id) ? 'rotate-180' : ''}" 
                                            fill="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M7 10l5 5 5-5z"/>
                                        </svg>
                                    </button>
                                </div>

                                {#if expandedOrders.has(order.id)}
                                    <div class="bg-gray-50 rounded-xl p-4 space-y-4">
                                        {#each order.order_items as item}
                                            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                                <div class="flex items-start gap-4">
                                                    <div class="relative group">
                                                        <img 
                                                            src={item.thumbnailUrl} 
                                                            alt={item.tag || 'Product'} 
                                                            class="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-200"
                                                            loading="lazy"
                                                        />
                                                        <div class="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                                            <svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 9a3 3 0 000 6 3 3 0 000-6z"/>
                                                                <path d="M12 1l9.5 5.5v11L12 23l-9.5-6V6.5L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311z"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="flex-1 min-w-0">
                                                        <h4 class="text-base font-semibold text-gray-900 mb-1">
                                                            {item.tag?.split(',')[0]?.trim() || 'Untitled Image'}
                                                        </h4>
                                                        <div class="flex items-center gap-4 text-sm text-gray-600">
                                                            <span>จำนวน: {item.quantity || 1}</span>
                                                            <span>ราคา: {formatPrice(item.price || 0)}</span>
                                                            <span class="font-medium text-gray-900">
                                                                รวม: {formatPrice((item.quantity || 1) * (item.price || 0))}
                                                            </span>
                                                        </div>
                                                        {#if item.tag && item.tag.includes(',')}
                                                            <div class="mt-2">
                                                                <div class="flex flex-wrap gap-1">
                                                                    {#each item.tag.split(',').slice(1, 4) as tag}
                                                                        <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                                            {tag.trim()}
                                                                        </span>
                                                                    {/each}
                                                                </div>
                                                            </div>
                                                        {/if}
                                                    </div>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            {:else}
                                <p class="text-gray-500 italic text-center py-4">ไม่มีรายการสินค้า</p>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>

        {/if}
    </div>
</div>