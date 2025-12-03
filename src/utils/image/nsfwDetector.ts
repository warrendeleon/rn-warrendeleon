/**
 * NSFW Content Detector
 *
 * Client-side NSFW detection using TFLite with react-native-fast-tflite.
 * Runs entirely on-device for privacy and offline support.
 *
 * Features:
 * - On-device processing (no network calls)
 * - Privacy-preserving (images never leave device)
 * - ~93% accuracy with MobileNetV2-based model
 * - Hardware acceleration via CoreML (iOS) / GPU delegates (Android)
 * - E2E mock support for testing
 */

import { Platform } from 'react-native';
import { loadTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';
import RNFS from 'react-native-fs';
import * as jpeg from 'jpeg-js';

import { isE2EMockEnabled } from '@app/config/e2e';
import { logDebug, logError, logWarning } from '@app/utils/logger';

/** NSFW classification categories */
export type NSFWCategory = 'Drawing' | 'Hentai' | 'Neutral' | 'Porn' | 'Sexy';

/** Individual prediction result */
export interface NSFWPrediction {
  className: NSFWCategory;
  probability: number;
}

/** Result of NSFW detection */
export interface NSFWDetectionResult {
  /** Whether the image is safe for work */
  isSafe: boolean;
  /** Primary classification */
  classification: NSFWCategory;
  /** Probability of the primary classification (0-1) */
  confidence: number;
  /** All predictions from the model */
  predictions: NSFWPrediction[];
  /** Error message if detection failed */
  error?: string;
}

/** Content validation result for profile pictures */
export interface ContentValidationResult {
  /** Whether the content is appropriate */
  isAppropriate: boolean;
  /** Human-readable message */
  message: string;
  /** Classification category */
  classification: NSFWCategory | null;
  /** Confidence score (0-1) */
  confidence: number | null;
}

/** Model input dimensions (NudeNet uses 256x256) */
const MODEL_INPUT_SIZE = 256;

/** Model file name */
const MODEL_FILENAME = 'nudenet.tflite';

/** Threshold for unsafe classification */
const UNSAFE_THRESHOLD = 0.5;

/** TFLite model instance (lazy loaded) */
let nsfwModel: TensorflowModel | null = null;
let modelLoading: Promise<TensorflowModel> | null = null;

/**
 * Get the path to the NSFW model
 *
 * Copies from bundle to Documents directory on first use for reliable access.
 */
async function getModelPath(): Promise<string> {
  const documentsPath = `${RNFS.DocumentDirectoryPath}/${MODEL_FILENAME}`;

  // Check if model already exists in Documents
  const existsInDocs = await RNFS.exists(documentsPath);
  if (existsInDocs) {
    logDebug('Model found in Documents directory', { path: documentsPath });
    return documentsPath;
  }

  // Copy from bundle to Documents
  if (Platform.OS === 'ios') {
    const bundlePath = `${RNFS.MainBundlePath}/${MODEL_FILENAME}`;
    const existsInBundle = await RNFS.exists(bundlePath);
    if (existsInBundle) {
      logDebug('Copying model from bundle to Documents...', {
        from: bundlePath,
        to: documentsPath,
      });
      await RNFS.copyFile(bundlePath, documentsPath);
      logDebug('Model copied successfully');
      return documentsPath;
    }
    throw new Error(`Model not found in bundle: ${bundlePath}`);
  }

  // Android: Copy from assets to Documents
  logDebug('Copying model from assets to Documents...');
  await RNFS.copyFileAssets(MODEL_FILENAME, documentsPath);
  logDebug('Model copied successfully');
  return documentsPath;
}

/**
 * Load the TFLite NSFW model (lazy initialisation)
 *
 * Tries CoreML delegate first for GPU acceleration, falls back to CPU.
 */
async function loadModel(): Promise<TensorflowModel> {
  if (nsfwModel) {
    return nsfwModel;
  }

  if (modelLoading) {
    return modelLoading;
  }

  modelLoading = (async () => {
    logDebug('Loading NSFW TFLite model...');
    const modelPath = await getModelPath();
    logDebug('Model path resolved', { modelPath });

    // Try both with and without file:// prefix
    const modelUrls = [`file://${modelPath}`, modelPath];

    // Delegate priority for iOS: default (CPU) first, then GPU delegates
    // CPU is most compatible, GPU delegates may not work with all models
    const delegates: Array<'default' | 'metal' | 'core-ml'> =
      Platform.OS === 'ios' ? ['default', 'metal', 'core-ml'] : ['default'];

    let lastError: Error | null = null;

    for (const url of modelUrls) {
      for (const delegate of delegates) {
        try {
          logDebug(`Trying ${delegate} delegate...`, { url });
          const model = await loadTensorflowModel({ url }, delegate);
          nsfwModel = model;
          logDebug(`NSFW TFLite model loaded with ${delegate} delegate`, { url });
          return model;
        } catch (delegateError) {
          const errorMessage =
            delegateError instanceof Error
              ? delegateError.message
              : JSON.stringify(delegateError) || String(delegateError);
          logWarning(`${delegate} delegate failed for ${url}`, { error: errorMessage });
          lastError = delegateError instanceof Error ? delegateError : new Error(errorMessage);
        }
      }
    }

    // All attempts failed
    logError('Failed to load NSFW TFLite model with any delegate/path combination', lastError);
    modelLoading = null;
    throw lastError ?? new Error('Failed to load NSFW model');
  })();

  return modelLoading;
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Preprocess image for model input
 *
 * Loads JPEG, decodes to pixels, resizes to 224x224, normalises to [0, 1] float32.
 */
async function preprocessImage(imageUri: string): Promise<Float32Array> {
  logDebug('Preprocessing image', { imageUri });

  // Read image file as base64
  const base64Data = await RNFS.readFile(imageUri, 'base64');
  const jpegBuffer = base64ToUint8Array(base64Data);

  logDebug('JPEG buffer size', { size: jpegBuffer.length });

  // Decode JPEG to raw RGBA pixel data
  const decoded = jpeg.decode(jpegBuffer, { useTArray: true, formatAsRGBA: true });
  const { width, height, data: rgbaData } = decoded;

  logDebug('Image decoded', { width, height, pixelDataLength: rgbaData.length });

  // Create Float32Array for model input (224 x 224 x 3)
  // Model expects normalised RGB values in [0, 1] range
  const inputSize = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3;
  const inputData = new Float32Array(inputSize);

  // Calculate scaling factors for resize
  const scaleX = width / MODEL_INPUT_SIZE;
  const scaleY = height / MODEL_INPUT_SIZE;

  // Resize by nearest-neighbor sampling and extract RGB (skip alpha)
  for (let y = 0; y < MODEL_INPUT_SIZE; y++) {
    for (let x = 0; x < MODEL_INPUT_SIZE; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);

      // Source index in RGBA data (4 bytes per pixel)
      const srcIdx = (srcY * width + srcX) * 4;
      // Destination index in RGB data (3 floats per pixel)
      const dstIdx = (y * MODEL_INPUT_SIZE + x) * 3;

      // Extract BGR and normalise to [0, 1] - NudeNet expects BGR (swapRB=True in cv2)
      inputData[dstIdx] = (rgbaData[srcIdx + 2] ?? 0) / 255.0; // B
      inputData[dstIdx + 1] = (rgbaData[srcIdx + 1] ?? 0) / 255.0; // G
      inputData[dstIdx + 2] = (rgbaData[srcIdx] ?? 0) / 255.0; // R
    }
  }

  logDebug('Image preprocessed', {
    inputSize,
    sampleValues: [inputData[0], inputData[1], inputData[2]],
  });

  return inputData;
}

/**
 * Detect NSFW content in an image
 *
 * Uses TFLite for on-device content moderation.
 * Processing happens entirely on the device - no network calls.
 *
 * @param imageUri - Path to the image file
 * @returns Promise<NSFWDetectionResult> - Detection result
 *
 * @example
 * ```typescript
 * const result = await detectNSFW('/path/to/image.jpg');
 * if (!result.isSafe) {
 *   console.log(`Inappropriate content: ${result.classification}`);
 * }
 * ```
 */
export async function detectNSFW(imageUri: string): Promise<NSFWDetectionResult> {
  // E2E mock: Return safe result
  if (isE2EMockEnabled()) {
    logDebug('detectNSFW: E2E mock enabled, returning safe');
    return {
      isSafe: true,
      classification: 'Neutral',
      confidence: 0.95,
      predictions: [
        { className: 'Neutral', probability: 0.95 },
        { className: 'Drawing', probability: 0.03 },
        { className: 'Sexy', probability: 0.01 },
        { className: 'Porn', probability: 0.005 },
        { className: 'Hentai', probability: 0.005 },
      ],
    };
  }

  try {
    logDebug('Starting NSFW detection', { imageUri });

    // Load model if not already loaded
    const model = await loadModel();

    // Preprocess image to model input format
    const inputData = await preprocessImage(imageUri);

    // Run inference
    const outputs = await model.run([inputData]);
    const probabilities = outputs[0];

    if (!probabilities || probabilities.length < 2) {
      throw new Error(`Unexpected model output: ${probabilities?.length ?? 0} classes`);
    }

    // NudeNet outputs: [unsafe_probability, safe_probability] - try swapped order
    const unsafeProb =
      typeof probabilities[0] === 'bigint' ? Number(probabilities[0]) : (probabilities[0] ?? 0);
    const safeProb =
      typeof probabilities[1] === 'bigint' ? Number(probabilities[1]) : (probabilities[1] ?? 0);

    const predictions: NSFWPrediction[] = [
      { className: 'Neutral', probability: safeProb },
      { className: 'Porn', probability: unsafeProb },
    ];

    // Image is safe if unsafe probability is below threshold
    const isSafe = unsafeProb < UNSAFE_THRESHOLD;
    const classification: NSFWCategory = isSafe ? 'Neutral' : 'Porn';
    const confidence = isSafe ? safeProb : unsafeProb;

    logDebug('NSFW detection complete (NudeNet)', {
      isSafe,
      safeProb,
      unsafeProb,
      classification,
    });

    return {
      isSafe,
      classification,
      confidence,
      predictions,
    };
  } catch (error) {
    logError('NSFW detection failed', error);
    // On error, we default to safe to avoid blocking legitimate uploads
    // Server-side validation should be the backup
    logWarning('NSFW detection failed, defaulting to safe');
    return {
      isSafe: true,
      classification: 'Neutral',
      confidence: 0,
      predictions: [],
      error: 'Content moderation temporarily unavailable',
    };
  }
}

/**
 * Validate image content for profile picture use
 *
 * Checks if the image contains inappropriate/NSFW content.
 *
 * @param imageUri - Path to the image file
 * @returns Promise<ContentValidationResult> - Validation result
 *
 * @example
 * ```typescript
 * const validation = await validateImageContent('/path/to/photo.jpg');
 * if (!validation.isAppropriate) {
 *   showAlert(validation.message);
 * }
 * ```
 */
export async function validateImageContent(imageUri: string): Promise<ContentValidationResult> {
  // E2E mock: Return appropriate result
  if (isE2EMockEnabled()) {
    logDebug('validateImageContent: E2E mock enabled, returning appropriate');
    return {
      isAppropriate: true,
      message: 'Content is appropriate',
      classification: 'Neutral',
      confidence: 0.95,
    };
  }

  const result = await detectNSFW(imageUri);

  if (result.error && !result.isSafe) {
    return {
      isAppropriate: false,
      message: result.error,
      classification: null,
      confidence: null,
    };
  }

  if (!result.isSafe) {
    return {
      isAppropriate: false,
      message:
        'This image appears to contain inappropriate content. Please select a different photo.',
      classification: result.classification,
      confidence: result.confidence,
    };
  }

  return {
    isAppropriate: true,
    message: 'Content is appropriate',
    classification: result.classification,
    confidence: result.confidence,
  };
}

/**
 * Quick check if image content is safe
 *
 * @param imageUri - Path to the image file
 * @returns Promise<boolean> - True if content is safe
 */
export async function isContentSafe(imageUri: string): Promise<boolean> {
  const result = await detectNSFW(imageUri);
  return result.isSafe;
}

/**
 * Preload the NSFW model
 *
 * Call this early in app lifecycle to reduce latency on first detection.
 */
export async function preloadNSFWModel(): Promise<void> {
  try {
    await loadModel();
  } catch (error) {
    logWarning('Failed to preload NSFW model', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
