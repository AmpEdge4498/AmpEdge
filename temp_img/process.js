const Jimp = require('jimp');

async function processImage() {
    const imagePath = 'C:\\Users\\Sayantan\\.antigravity\\AmpEdge\\admin-dashboard\\public\\logo.png';
    console.log("Reading image...");
    const image = await Jimp.read(imagePath);
    
    console.log("Removing background...");
    // Make white transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        var red = this.bitmap.data[idx + 0];
        var green = this.bitmap.data[idx + 1];
        var blue = this.bitmap.data[idx + 2];

        // If it's mostly white
        if (red > 230 && green > 230 && blue > 230) {
            this.bitmap.data[idx + 3] = 0; // set alpha to 0
        }
    });

    console.log("Cropping blank space...");
    // Autocrop removes transparent border!
    image.autocrop();

    await image.writeAsync(imagePath);
    console.log('Image processed successfully!');
}

processImage().catch(console.error);
