<script>
    import { createEventDispatcher } from 'svelte';

    export let selectedMediaType; // Prop สำหรับรับค่า mediaType ที่ถูกเลือกในปัจจุบัน

    const dispatch = createEventDispatcher();

    function setMediaType(type) {
        dispatch('change', type); // ส่ง event 'change' พร้อมค่า type ใหม่
    }
</script>

<div class="mt-4 border-b border-gray-200">
    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
            on:click={() => setMediaType('image')}
            class:border-violet-500={selectedMediaType === 'image'}
            class:text-violet-600={selectedMediaType === 'image'}
            class:border-transparent={selectedMediaType !== 'image'}
            class:text-gray-500={selectedMediaType !== 'image'}
            class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
        >
            รูปภาพ
        </button>
        <button
            on:click={() => setMediaType('film')}
            class:border-violet-500={selectedMediaType === 'film'}
            class:text-violet-600={selectedMediaType === 'film'}
            class:border-transparent={selectedMediaType !== 'film'}
            class:text-gray-500={selectedMediaType !== 'film'}
            class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
        >
            วิดีโอ
        </button>
    </nav>
</div>