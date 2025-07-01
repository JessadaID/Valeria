<!-- +layout.svelte -->
<script>
    import '../app.css';
    import Nav from '$lib/component/nav.svelte';
    import Footer from '$lib/component/footer.svelte';
    import GlobalAlert from './GlobalAlert.svelte';
</script>

<Nav />

<slot />

<Footer />

<GlobalAlert />