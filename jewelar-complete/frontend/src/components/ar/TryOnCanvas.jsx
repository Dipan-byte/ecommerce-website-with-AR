// src/components/ar/TryOnCanvas.jsx
// ─────────────────────────────────────────────────────────────────────────────
// JewelAR Virtual Try-On — MediaPipe Face Mesh + Canvas Overlay
//
// How it works:
//  1. We access the webcam via getUserMedia()
//  2. MediaPipe FaceMesh returns 468 3D face landmarks on every frame
//  3. We extract specific landmarks for ears, nose tip, and neck/collarbone
//  4. We draw the jewellery PNG (with transparency) at those coordinates
//  5. We scale + rotate the overlay based on face geometry (inter-ear distance,
//     face angle) so the jewellery moves naturally with the face
//  6. Everything runs in requestAnimationFrame — real-time at 60fps
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback, useState } from "react";
import { FaceMesh }    from "@mediapipe/face_mesh";
import { Camera }      from "@mediapipe/camera_utils";
import { FiCameraOff } from "react-icons/fi";

// ── Key landmark indices (from MediaPipe's 468-point map) ────────────────────
const LM = {
  // Ears
  LEFT_EAR:          234,   // outer left ear
  RIGHT_EAR:         454,   // outer right ear
  LEFT_EAR_INNER:    93,    // inner left ear canal
  RIGHT_EAR_INNER:   323,   // inner right ear canal

  // Nose
  NOSE_TIP:          4,     // tip of the nose
  NOSE_BOTTOM:       2,     // bottom of nose

  // Face height reference points
  FOREHEAD:          10,
  CHIN:              152,

  // Neck / collarbone approximation (below chin)
  // We extrapolate beyond chin for necklace placement
};

// ── Utility: convert normalized MediaPipe coords → canvas pixels ─────────────
const lmToCanvas = (lm, canvasW, canvasH) => ({
  x: lm.x * canvasW,
  y: lm.y * canvasH,
  z: lm.z,
});

// ── Utility: distance between two points ─────────────────────────────────────
const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// ── Utility: angle between two points (radians) ──────────────────────────────
const angleBetween = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

