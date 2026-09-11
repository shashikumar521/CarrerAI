const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('Generating official CareerAI logo animation video...');

const width = 720;
const height = 720;
const fps = 30;
const durationSec = 4.5;
const totalFrames = Math.round(fps * durationSec);

// First, scale original logo to 720x720 raw RGB
const rawLogoPath = '/tmp/logo_720.rgb';
const scaleRes = require('child_process').spawnSync('ffmpeg', [
  '-y',
  '-i', 'public/careerai-logo.png',
  '-vf', `scale=${width}:${height}`,
  '-f', 'rawvideo',
  '-pix_fmt', 'rgb24',
  rawLogoPath
]);

if (scaleRes.status !== 0) {
  console.error('Failed to scale logo:', scaleRes.stderr.toString());
  process.exit(1);
}

const baseLogo = fs.readFileSync(rawLogoPath);
console.log(`Loaded base logo (${baseLogo.length} bytes, ${width}x${height})`);

// Graduation cap bounding box at 720x720:
// (scale factor = 720/1024 = 0.703125)
// Original cap: x: [399, 624], y: [440, 581]
// In 720: x: [280, 440], y: [308, 410]
const capMinX = Math.floor(390 * (720 / 1024));
const capMaxX = Math.ceil(630 * (720 / 1024));
const capMinY = Math.floor(430 * (720 / 1024));
const capMaxY = Math.ceil(590 * (720 / 1024));

// Extract cap with alpha
const capW = capMaxX - capMinX;
const capH = capMaxY - capMinY;
const capAlpha = new Float32Array(capW * capH);
const capR = new Uint8Array(capW * capH);
const capG = new Uint8Array(capW * capH);
const capB = new Uint8Array(capW * capH);

for (let cy = 0; cy < capH; cy++) {
  for (let cx = 0; cx < capW; cx++) {
    const x = capMinX + cx;
    const y = capMinY + cy;
    const idx = (y * width + x) * 3;
    const r = baseLogo[idx];
    const g = baseLogo[idx + 1];
    const b = baseLogo[idx + 2];

    const isGold = (r > 125 && g > 85 && b < 140 && r > b + 25);
    const isCapShadowOrBand = (r > 35 && r < 120 && g > 30 && g < 100 && b < 90 && Math.abs(r - g) < 40);
    const isTassel = (x > capMinX + capW * 0.75 && y > capMinY + capH * 0.45 && r > 90 && g > 65);

    const cidx = cy * capW + cx;
    capR[cidx] = r;
    capG[cidx] = g;
    capB[cidx] = b;

    if (isGold || isCapShadowOrBand || isTassel) {
      capAlpha[cidx] = 1.0;
    } else {
      capAlpha[cidx] = 0.0;
    }
  }
}

// Soften alpha edges for smooth blending
const smoothCapAlpha = new Float32Array(capW * capH);
for (let cy = 1; cy < capH - 1; cy++) {
  for (let cx = 1; cx < capW - 1; cx++) {
    const cidx = cy * capW + cx;
    let sum = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        sum += capAlpha[(cy + dy) * capW + (cx + dx)];
      }
    }
    smoothCapAlpha[cidx] = sum / 9.0;
  }
}

// Create clean background without the cap (infilled star center)
const cleanBg = Buffer.from(baseLogo);
const centerX = width / 2;
const centerY = height / 2;

// The background behind the cap is the star center (deep navy / dark slate)
for (let y = capMinY; y < capMaxY; y++) {
  for (let x = capMinX; x < capMaxX; x++) {
    const cidx = (y - capMinY) * capW + (x - capMinX);
    const a = smoothCapAlpha[cidx];
    if (a > 0.05) {
      const idx = (y * width + x) * 3;
      // Distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.hypot(dx, dy);

      // Star core is navy #0f172a / #1e293b
      // Blend star color
      const bgR = 24;
      const bgG = 34;
      const bgB = 54;

      cleanBg[idx] = Math.round(cleanBg[idx] * (1 - a) + bgR * a);
      cleanBg[idx + 1] = Math.round(cleanBg[idx + 1] * (1 - a) + bgG * a);
      cleanBg[idx + 2] = Math.round(cleanBg[idx + 2] * (1 - a) + bgB * a);
    }
  }
}

// Spawn FFmpeg to encode MP4
const mp4Out = path.join(__dirname, '../public/careerai-animation.mp4');
const ffmpegMp4 = spawn('ffmpeg', [
  '-y',
  '-f', 'rawvideo',
  '-pix_fmt', 'rgb24',
  '-s', `${width}x${height}`,
  '-r', `${fps}`,
  '-i', 'pipe:0',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '19',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  mp4Out
]);

ffmpegMp4.stderr.on('data', (d) => {
  // ffmpeg progress
});

ffmpegMp4.on('close', (code) => {
  console.log(`MP4 export finished with code ${code} -> ${mp4Out}`);
  
  // Also encode WebM for optimized web delivery
  const webmOut = path.join(__dirname, '../public/careerai-animation.webm');
  console.log('Generating WebM version...');
  const ffmpegWebm = spawn('ffmpeg', [
    '-y',
    '-i', mp4Out,
    '-c:v', 'libvpx-vp9',
    '-crf', '28',
    '-b:v', '0',
    webmOut
  ]);
  ffmpegWebm.on('close', (c) => {
    console.log(`WebM export finished with code ${c} -> ${webmOut}`);
  });
});

const frameBuf = Buffer.alloc(width * height * 3);

