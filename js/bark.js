const dogImage = document.getElementById('dogImage');
const loading = document.getElementById('loading');
const breedSelect = document.getElementById('breedSelect');
const breedInfo = document.getElementById('breedInfo');

let stats = {
    totalViewed: 0,
    breedCounts: {},
    downloadCount: 0
};

// Load breeds into select
async function loadBreeds() {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/list/all');
        const data = await response.json();
        const breeds = Object.keys(data.message);
        
        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed.charAt(0).toUpperCase() + breed.slice(1);
            breedSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading breeds:', error);
    }
}

async function getNewDog() {
    try {
        loading.style.display = 'block';
        dogImage.style.opacity = '0.5';
        
        const selectedBreed = breedSelect.value;
        const url = selectedBreed === 'random' 
            ? 'https://dog.ceo/api/breeds/image/random'
            : `https://dog.ceo/api/breed/${selectedBreed}/images/random`;

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'success') {
            const img = new Image();
            img.src = data.message;
            
            img.onload = () => {
                dogImage.src = data.message;
                dogImage.style.opacity = '1';
                loading.style.display = 'none';
                
                // Update statistics
                stats.totalViewed++;
                const currentBreed = selectedBreed === 'random' 
                    ? data.message.split('/')[4]
                    : selectedBreed;
                stats.breedCounts[currentBreed] = (stats.breedCounts[currentBreed] || 0) + 1;
                
                updateStats();
                updateBreedInfo(currentBreed);
            };
        } else {
            throw new Error('Failed to fetch dog image');
        }
    } catch (error) {
        console.error('Error:', error);
        loading.textContent = 'Error loading image. Please try again.';
        dogImage.style.opacity = '1';
    }
}

function updateStats() {
    document.getElementById('totalViewed').textContent = stats.totalViewed;
    document.getElementById('breedCount').textContent = Object.keys(stats.breedCounts).length;
    document.getElementById('downloadCount').textContent = stats.downloadCount;
    
    // Update image count text
    const imageCount = document.getElementById('imageCount');
    imageCount.textContent = `You've viewed ${stats.totalViewed} dog images!`;
}

function updateBreedInfo(breed) {
    const timesViewed = stats.breedCounts[breed] || 0;
    breedInfo.innerHTML = `
        <h3>Current Breed: ${breed.charAt(0).toUpperCase() + breed.slice(1)}</h3>
        <p>You've seen this breed ${timesViewed} time${timesViewed !== 1 ? 's' : ''}</p>
    `;
}

async function downloadImage() {
    try {
        const response = await fetch(dogImage.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dog-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        stats.downloadCount++;
        updateStats();
    } catch (error) {
        console.error('Error downloading image:', error);
        alert('Error downloading image. Please try again.');
    }
}

// Initialize
loadBreeds();
getNewDog();