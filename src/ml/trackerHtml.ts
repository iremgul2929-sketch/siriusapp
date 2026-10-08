/**
 * WebView/iframe icinde calisan el takip sayfasi. On kamerayi acar, MediaPipe
 * Hand Landmarker ile her karede iki ele kadar 21'er el noktasini bulur, elleri aynalanmis
 * goruntunun ustune cizer ve noktalari uygulamaya mesaj olarak yollar.
 *
 * Mesajlar: {type:'ready'} | {type:'error', code, message} | {type:'frame', lm, lm2} (eller soldan saga; her biri [[x,y],...] | null)
 * Koordinatlar en-boy oranina gore duzeltilmistir (iki eksen ayni olcekte).
 */

const MP_VERSION = '1.0.1';
const MP_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function trackerHtml(color: string) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
<style>
  html, body { margin: 0; height: 100%; background: #08091A; overflow: hidden; }
  video, canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
</style>
</head>
<body>
<video id="v" autoplay playsinline muted></video>
<canvas id="c"></canvas>
<script type="module">
  const send = (m) => {
    const s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else window.parent.postMessage({ __sirius: true, data: s }, '*');
  };
  const BONES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[9,10],[10,11],[11,12],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]];
  const v = document.getElementById('v');
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');

  function draw(hands) {
    const dpr = window.devicePixelRatio || 1;
    const cw = c.clientWidth, ch = c.clientHeight;
    if (c.width !== cw * dpr) { c.width = cw * dpr; c.height = ch * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    hands.forEach(drawHand);
  }

  function drawHand(lm) {
    const cw = c.clientWidth, ch = c.clientHeight;
    // object-fit: cover eslemesi
    const vw = v.videoWidth, vh = v.videoHeight;
    const k = Math.max(cw / vw, ch / vh);
    const ox = (cw - vw * k) / 2, oy = (ch - vh * k) / 2;
    const P = lm.map((p) => [ox + p.x * vw * k, oy + p.y * vh * k]);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '${color}';
    ctx.lineWidth = 4;
    ctx.shadowColor = '${color}';
    ctx.shadowBlur = 12;
    for (const [a, b] of BONES) { ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.stroke(); }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#F1D58A';
    for (const [x, y] of P) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
  }

  async function start() {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch (e) {
      send({ type: 'error', code: 'camera', message: String((e && e.message) || e) });
      return;
    }
    v.srcObject = stream;
    await v.play().catch(() => {});

    let landmarker;
    try {
      const { FilesetResolver, HandLandmarker } = await import('${MP_BASE}/vision_bundle.mjs');
      const files = await FilesetResolver.forVisionTasks('${MP_BASE}/wasm');
      const opts = (delegate) => ({
        baseOptions: { modelAssetPath: '${MODEL_URL}', delegate },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      try { landmarker = await HandLandmarker.createFromOptions(files, opts('GPU')); }
      catch { landmarker = await HandLandmarker.createFromOptions(files, opts('CPU')); }
    } catch (e) {
      send({ type: 'error', code: 'model', message: String((e && e.message) || e) });
      return;
    }
    send({ type: 'ready' });

    let lastVideoTime = -1, lastSent = 0;
    const loop = () => {
      if (v.readyState >= 2 && v.currentTime !== lastVideoTime) {
        lastVideoTime = v.currentTime;
        const now = performance.now();
        const res = landmarker.detectForVideo(v, now);
        // Iki ele kadar izlenir; eller goruntude soldan saga siralanir ki sira kareler arasinda degismesin.
        const hands = (res.landmarks || []).slice(0, 2).sort((a, b) => a[0].x - b[0].x);
        draw(hands);
        if (now - lastSent > 45) {
          lastSent = now;
          const m = Math.max(v.videoWidth, v.videoHeight) || 1;
          const sx = v.videoWidth / m, sy = v.videoHeight / m;
          const pack = (hand) => (hand ? hand.map((p) => [+(p.x * sx).toFixed(4), +(p.y * sy).toFixed(4)]) : null);
          send({ type: 'frame', t: Date.now(), lm: pack(hands[0]), lm2: pack(hands[1]) });
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  }
  start();
</script>
</body>
</html>`;
}
