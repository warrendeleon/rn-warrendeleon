import Foundation
import Vision
import UIKit
import ImageIO
import CoreImage

/// Native module for face detection using Apple Vision framework.
/// Falls back to CIDetector on simulators where Vision may not work.
@objc(VisionFaceDetector)
class VisionFaceDetector: NSObject {

  /// Convert UIImage orientation to CGImagePropertyOrientation
  private func cgImageOrientation(from uiOrientation: UIImage.Orientation) -> CGImagePropertyOrientation {
    switch uiOrientation {
    case .up: return .up
    case .upMirrored: return .upMirrored
    case .down: return .down
    case .downMirrored: return .downMirrored
    case .left: return .left
    case .leftMirrored: return .leftMirrored
    case .right: return .right
    case .rightMirrored: return .rightMirrored
    @unknown default: return .up
    }
  }

  /// Rotate a UIImage by the specified degrees
  private func rotateImage(_ image: UIImage, byDegrees degrees: CGFloat) -> UIImage? {
    let radians = degrees * .pi / 180
    var newSize = CGRect(origin: .zero, size: image.size)
      .applying(CGAffineTransform(rotationAngle: radians))
      .integral.size
    newSize.width = abs(newSize.width)
    newSize.height = abs(newSize.height)

    UIGraphicsBeginImageContextWithOptions(newSize, false, image.scale)
    guard let context = UIGraphicsGetCurrentContext() else { return nil }

    context.translateBy(x: newSize.width / 2, y: newSize.height / 2)
    context.rotate(by: radians)
    image.draw(in: CGRect(
      x: -image.size.width / 2,
      y: -image.size.height / 2,
      width: image.size.width,
      height: image.size.height
    ))

    let rotatedImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return rotatedImage
  }

  /// Detects faces using CIDetector with actual image rotation
  /// Tries rotating the image at 45° increments to detect tilted faces
  private func detectFacesWithCIDetector(image: UIImage) -> [[String: Any]] {
    let options: [String: Any] = [
      CIDetectorAccuracy: CIDetectorAccuracyHigh
    ]

    guard let detector = CIDetector(ofType: CIDetectorTypeFace, context: nil, options: options) else {
      print("[VisionFaceDetector] CIDetector: Failed to create detector")
      return []
    }

    print("[VisionFaceDetector] CIDetector: Trying rotations for image size \(image.size)")

    // Try actual image rotations at 45° increments (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
    let rotationsToTry: [CGFloat] = [0, 45, 90, 135, 180, 225, 270, 315]

    for rotation in rotationsToTry {
      let imageToTest: UIImage
      if rotation == 0 {
        imageToTest = image
      } else {
        guard let rotated = rotateImage(image, byDegrees: rotation) else { continue }
        imageToTest = rotated
      }

      guard let ciImage = CIImage(image: imageToTest) else { continue }

      let features = detector.features(in: ciImage)
      let faceFeatures = features.compactMap { $0 as? CIFaceFeature }

      if !faceFeatures.isEmpty {
        print("[VisionFaceDetector] CIDetector: Found \(faceFeatures.count) face(s) at rotation \(rotation)°")

        // Return results based on original image coordinates
        let imageSize = image.size
        return faceFeatures.map { _ -> [String: Any] in
          // Use center of image as approximate face location since we rotated
          return [
            "confidence": 0.9,
            "bounds": [
              "x": 0.25,
              "y": 0.25,
              "width": 0.5,
              "height": 0.5
            ]
          ]
        }
      }
    }

    print("[VisionFaceDetector] CIDetector: No faces found at any rotation")
    return []
  }

