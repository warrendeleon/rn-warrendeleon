/**
 * Tests for NSFW Content Detector
 *
 * Tests NSFW detection functions focusing on the public API behaviour.
 * Tests model loading, image preprocessing, classification logic, and E2E mocking.
 */

// Mock E2E config before imports - use require to access the mocked module
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
  setE2EMockOverride: jest.fn(),
  getE2EMockOverride: jest.fn(() => null),
  getEnvE2EMockValue: jest.fn(() => false),
  isTestUIEnabled: false,
}));

// Mock logger
jest.mock('@app/utils/logger', () => ({
  logDebug: jest.fn(),
  logError: jest.fn(),
  logWarning: jest.fn(),
}));

// Mock react-native-fast-tflite
const mockLoadTensorflowModel = jest.fn();
jest.mock('react-native-fast-tflite', () => ({
  loadTensorflowModel: mockLoadTensorflowModel,
}));

// Mock react-native-fs
const mockRNFS = {
  DocumentDirectoryPath: '/mock/documents',
  MainBundlePath: '/mock/bundle',
  exists: jest.fn(),
  copyFile: jest.fn(),
  copyFileAssets: jest.fn(),
  readFile: jest.fn(),
};
jest.mock('react-native-fs', () => mockRNFS);

// Mock jpeg-js
const mockJpegDecode = jest.fn();
jest.mock('jpeg-js', () => ({
  decode: mockJpegDecode,
}));

import { isE2EMockEnabled } from '@app/config/e2e';

import {
  detectNSFW,
  isContentSafe,
  type NSFWDetectionResult,
  validateImageContent,
} from '../nsfwDetector';

// Create a mock model with configurable outputs
const createMockModel = (outputs: number[][]) => ({
  run: jest.fn().mockReturnValue(outputs),
});

// Create mock RGBA image data (4 bytes per pixel)
const createMockImageData = (width: number, height: number, rgbaValues?: number[]) => {
  const data = new Uint8Array(width * height * 4);
  if (rgbaValues) {
    for (let i = 0; i < data.length && i < rgbaValues.length; i++) {
      data[i] = rgbaValues[i] ?? 0;
    }
  } else {
    // Fill with mid-gray by default
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128; // R
      data[i + 1] = 128; // G
      data[i + 2] = 128; // B
      data[i + 3] = 255; // A
    }
  }
  return data;
};

// Top-level mock reference so all describe blocks can access it
const mockIsE2EMockEnabled = isE2EMockEnabled as jest.MockedFunction<typeof isE2EMockEnabled>;

// Common beforeEach for all describe blocks
const resetAllMocks = () => {
  jest.clearAllMocks();
  mockIsE2EMockEnabled.mockReturnValue(false);
  mockLoadTensorflowModel.mockReset();
  mockRNFS.exists.mockReset();
  mockRNFS.copyFile.mockReset();
  mockRNFS.copyFileAssets.mockReset();
  mockRNFS.readFile.mockReset();
  mockJpegDecode.mockReset();
};

// Global beforeEach to reset module state - needed because nsfwDetector caches model
beforeEach(() => {
  resetAllMocks();
});

