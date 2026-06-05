const sharp = require('sharp');
const path = require('path');

async function extractLogo() {
  // Extract logo from original-v3.png (centered at top, roughly x=350-730, y=5-115)
  await sharp(path.resolve(__dirname, 'original-v3.png'))
    .extract({ left: 300, top: 0, width: 480, height: 160 })
    .toFile(path.resolve(__dirname, 'logo-moulin-elise.png'));

  console.log('Logo extrait : logo-moulin-elise.png');

  // Also extract baker from boulanger-original.png (top 60% only, centered on baker)
  await sharp(path.resolve(__dirname, 'boulanger-original.png'))
    .extract({ left: 540, top: 100, width: 540, height: 530 })
    .toFile(path.resolve(__dirname, 'baker-cropped.png'));

  console.log('Boulanger extrait : baker-cropped.png');
}

extractLogo();