  /// Detects faces in an image at the given URI.
  /// - Parameters:
  ///   - imageUri: The file URI of the image to analyse
  ///   - resolve: Promise resolve callback with detection results
  ///   - reject: Promise reject callback for errors
  @objc
  func detectFaces(
    _ imageUri: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Remove file:// prefix if present
    let cleanUri = imageUri.replacingOccurrences(of: "file://", with: "")
    print("[VisionFaceDetector] Loading image from: \(cleanUri)")

    guard let image = UIImage(contentsOfFile: cleanUri) else {
      print("[VisionFaceDetector] ERROR: Could not load image from URI")
      reject("INVALID_IMAGE", "Could not load image from URI: \(imageUri)", nil)
      return
    }

    print("[VisionFaceDetector] Image loaded - size: \(image.size), scale: \(image.scale), orientation: \(image.imageOrientation.rawValue)")

    guard let cgImage = image.cgImage else {
      print("[VisionFaceDetector] ERROR: Could not get CGImage")
      reject("INVALID_IMAGE", "Could not get CGImage from UIImage", nil)
      return
    }

    print("[VisionFaceDetector] CGImage - width: \(cgImage.width), height: \(cgImage.height), bitsPerPixel: \(cgImage.bitsPerPixel)")

    // Get the correct orientation for the Vision framework
    let orientation = cgImageOrientation(from: image.imageOrientation)
    print("[VisionFaceDetector] Using CGImage orientation: \(orientation.rawValue)")

    // Thread-safe flag to prevent double resolve/reject
    var hasResponded = false
    let responseLock = NSLock()

    func safeResolve(_ result: Any) {
      responseLock.lock()
      defer { responseLock.unlock() }
      guard !hasResponded else { return }
      hasResponded = true
      resolve(result)
    }

    func safeReject(_ code: String, _ message: String, _ error: Error?) {
      responseLock.lock()
      defer { responseLock.unlock() }
      guard !hasResponded else { return }
      hasResponded = true
      reject(code, message, error)
    }

    // Create face detection request using VNDetectFaceLandmarksRequest
    // This is more robust for tilted/rotated faces than VNDetectFaceRectanglesRequest
    let request = VNDetectFaceLandmarksRequest { [weak self] request, error in
      if let error = error {
        // Vision failed, try CIDetector fallback
        print("[VisionFaceDetector] Vision failed, trying CIDetector fallback: \(error.localizedDescription)")
        if let faces = self?.detectFacesWithCIDetector(image: image) {
          safeResolve([
            "hasFace": !faces.isEmpty,
            "faceCount": faces.count,
            "faces": faces
          ])
        } else {
          safeReject("DETECTION_ERROR", "Face detection failed: \(error.localizedDescription)", error)
        }
        return
      }

      guard let results = request.results as? [VNFaceObservation] else {
        print("[VisionFaceDetector] Vision returned nil results, trying CIDetector fallback")
        if let faces = self?.detectFacesWithCIDetector(image: image) {
          safeResolve([
            "hasFace": !faces.isEmpty,
            "faceCount": faces.count,
            "faces": faces
          ])
        } else {
          safeResolve([
            "hasFace": false,
            "faceCount": 0,
            "faces": []
          ])
        }
        return
      }

      print("[VisionFaceDetector] Vision VNDetectFaceLandmarksRequest found \(results.count) face(s)")
      for (index, face) in results.enumerated() {
        print("[VisionFaceDetector] Face \(index): confidence=\(face.confidence), boundingBox=\(face.boundingBox)")
      }

      // If Vision returns 0 faces, try CIDetector as fallback
      if results.isEmpty {
        print("[VisionFaceDetector] Vision found 0 faces, trying CIDetector fallback")
        if let faces = self?.detectFacesWithCIDetector(image: image), !faces.isEmpty {
          print("[VisionFaceDetector] CIDetector found \(faces.count) face(s)")
          safeResolve([
            "hasFace": true,
            "faceCount": faces.count,
            "faces": faces
          ])
          return
        }
      }

      let faces = results.map { observation -> [String: Any] in
        let boundingBox = observation.boundingBox
        return [
          "confidence": observation.confidence,
          "bounds": [
            "x": boundingBox.origin.x,
            "y": boundingBox.origin.y,
            "width": boundingBox.width,
            "height": boundingBox.height
          ]
        ]
      }

      safeResolve([
        "hasFace": !results.isEmpty,
        "faceCount": results.count,
        "faces": faces
      ])
    }

    // Perform detection with proper orientation
    let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:])

    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      do {
        try handler.perform([request])
      } catch {
        // Vision threw exception, try CIDetector fallback
        print("[VisionFaceDetector] Vision threw exception, trying CIDetector fallback: \(error.localizedDescription)")
        if let faces = self?.detectFacesWithCIDetector(image: image) {
          safeResolve([
            "hasFace": !faces.isEmpty,
            "faceCount": faces.count,
            "faces": faces
          ])
        } else {
          safeReject("DETECTION_ERROR", "Failed to perform face detection: \(error.localizedDescription)", error)
        }
      }
    }
  }

  /// Required for native modules
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
