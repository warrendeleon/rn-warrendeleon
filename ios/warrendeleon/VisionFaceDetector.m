#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VisionFaceDetector, NSObject)

RCT_EXTERN_METHOD(detectFaces:(NSString *)imageUri
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