for (let frame = 0; frame < totalFrames; frame++) {
  const t = frame / fps; // seconds
  const progress = frame / (totalFrames - 1);

  // Animation phases:
  // 0.0 - 0.5s: rest
  // 0.5 - 1.8s: cap lifts up (ease-in-out)
  // 1.8 - 3.4s: floating hover + subtle rotation & tassel sway
  // 3.4 - 4.3s: cap returns down to rest
  // 4.3 - 4.5s: settle
  let liftProgress = 0;
  if (t < 0.5) {
    liftProgress = 0;
  } else if (t < 1.8) {
    const p = (t - 0.5) / 1.3;
    liftProgress = 0.5 - 0.5 * Math.cos(p * Math.PI); // smooth easeInOut
  } else if (t < 3.4) {
    const hoverT = (t - 1.8) / 1.6;
    liftProgress = 1.0 + Math.sin(hoverT * Math.PI * 2) * 0.12;
  } else if (t < 4.3) {
    const p = (t - 3.4) / 0.9;
    liftProgress = (1.0 - (0.5 - 0.5 * Math.cos(p * Math.PI)));
  } else {
    liftProgress = 0;
  }

  // Maximum lift is ~42 pixels upward
  const offsetY = -Math.round(liftProgress * 38);
  // Subtle horizontal sway
  const offsetX = Math.round(Math.sin((t / durationSec) * Math.PI * 2) * (liftProgress * 2));

  // Copy cleanBg into frameBuf
  cleanBg.copy(frameBuf);

  // Soft shadow under the cap when lifted
  if (liftProgress > 0.05) {
    const shadowIntensity = liftProgress * 0.45;
    const shadowOffsetY = Math.round(liftProgress * 18);
    const shadowSpread = Math.round(liftProgress * 12);

    for (let cy = 0; cy < capH; cy += 2) {
      for (let cx = 0; cx < capW; cx += 2) {
        const a = smoothCapAlpha[cy * capW + cx];
        if (a > 0.2) {
          const sy = capMinY + cy + shadowOffsetY;
          const sx = capMinX + cx + offsetX;
          for (let dy = -shadowSpread; dy <= shadowSpread; dy += 2) {
            for (let dx = -shadowSpread; dx <= shadowSpread; dx += 2) {
              const py = sy + dy;
              const px = sx + dx;
              if (py >= 0 && py < height && px >= 0 && px < width) {
                const dist = Math.hypot(dx, dy);
                if (dist <= shadowSpread + 2) {
                  const factor = (1 - dist / (shadowSpread + 3)) * shadowIntensity * a * 0.35;
                  const pidx = (py * width + px) * 3;
                  frameBuf[pidx] = Math.max(0, Math.round(frameBuf[pidx] * (1 - factor)));
                  frameBuf[pidx + 1] = Math.max(0, Math.round(frameBuf[pidx + 1] * (1 - factor)));
                  frameBuf[pidx + 2] = Math.max(0, Math.round(frameBuf[pidx + 2] * (1 - factor)));
                }
              }
            }
          }
        }
      }
    }
  }

  // Draw floating cap onto frameBuf
  // Sheen light sweep effect across gold cap
  const sheenPhase = ((t * 0.8) % 1.0); // 0..1 sweep
  const sheenX = capMinX + sheenPhase * (capW * 1.6) - capW * 0.3;

  for (let cy = 0; cy < capH; cy++) {
    for (let cx = 0; cx < capW; cx++) {
      const a = smoothCapAlpha[cy * capW + cx];
      if (a > 0.02) {
        const dy = capMinY + cy + offsetY;
        const dx = capMinX + cx + offsetX;

        if (dy >= 0 && dy < height && dx >= 0 && dx < width) {
          const cidx = cy * capW + cx;
          let cr = capR[cidx];
          let cg = capG[cidx];
          let cb = capB[cidx];

          // Ambient golden sheen sweep
          const distToSheen = Math.abs((dx - dy * 0.4) - (sheenX - capMinY * 0.4));
          if (distToSheen < 28 && liftProgress > 0.2) {
            const sheenGlow = (1 - distToSheen / 28) * 45 * liftProgress;
            cr = Math.min(255, cr + Math.round(sheenGlow * 1.1));
            cg = Math.min(255, cg + Math.round(sheenGlow * 0.9));
            cb = Math.min(255, cb + Math.round(sheenGlow * 0.4));
          }

          const fidx = (dy * width + dx) * 3;
          frameBuf[fidx] = Math.round(frameBuf[fidx] * (1 - a) + cr * a);
          frameBuf[fidx + 1] = Math.round(frameBuf[fidx + 1] * (1 - a) + cg * a);
          frameBuf[fidx + 2] = Math.round(frameBuf[fidx + 2] * (1 - a) + cb * a);
        }
      }
    }
  }

  // Subtle golden glow pulse on compass outer ring during hover peak
  if (liftProgress > 0.6) {
    const pulseStrength = Math.sin(((t - 1.8) / 1.6) * Math.PI) * 0.15;
    if (pulseStrength > 0) {
      // warm ambient ring enhancement
      const ringRadius = 310;
      for (let angle = 0; angle < 360; angle += 2) {
        const rad = (angle * Math.PI) / 180;
        const rx = Math.round(centerX + Math.cos(rad) * ringRadius);
        const ry = Math.round(centerY + Math.sin(rad) * ringRadius);
        if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
          const pidx = (ry * width + rx) * 3;
          frameBuf[pidx] = Math.min(255, frameBuf[pidx] + Math.round(pulseStrength * 30));
          frameBuf[pidx + 1] = Math.min(255, frameBuf[pidx + 1] + Math.round(pulseStrength * 20));
        }
      }
    }
  }

  ffmpegMp4.stdin.write(frameBuf);
}

ffmpegMp4.stdin.end();
