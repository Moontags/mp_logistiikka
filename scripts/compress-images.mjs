import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const imagesDir = new URL('../public/images', import.meta.url).pathname;

const files = await readdir(imagesDir);
const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

for (const file of imageFiles) {
  const input = join(imagesDir, file);
  const ext = extname(file).toLowerCase();
  const before = (await stat(input)).size;

  if (ext === '.png') {
    const tmp = input + '.tmp.png';
    await sharp(input).png({ quality: 80, compressionLevel: 9 }).toFile(tmp);
    const after = (await stat(tmp)).size;
    if (after < before) {
      const { rename } = await import('fs/promises');
      await rename(tmp, input);
      console.log(`${file}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (${Math.round((1-after/before)*100)}% pienempi)`);
    } else {
      const { unlink } = await import('fs/promises');
      await unlink(tmp);
      console.log(`${file}: jo optimaalinen`);
    }
  } else {
    const tmp = input + '.tmp.jpg';
    await sharp(input).jpeg({ quality: 80, mozjpeg: true }).toFile(tmp);
    const after = (await stat(tmp)).size;
    if (after < before) {
      const { rename } = await import('fs/promises');
      await rename(tmp, input);
      console.log(`${file}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (${Math.round((1-after/before)*100)}% pienempi)`);
    } else {
      const { unlink } = await import('fs/promises');
      await unlink(tmp);
      console.log(`${file}: jo optimaalinen`);
    }
  }
}
