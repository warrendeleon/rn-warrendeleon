# Profile Picture Validation

Profile pictures are validated through face detection and content moderation before upload.

## Overview

Profile pictures go through a two-stage validation before upload:

1. **Face Detection** - Confirms the image contains exactly one clearly visible face
2. **NSFW Detection** - Screens for inappropriate content

Both checks run entirely on-device for privacy and speed.

## Face Detection

### Technology Stack

| Platform | Library                | Description                                                                     |
| -------- | ---------------------- | ------------------------------------------------------------------------------- |
| iOS      | Apple Vision Framework | Uses `VNDetectFaceLandmarksRequest` with CIDetector fallback for rotated images |
| Android  | ML Kit Face Detection  | Via `@infinitered/react-native-mlkit-face-detection`                            |

### How It Works

1. **Image Loading**: Reads the local image file
2. **Face Detection**: Runs platform-specific face detector
3. **Validation Rules**:
   - At least one face must be detected
   - Only one face allowed (profile pictures are personal)
   - Minimum confidence threshold: 70%

### Validation Outcomes

| Result         | Message                                                                 | Action       |
| -------------- | ----------------------------------------------------------------------- | ------------ |
| Valid          | "Face detected"                                                         | Allow upload |
| No face        | "No face detected. Please select a photo that clearly shows your face." | Block upload |
| Multiple faces | "Multiple faces detected. Please select a photo with only your face."   | Block upload |
| Low confidence | "Face not clearly visible. Please select a clearer photo."              | Block upload |

### iOS Native Module

The iOS implementation uses a Swift native module (`VisionFaceDetector`) that:

- Uses Vision framework's `VNDetectFaceLandmarksRequest` for accurate face detection
- Falls back to `CIDetector` with multiple orientation passes for rotated selfies
- Works on both physical devices and simulators
- Returns face bounds and confidence scores

```swift
// Native module interface
VisionFaceDetector.detectFaces(imageUri) -> Promise<{
  hasFace: boolean,
  faceCount: number,
  faces: [{ confidence: number, bounds: { x, y, width, height } }]
}>
```

### Configuration

```typescript
// src/utils/image/faceDetector.ts

// Minimum confidence score (0-1)
export const MIN_FACE_CONFIDENCE = 0.7;

// Default options
const defaultOptions: FaceDetectionOptions = {
  minFaceConfidence: 0.7,
  requireSingleFace: true, // For profile pictures
};
```

## NSFW Content Detection

### Technology Stack

- **Model**: NudeNet TFLite model (~1.5MB)
- **Runtime**: `react-native-fast-tflite` with hardware acceleration
- **Processing**: `jpeg-js` for image decoding

### How It Works

1. **Model Loading**: Lazy-loads TFLite model on first use (cached thereafter)
2. **Image Preprocessing**:
   - Decode JPEG to raw pixel data
   - Resize to 256×256 (model input size)
   - Convert RGB to BGR (NudeNet expectation)
   - Normalise pixel values to [0, 1]
3. **Inference**: Run model to get safe/unsafe probabilities
4. **Classification**: Flag as unsafe if unsafe probability > 50%

### Classification Categories

| Category | Description                  | Safe?      |
| -------- | ---------------------------- | ---------- |
| Neutral  | Normal, appropriate content  | Yes        |
| Drawing  | Artistic/illustrated content | Yes        |
| Sexy     | Suggestive but not explicit  | Borderline |
| Porn     | Explicit adult content       | No         |
| Hentai   | Explicit illustrated content | No         |

### Validation Outcomes

| Result | Message                                                                                 | Action       |
| ------ | --------------------------------------------------------------------------------------- | ------------ |
| Safe   | "Content is appropriate"                                                                | Allow upload |
| Unsafe | "This image appears to contain inappropriate content. Please select a different photo." | Block upload |

### Hardware Acceleration

The model uses platform-specific acceleration:

- **iOS**: CoreML delegate (defaults to CPU when unavailable)
- **Android**: GPU delegate (defaults to CPU when unavailable)

### Model Location

```
iOS:   ios/warrendeleon/Resources/nudenet.tflite
Android: android/app/src/main/assets/nudenet.tflite
```

