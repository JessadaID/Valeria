<!-- +layout.svelte -->
<script>
    import '../app.css';
    import Nav from '$lib/component/nav.svelte';
    import Footer from '$lib/component/Footer.svelte';
</script>

<Nav />


<div class=" min-h-screen">
  <slot />
</div>

  <Footer />