describe('nsfwDetector', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('detectNSFW', () => {
    it('should handle detection errors gracefully and default to safe', async () => {
      // Without proper native module mocking, detection will fail
      // The module should gracefully handle this and return safe
      const result = await detectNSFW('/path/to/image.jpg');

      expect(result.isSafe).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should return proper structure on error', async () => {
      const result = await detectNSFW('/path/to/image.jpg');

      expect(result).toHaveProperty('isSafe');
      expect(result).toHaveProperty('classification');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('predictions');
    });
  });

  describe('validateImageContent', () => {
    it('should handle validation errors gracefully', async () => {
      const result = await validateImageContent('/path/to/image.jpg');

      // On error with safe default, still appropriate
      expect(result.isAppropriate).toBe(true);
    });

    it('should return proper structure', async () => {
      const result = await validateImageContent('/path/to/image.jpg');

      expect(result).toHaveProperty('isAppropriate');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('classification');
      expect(result).toHaveProperty('confidence');
    });
  });

  describe('isContentSafe', () => {
    it('should return true on error (fail-safe)', async () => {
      const result = await isContentSafe('/path/to/image.jpg');

      expect(result).toBe(true);
    });
  });

  describe('E2E mock behaviour', () => {
    beforeEach(() => {
      mockIsE2EMockEnabled.mockReturnValue(true);
    });

    it('should return mock safe result when E2E mock is enabled', async () => {
      const result = await detectNSFW('/path/to/image.jpg');

      expect(result.isSafe).toBe(true);
      expect(result.classification).toBe('Neutral');
      expect(result.confidence).toBe(0.95);
      expect(result.predictions).toHaveLength(5);
    });

    it('should return all prediction categories in E2E mock', async () => {
      const result = await detectNSFW('/path/to/image.jpg');

      const classNames = result.predictions.map(p => p.className);
      expect(classNames).toContain('Neutral');
      expect(classNames).toContain('Drawing');
      expect(classNames).toContain('Sexy');
      expect(classNames).toContain('Porn');
      expect(classNames).toContain('Hentai');
    });

    it('should return appropriate validation when E2E mock is enabled', async () => {
      const result = await validateImageContent('/path/to/image.jpg');

      expect(result.isAppropriate).toBe(true);
      expect(result.message).toBe('Content is appropriate');
      expect(result.classification).toBe('Neutral');
      expect(result.confidence).toBe(0.95);
    });

    it('should return true for isContentSafe when E2E mock is enabled', async () => {
      const result = await isContentSafe('/path/to/image.jpg');

      expect(result).toBe(true);
    });
  });

  describe('NSFWDetectionResult type structure', () => {
    it('should have correct result structure for E2E mock', async () => {
      mockIsE2EMockEnabled.mockReturnValue(true);
      const result: NSFWDetectionResult = await detectNSFW('/path/to/image.jpg');

      // Type assertions
      expect(typeof result.isSafe).toBe('boolean');
      expect(typeof result.classification).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.predictions)).toBe(true);

      // Each prediction should have className and probability
      result.predictions.forEach(prediction => {
        expect(prediction).toHaveProperty('className');
        expect(prediction).toHaveProperty('probability');
        expect(typeof prediction.probability).toBe('number');
      });
    });
  });
});

