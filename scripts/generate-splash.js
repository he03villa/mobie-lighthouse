const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateSplash() {
  const svgPath = path.join(__dirname, '../src/assets/icon/splash.svg');
  const pngPath = path.join(__dirname, '../src/assets/icon/splash.png');

  console.log('🔄 Generando splash.png desde splash.svg...');

  try {
    const svgBuffer = fs.readFileSync(svgPath);

    await sharp(svgBuffer)
      .resize(1024, 1024)
      .png({ quality: 100 })
      .toFile(pngPath);

    console.log('✅ splash.png generado correctamente en:');
    console.log('   ' + pngPath);
  } catch (error) {
    console.error('❌ Error generando splash.png:', error.message);
    process.exit(1);
  }
}

generateSplash();
