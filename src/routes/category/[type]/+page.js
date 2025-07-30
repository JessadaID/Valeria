export async function load({ params }) {
    // Access the 'slug' parameter from the URL
    const { type } = params;

    return {
        type: type
    };
}