describe('Model Loading', () => {
  const setupBaseMocks = () => {
    mockIsE2EMockEnabled.mockReturnValue(false);
    mockRNFS.readFile.mockResolvedValue('bW9ja2RhdGE=');
    mockJpegDecode.mockReturnValue({
      width: 10,
      height: 10,
      data: createMockImageData(10, 10),
    });
  };

  beforeEach(() => {
    jest.resetModules();
  });

  describe('getModelPath behaviour', () => {
    it('returns Documents path if model already exists there', async () => {
      setupBaseMocks();
      mockRNFS.exists.mockResolvedValue(true);
      const mockModel = createMockModel([[0.1, 0.9]]);
      mockLoadTensorflowModel.mockResolvedValue(mockModel);

      const { detectNSFW: detectFresh } = require('../nsfwDetector');
      await detectFresh('/path/to/image.jpg');

      expect(mockRNFS.exists).toHaveBeenCalled();
      expect(mockRNFS.copyFile).not.toHaveBeenCalled();
      expect(mockRNFS.copyFileAssets).not.toHaveBeenCalled();
    });

    it('copies model from iOS bundle on first use', async () => {
      setupBaseMocks();
      mockRNFS.exists
        .mockResolvedValueOnce(false) // Documents check
        .mockResolvedValueOnce(true); // Bundle check
      mockRNFS.copyFile.mockResolvedValue(undefined);
      const mockModel = createMockModel([[0.1, 0.9]]);
      mockLoadTensorflowModel.mockResolvedValue(mockModel);

      // Platform.OS is 'ios' by default in RN Jest setup

      const { detectNSFW: detectFresh } = require('../nsfwDetector');
      await detectFresh('/path/to/image.jpg');

      expect(mockRNFS.copyFile).toHaveBeenCalledWith(
        '/mock/bundle/nudenet.tflite',
        '/mock/documents/nudenet.tflite'
      );
    });

    it('copies model from Android assets on first use', async () => {
      setupBaseMocks();
      mockRNFS.exists.mockResolvedValue(false);
      mockRNFS.copyFileAssets.mockResolvedValue(undefined);
      const mockModel = createMockModel([[0.1, 0.9]]);
      mockLoadTensorflowModel.mockResolvedValue(mockModel);

      // Mock Platform.OS as 'android' for this test
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
      }));

      const { detectNSFW: detectFresh } = require('../nsfwDetector');
      await detectFresh('/path/to/image.jpg');

      expect(mockRNFS.copyFileAssets).toHaveBeenCalledWith(
        'nudenet.tflite',
        '/mock/documents/nudenet.tflite'
      );

      // Reset the mock for subsequent tests
      jest.dontMock('react-native');
    });

    it('throws error if model not found in iOS bundle', async () => {
      setupBaseMocks();
      mockRNFS.exists.mockResolvedValue(false);
      // Platform.OS is 'ios' by default

      const { detectNSFW: detectFresh } = require('../nsfwDetector');
      const result = await detectFresh('/path/to/image.jpg');

      expect(result.isSafe).toBe(true);
      expect(result.error).toBeDefined();
    });
  });

  describe('loadModel behaviour', () => {
    it('returns cached model on subsequent calls', async () => {
      setupBaseMocks();
      mockRNFS.exists.mockResolvedValue(true);
      const mockModel = createMockModel([[0.1, 0.9]]);
      mockLoadTensorflowModel.mockResolvedValue(mockModel);

      const { detectNSFW: detectFresh } = require('../nsfwDetector');
      await detectFresh('/path/to/image1.jpg');
      await detectFresh('/path/to/image2.jpg');

      expect(mockLoadTensorflowModel).toHaveBeenCalledTimes(1);
    });

    it('tries delegates in order: default → metal → core-ml on iOS', async () => {
      setupBaseMocks();
      mockRNFS.exists.mockResolvedValue(true);
      const delegateAttempts: string[] = [];

      mockLoadTensorflowModel.mockImplementation((_, delegate) => {
        delegateAttempts.push(delegate);
        if (delegate === 'core-ml') {
          return Promise.resolve(createMockModel([[0.1, 0.9]]));
        }
        throw new Error(`${delegate} delegate failed`);
      });

      // Platform.OS is 'ios' by default

      const { detectNSFW: detectFresh } = require('../nsfwDetector');
      await detectFresh('/path/to/image.jpg');

      expect(delegateAttempts).toContain('default');
      expect(delegateAttempts).toContain('metal');
      expect(delegateAttempts).toContain('core-ml');
    });

    it('uses only default delegate on Android', async () => {
      setupBaseMocks();
      mockRNFS.exists.mockResolvedValue(true);
      const delegateAttempts: string[] = [];

      mockLoadTensorflowModel.mockImplementation((_, delegate) => {
        delegateAttempts.push(delegate);
        return Promise.resolve(createMockModel([[0.1, 0.9]]));
      });

      // Mock Platform.OS as 'android' for this test
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
      }));

      const { detectNSFW: detectFresh } = require('../nsfwDetector');
      await detectFresh('/path/to/image.jpg');

      expect(delegateAttempts).toEqual(['default']);

      // Reset the mock for subsequent tests
      jest.dontMock('react-native');
    });
  });
});