## Combined Validation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    validateProfilePicture()                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
           ┌──────────────────────────────────────┐
           │     Run in parallel for speed        │
           └──────────────────────────────────────┘
                    │                  │
                    ▼                  ▼
         ┌─────────────────┐  ┌─────────────────┐
         │ Face Detection  │  │ NSFW Detection  │
         └─────────────────┘  └─────────────────┘
                    │                  │
                    ▼                  ▼
         ┌─────────────────┐  ┌─────────────────┐
         │ hasFace: true   │  │ isSafe: true    │
         │ faceCount: 1    │  │ class: Neutral  │
         │ confidence: 0.9 │  │ confidence: 0.95│
         └─────────────────┘  └─────────────────┘
                    │                  │
                    └────────┬─────────┘
                             ▼
                 ┌───────────────────────┐
                 │  Both checks pass?    │
                 └───────────────────────┘
                      │           │
                    Yes           No
                      │           │
                      ▼           ▼
               ┌──────────┐ ┌──────────────────┐
               │  Valid   │ │ Return first     │
               │  Upload  │ │ failure message  │
               └──────────┘ └──────────────────┘
```

## Usage

### Basic Usage

```typescript
import { validateProfilePicture } from '@app/shared/services/media';

const result = await validateProfilePicture('/path/to/image.jpg');

if (result.isValid) {
  // Proceed with upload
  await uploadProfilePicture(imageUri);
} else {
  // Show error to user
  showAlert(result.message);
}
```

### Quick Face Check

```typescript
import { quickFaceCheck } from '@app/shared/services/media';

const hasFace = await quickFaceCheck('/path/to/image.jpg');
if (!hasFace) {
  showWarning('This image may not contain a face');
}
```

### Content Safety Check

```typescript
import { isContentSafe } from '@app/utils/image/nsfwDetector';

const safe = await isContentSafe('/path/to/image.jpg');
if (!safe) {
  showError('Inappropriate content detected');
}
```

## E2E Testing

All validation functions support E2E mocking via the `E2E_MOCK` environment variable:

```typescript
// When E2E_MOCK=true, validation always returns:
{
  isValid: true,
  message: 'Face detected',
  faceCount: 1,
  confidence: 0.95
}
```

This allows E2E tests to bypass native face detection and NSFW checks.

## Performance

| Operation           | Time (typical) | Notes                            |
| ------------------- | -------------- | -------------------------------- |
| Face detection      | 50-200ms       | Platform dependent               |
| NSFW detection      | 100-300ms      | First run slower (model loading) |
| Combined validation | 150-400ms      | Runs in parallel                 |

### Model Preloading

To reduce latency on first validation, preload the NSFW model at app startup:

```typescript
import { preloadNSFWModel } from '@app/utils/image/nsfwDetector';

// In app initialisation
preloadNSFWModel();
```

## Privacy

- All processing happens on-device
- Images never leave the device for validation
- No analytics or logging of image content
- Model files are bundled with the app (no network downloads)

## Error Handling

If either detection system fails, the validation returns a user-friendly error:

```typescript
{
  isValid: false,
  message: 'Unable to validate photo. Please try again.',
  faceValidation: null,
  contentValidation: null
}
```

The NSFW detector defaults to "safe" on error to avoid blocking legitimate uploads. Server-side validation provides backup protection.

## File Structure

```
src/utils/image/
├── faceDetector.ts              # Face detection utility
├── nsfwDetector.ts              # NSFW content detection
├── profilePictureValidator.ts   # Combined validation
├── index.ts                     # Exports
└── __tests__/
    ├── faceDetector.rntl.ts
    ├── nsfwDetector.rntl.ts
    └── profilePictureValidator.rntl.ts

src/shared/services/media/
├── faceDetectionService.ts      # Service layer wrapper
├── index.ts                     # Re-exports validateProfilePicture
└── __tests__/
    └── faceDetectionService.rntl.ts

ios/warrendeleon/
├── VisionFaceDetector.swift     # Native face detection
├── VisionFaceDetector.m         # ObjC bridge
└── Resources/
    └── nudenet.tflite           # NSFW model
```

## Related Tasks

- TASK-197: Profile Picture Picker Component
- TASK-198: Supabase Storage API Client
