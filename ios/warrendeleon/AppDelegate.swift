import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash
import RCTLinking
import TrustKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  /// Check if running under Detox E2E testing framework
  private var isRunningUnderDetox: Bool {
    return ProcessInfo.processInfo.arguments.contains("-detoxServer")
  }

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Skip TrustKit in Detox mode - SSL pinning interferes with Detox's websocket communication
    if !isRunningUnderDetox {
      // Configure TrustKit for SSL certificate pinning
      let trustKitConfig: [String: Any] = [
        kTSKSwizzleNetworkDelegates: true,
        kTSKPinnedDomains: [
          "rgsvcwaxzfzqcvtyfcwk.supabase.co": [
            kTSKIncludeSubdomains: true,
            kTSKEnforcePinning: true,
            kTSKPublicKeyHashes: [
              "PzfKSv758ttsdJwUCkGhW/oxG9Wk1Y4N+NMkB5I7RXc=",  // Primary pin (leaf certificate)
              "kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="   // Backup pin (intermediate certificate)
            ]
          ]
        ]
      ]
      TrustKit.initSharedInstance(withConfiguration: trustKitConfig)
    }

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "warrendeleon",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  /// Handle deep links when app is already running (warm starts)
  /// This is required for React Native Linking to receive URL events
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }
}