describe('Image Preprocessing', () => {
  const setupPreprocessMocks = () => {
    mockIsE2EMockEnabled.mockReturnValue(false);
    mockRNFS.exists.mockResolvedValue(true);
  };

  beforeEach(() => {
    jest.resetModules();
  });

  it('reads file as base64 and decodes JPEG', async () => {
    setupPreprocessMocks();
    const mockBase64 = 'bW9ja2RhdGE=';
    mockRNFS.readFile.mockResolvedValue(mockBase64);
    mockJpegDecode.mockReturnValue({
      width: 100,
      height: 100,
      data: createMockImageData(100, 100),
    });
    const mockModel = createMockModel([[0.1, 0.9]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    await detectFresh('/path/to/image.jpg');

    expect(mockRNFS.readFile).toHaveBeenCalledWith('/path/to/image.jpg', 'base64');
    expect(mockJpegDecode).toHaveBeenCalled();
  });

  it('creates Float32Array input of correct size (256x256x3)', async () => {
    setupPreprocessMocks();
    mockRNFS.readFile.mockResolvedValue('bW9ja2RhdGE=');
    mockJpegDecode.mockReturnValue({
      width: 100,
      height: 100,
      data: createMockImageData(100, 100),
    });
    const mockModel = createMockModel([[0.1, 0.9]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    await detectFresh('/path/to/image.jpg');

    const inputArg = mockModel.run.mock.calls[0][0][0];
    expect(inputArg).toBeInstanceOf(Float32Array);
    expect(inputArg.length).toBe(256 * 256 * 3);
  });

  it('normalises pixel values to [0, 1] range', async () => {
    setupPreprocessMocks();
    const imageData = new Uint8Array([255, 0, 128, 255]);
    mockRNFS.readFile.mockResolvedValue('bW9ja2RhdGE=');
    mockJpegDecode.mockReturnValue({
      width: 1,
      height: 1,
      data: imageData,
    });
    const mockModel = createMockModel([[0.1, 0.9]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    await detectFresh('/path/to/image.jpg');

    const inputArg = mockModel.run.mock.calls[0][0][0];
    expect(inputArg[0]).toBeCloseTo(128 / 255, 2); // B
    expect(inputArg[1]).toBeCloseTo(0, 2); // G
    expect(inputArg[2]).toBeCloseTo(1, 2); // R
  });

  it('handles file read errors gracefully', async () => {
    setupPreprocessMocks();
    mockRNFS.readFile.mockRejectedValue(new Error('File not found'));
    mockLoadTensorflowModel.mockResolvedValue(createMockModel([[0.1, 0.9]]));

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    const result = await detectFresh('/nonexistent.jpg');

    expect(result.isSafe).toBe(true);
    expect(result.error).toBeDefined();
  });

  it('handles JPEG decode errors gracefully', async () => {
    setupPreprocessMocks();
    mockRNFS.readFile.mockResolvedValue('invalidbase64==');
    mockJpegDecode.mockImplementation(() => {
      throw new Error('Invalid JPEG data');
    });
    mockLoadTensorflowModel.mockResolvedValue(createMockModel([[0.1, 0.9]]));

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    const result = await detectFresh('/corrupted.jpg');

    expect(result.isSafe).toBe(true);
    expect(result.error).toBeDefined();
  });
});

describe('Classification Logic', () => {
  /**
   * These tests need fresh module state each time because nsfwDetector
   * caches the loaded model. We use jest.resetModules + require to get fresh state.
   */

  const setupMocksForClassification = () => {
    mockIsE2EMockEnabled.mockReturnValue(false);
    mockRNFS.exists.mockResolvedValue(true);
    mockRNFS.readFile.mockResolvedValue('bW9ja2RhdGE=');
    mockJpegDecode.mockReturnValue({
      width: 10,
      height: 10,
      data: createMockImageData(10, 10),
    });
  };

  beforeEach(() => {
    jest.resetModules();
  });

  it('classifies as safe when unsafe probability < 0.5', async () => {
    setupMocksForClassification();
    const mockModel = createMockModel([[0.3, 0.7]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    const result = await detectFresh('/path/to/image.jpg');

    expect(result.isSafe).toBe(true);
    expect(result.classification).toBe('Neutral');
  });

  it('classifies as unsafe when unsafe probability >= 0.5', async () => {
    setupMocksForClassification();
    const mockModel = createMockModel([[0.5, 0.5]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    const result = await detectFresh('/path/to/image.jpg');

    expect(result.isSafe).toBe(false);
    expect(result.classification).toBe('Porn');
  });

  it('classifies as unsafe when unsafe probability is high', async () => {
    setupMocksForClassification();
    const mockModel = createMockModel([[0.9, 0.1]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    const result = await detectFresh('/path/to/image.jpg');

    expect(result.isSafe).toBe(false);
    expect(result.classification).toBe('Porn');
    expect(result.confidence).toBeCloseTo(0.9, 2);
  });

  it('returns predictions array with Neutral and Porn categories', async () => {
    setupMocksForClassification();
    const mockModel = createMockModel([[0.3, 0.7]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    const result = await detectFresh('/path/to/image.jpg');

    expect(result.predictions).toHaveLength(2);
    expect(result.predictions[0].className).toBe('Neutral');
    expect(result.predictions[0].probability).toBeCloseTo(0.7, 2);
    expect(result.predictions[1].className).toBe('Porn');
    expect(result.predictions[1].probability).toBeCloseTo(0.3, 2);
  });

  it('handles bigint model output', async () => {
    setupMocksForClassification();
    // Some TFLite models return bigint values
    const mockModel = {
      run: jest.fn().mockReturnValue([[BigInt(1), BigInt(99)]]),
    };
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    const result = await detectFresh('/path/to/image.jpg');

    expect(typeof result.confidence).toBe('number');
    expect(result.isSafe).toBe(false); // unsafe_prob = 1 >= 0.5
  });

  it('throws error for unexpected model output length', async () => {
    setupMocksForClassification();
    // Model returns only 1 value instead of expected 2
    const mockModel = createMockModel([[0.5]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { detectNSFW: detectFresh } = require('../nsfwDetector');
    const result = await detectFresh('/path/to/image.jpg');

    expect(result.isSafe).toBe(true);
    expect(result.error).toBeDefined();
  });
});

describe('preloadNSFWModel', () => {
  const setupMocksForPreload = () => {
    mockRNFS.exists.mockResolvedValue(true);
  };

  beforeEach(() => {
    jest.resetModules();
  });

  it('loads model without error', async () => {
    setupMocksForPreload();
    const mockModel = createMockModel([[0.1, 0.9]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { preloadNSFWModel: preloadFresh } = require('../nsfwDetector');
    await expect(preloadFresh()).resolves.not.toThrow();
  });

  it('handles model load failure gracefully', async () => {
    setupMocksForPreload();
    mockLoadTensorflowModel.mockRejectedValue(new Error('Model load failed'));

    const { preloadNSFWModel: preloadFresh } = require('../nsfwDetector');

    const { logWarning: logWarningFresh } = require('@app/utils/logger');

    // Should not throw, just log warning
    await expect(preloadFresh()).resolves.not.toThrow();
    expect(logWarningFresh).toHaveBeenCalled();
  });
});

describe('validateImageContent - with model', () => {
  const setupMocksForValidation = () => {
    mockIsE2EMockEnabled.mockReturnValue(false);
    mockRNFS.exists.mockResolvedValue(true);
    mockRNFS.readFile.mockResolvedValue('bW9ja2RhdGE=');
    mockJpegDecode.mockReturnValue({
      width: 10,
      height: 10,
      data: createMockImageData(10, 10),
    });
  };

  beforeEach(() => {
    jest.resetModules();
  });

  it('returns appropriate=true for safe content', async () => {
    setupMocksForValidation();
    const mockModel = createMockModel([[0.1, 0.9]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { validateImageContent: validateFresh } = require('../nsfwDetector');
    const result = await validateFresh('/path/to/safe.jpg');

    expect(result.isAppropriate).toBe(true);
    expect(result.message).toBe('Content is appropriate');
    expect(result.classification).toBe('Neutral');
  });

  it('returns appropriate=false with message for NSFW content', async () => {
    setupMocksForValidation();
    const mockModel = createMockModel([[0.9, 0.1]]);
    mockLoadTensorflowModel.mockResolvedValue(mockModel);

    const { validateImageContent: validateFresh } = require('../nsfwDetector');
    const result = await validateFresh('/path/to/nsfw.jpg');

    expect(result.isAppropriate).toBe(false);
    expect(result.message).toContain('inappropriate content');
    expect(result.classification).toBe('Porn');
  });

  it('returns appropriate=true on detection error (fail-safe)', async () => {
    setupMocksForValidation();
    mockRNFS.readFile.mockRejectedValue(new Error('File not found'));
    mockLoadTensorflowModel.mockResolvedValue(createMockModel([[0.1, 0.9]]));

    const { validateImageContent: validateFresh } = require('../nsfwDetector');
    const result = await validateFresh('/nonexistent.jpg');

    // Should be appropriate (fail-safe) but with error message
    expect(result.isAppropriate).toBe(true);
  });
});

/**
 * Full integration tests for actual NSFW detection with TensorFlow Lite
 * are performed via E2E tests where the native modules work.
 *
 * E2E tests verify:
 * - NSFW detection works on real images
 * - Classification accuracy is acceptable
 * - Performance is reasonable
 * - Edge cases are handled (drawings, borderline content)
 */
