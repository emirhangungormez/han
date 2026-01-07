/**
 * Barzakh: Star Gardener - Steam Asset Sync
 * Fetches dynamic content from Steam Store API to keep the site updated.
 */

async function updateSteamAssets() {
    const APP_ID = '3849950';
    const PROXY_URL = 'fetch_steam.php';

    try {
        const response = await fetch(PROXY_URL);
        const data = await response.json();

        if (!data[APP_ID] || !data[APP_ID].success) {
            console.error('Steam API error:', data);
            return;
        }

        const appDetails = data[APP_ID].data;

        // 1. Update Screenshots Gallery
        if (appDetails.screenshots) {
            updateGallery(appDetails.screenshots);
        }

        console.log('Steam screenshots updated successfully!');
    } catch (error) {
        console.error('Failed to fetch Steam assets:', error);
    }
}

function updateGallery(screenshots) {
    const gallery = document.querySelector('.photo-gallery');
    if (!gallery || !screenshots) return;

    let galleryHTML = '';
    screenshots.forEach((ss, index) => {
        galleryHTML += `<img src="${ss.path_full}" alt="Barzakh Ekran Görüntüsü ${index + 1}" data-id="${ss.id}">`;
    });

    gallery.innerHTML = galleryHTML;
    document.dispatchEvent(new Event('steamAssetsLoaded'));
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    updateSteamAssets();
});