// ── Image cache so we don't reload the same URL each frame ───────────────────
const imgCache = {};
const loadImage = (src) => {
  if (!src) return null;
  if (imgCache[src]) return imgCache[src];
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  imgCache[src] = img;
  return img;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function TryOnCanvas({ product, onCameraError }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef   = useRef(null);
  const imgRef    = useRef(null);

  const [cameraReady,  setCameraReady]  = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error,        setError]        = useState(null);

  // Pre-load the jewellery overlay image whenever product changes
  useEffect(() => {
    if (product?.tryOnAsset) {
      const img = loadImage(product.tryOnAsset);
      imgRef.current = img;
    } else {
      imgRef.current = null;
    }
  }, [product]);

  // ── Draw overlays onto the canvas ──────────────────────────────────────────
  const drawOverlays = useCallback((landmarks, canvasW, canvasH, ctx) => {
    if (!imgRef.current || !imgRef.current.complete) return;
    if (!product?.tryOnType) return;

    const lms = landmarks.map((lm) => lmToCanvas(lm, canvasW, canvasH));
    const type = product.tryOnType;

    if (type === "earring") {
      drawEarrings(ctx, lms, canvasW, canvasH);
    } else if (type === "nose") {
      drawNosePin(ctx, lms);
    } else if (type === "necklace") {
      drawNecklace(ctx, lms, canvasW, canvasH);
    }
  }, [product]);

  // ── Earring drawing ─────────────────────────────────────────────────────────
  const drawEarrings = (ctx, lms, canvasW, canvasH) => {
    const leftEar   = lms[LM.LEFT_EAR];
    const rightEar  = lms[LM.RIGHT_EAR];
    const chin      = lms[LM.CHIN];
    const forehead  = lms[LM.FOREHEAD];

    // Face height = distance from forehead to chin
    const faceHeight = dist(forehead, chin);

    // Earring size scales with face height
    const earringH = faceHeight * 0.28;
    const earringW = earringH * (imgRef.current.naturalWidth / (imgRef.current.naturalHeight || 1));

    // Face tilt angle (from ear-to-ear line)
    const tiltAngle = angleBetween(leftEar, rightEar);

    // Detect z-depth difference to simulate head turn
    // If leftEar.z < rightEar.z, face is turning left (left ear closer to camera)
    const leftZ  = lms[LM.LEFT_EAR_INNER]?.z  || 0;
    const rightZ = lms[LM.RIGHT_EAR_INNER]?.z || 0;

    // Opacity for each ear based on z visibility
    // When head turns right, left ear goes behind face so we fade it out
    const leftAlpha  = Math.max(0, Math.min(1, 0.5 - leftZ  * 3));
    const rightAlpha = Math.max(0, Math.min(1, 0.5 - rightZ * 3));

    // Draw left earring
    drawRotatedImage(
      ctx, imgRef.current,
      leftEar.x - earringW / 2,
      leftEar.y,              // hang from ear lobe downward
      earringW, earringH,
      leftEar.x, leftEar.y,  // rotation pivot = ear position
      tiltAngle,
      leftAlpha
    );

    // Draw right earring (mirrored — flip horizontally)
    drawRotatedImageMirrored(
      ctx, imgRef.current,
      rightEar.x - earringW / 2,
      rightEar.y,
      earringW, earringH,
      rightEar.x, rightEar.y,
      tiltAngle,
      rightAlpha
    );
  };

  // ── Nose pin drawing ────────────────────────────────────────────────────────
  const drawNosePin = (ctx, lms) => {
    const nose    = lms[LM.NOSE_TIP];
    const nostrilLeft  = lms[358];  // left nostril
    const nostrilRight = lms[129];  // right nostril

    // Size relative to nostril width
    const nostrilWidth = dist(nostrilLeft, nostrilRight);
    const pinSize = nostrilWidth * 0.6;

    // Nose pin sits on the left nostril
    drawRotatedImage(
      ctx, imgRef.current,
      nostrilLeft.x - pinSize / 2,
      nostrilLeft.y - pinSize / 2,
      pinSize, pinSize,
      nostrilLeft.x, nostrilLeft.y,
      0,
      0.9
    );
  };

  // ── Necklace drawing ────────────────────────────────────────────────────────
  const drawNecklace = (ctx, lms, canvasW, canvasH) => {
    const chin     = lms[LM.CHIN];
    const leftEar  = lms[LM.LEFT_EAR];
    const rightEar = lms[LM.RIGHT_EAR];

    // Necklace width = distance between ears
    const earSpan    = dist(leftEar, rightEar);
    const necklaceW  = earSpan * 1.4;
    const necklaceH  = necklaceW * (imgRef.current.naturalHeight / (imgRef.current.naturalWidth || 1));

    // Necklace sits below the chin — extrapolate downward by 20% of ear span
    const neckX = chin.x - necklaceW / 2;
    const neckY = chin.y + earSpan * 0.2;

    const tiltAngle = angleBetween(leftEar, rightEar);

    drawRotatedImage(
      ctx, imgRef.current,
      neckX, neckY,
      necklaceW, necklaceH,
      chin.x, neckY,
      tiltAngle,
      0.85
    );
  };

  // ── Helper: draw image with rotation and optional alpha ────────────────────
  const drawRotatedImage = (ctx, img, x, y, w, h, pivotX, pivotY, angle, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.translate(-pivotX, -pivotY);
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  };

  // ── Helper: draw image mirrored horizontally (for right earring) ────────────
  const drawRotatedImageMirrored = (ctx, img, x, y, w, h, pivotX, pivotY, angle, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.scale(-1, 1); // flip horizontally
    ctx.translate(-pivotX, -pivotY);
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  };

  // ── MediaPipe results callback ──────────────────────────────────────────────
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    // Mirror the canvas (selfie mode — flip horizontally)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // Draw the video frame as background
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw jewellery if face detected
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);

      // Use the first detected face
      const landmarks = results.multiFaceLandmarks[0];

      // We need to mirror the landmark X coordinates to match the mirrored canvas
      const mirroredLandmarks = landmarks.map((lm) => ({
        x: 1 - lm.x, // mirror X
        y: lm.y,
        z: lm.z,
      }));

      drawOverlays(mirroredLandmarks, canvas.width, canvas.height, ctx);
    } else {
      setFaceDetected(false);
    }
  }, [drawOverlays]);

  // ── Initialize MediaPipe FaceMesh + Camera ──────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initFaceMesh = async () => {
      try {
        // 1. Create FaceMesh instance
        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces:          1,
          refineLandmarks:      true,  // 468 landmarks + iris
          minDetectionConfidence: 0.5,
          minTrackingConfidence:  0.5,
        });

        faceMesh.onResults(onResults);
        meshRef.current = faceMesh;

        // 2. Start camera
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (meshRef.current && videoRef.current) {
              await meshRef.current.send({ image: videoRef.current });
            }
          },
          width:  640,
          height: 480,
          facingMode: "user",
        });

        await camera.start();
        cameraRef.current = camera;
        if (mounted) setCameraReady(true);

      } catch (err) {
        console.error("TryOn init error:", err);
        const msg = err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access to use Try-On."
          : "Camera not available on this device.";
        if (mounted) setError(msg);
        onCameraError?.(msg);
      }
    };

    initFaceMesh();

    // Cleanup
    return () => {
      mounted = false;
      cameraRef.current?.stop();
      meshRef.current?.close();
    };
  }, []); // only run once

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="aspect-video rounded-3xl bg-obsidian-900 flex flex-col items-center justify-center gap-4 text-white">
        <FiCameraOff size={40} className="text-obsidian-400" />
        <p className="font-sans text-sm text-obsidian-300 text-center max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl overflow-hidden bg-obsidian-900 aspect-video">
      {/* Hidden video element (MediaPipe processes this) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
        playsInline
        muted
      />

      {/* Canvas — shows mirrored video + jewellery overlay */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />

      {/* Loading state */}
      {!cameraReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-obsidian-900">
          <div className="w-10 h-10 border-2 border-gold-200 border-t-gold-500 rounded-full animate-spin" />
          <p className="font-sans text-sm text-obsidian-400">Starting camera...</p>
        </div>
      )}

      {/* Face detection indicator */}
      {cameraReady && (
        <div className="absolute top-4 left-4">
          <div className={`flex items-center gap-2 font-sans text-xs px-3 py-1.5 rounded-full backdrop-blur-sm ${
            faceDetected
              ? "bg-green-900/60 text-green-300"
              : "bg-obsidian-900/60 text-obsidian-400"
          }`}>
            <div className={`w-2 h-2 rounded-full ${faceDetected ? "bg-green-400 animate-pulse" : "bg-obsidian-500"}`} />
            {faceDetected ? "Face detected" : "Looking for face..."}
          </div>
        </div>
      )}

      {/* Product name overlay */}
      {product && cameraReady && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-obsidian-900/70 backdrop-blur-sm rounded-2xl px-4 py-3">
            <p className="font-sans text-xs text-gold-400 uppercase tracking-widest">{product.tryOnType}</p>
            <p className="font-display text-white text-sm">{product.name}</p>
          </div>
        </div>
      )}

      {/* No product selected */}
      {!product && cameraReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-3">💍</p>
            <p className="font-display text-white text-lg">Select a piece to try on</p>
            <p className="font-sans text-obsidian-400 text-sm mt-1">Choose from the panel on the right</p>
          </div>
        </div>
      )}
    </div>
  );
}
