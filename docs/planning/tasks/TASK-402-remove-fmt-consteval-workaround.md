# TASK-402: Remove fmt FMT_USE_CONSTEVAL=0 workaround when no longer needed

**Task ID**: TASK-402
**Title**: Drop the Podfile post_install hook that forces FMT_USE_CONSTEVAL=0 on the fmt target
**Status**: 🔲 To Do (waiting on React Native to bump fmt)
**Priority**: Low (cleanup, no user impact)
**Created**: 2026-05-04
**Assigned To**: Warren de Leon
**Category**: Build / Tech Debt

---

## Context

`ios/Podfile` carries a `post_install` hook that defines
`FMT_USE_CONSTEVAL=0` on the `fmt` target. Without it, builds fail under
Xcode 26+ / Apple Clang 17 with `call to consteval function ... is not a
constant expression` errors inside `Pods/fmt/include/fmt/format-inl.h`.

This is a workaround for an upstream version mismatch — the fmt version
React Native pulls in transitively predates Apple Clang 17's stricter
constant-expression rules. fmt has fixed this in newer releases; React
Native will bump fmt eventually. When that happens, the workaround
becomes dead code.

Full background, alternatives considered, and what didn't work:
[[xcode-26-fmt-consteval-rn]] in the wiki.

## When to do this task

**Trigger**: any of:

1. React Native is bumped to a version whose bundled fmt podspec points
   at fmt 11.x or later (check `node_modules/react-native/third-party-podspecs/`
   and `Pods/fmt/` after `bundle exec pod install`)
2. The user manually overrides the fmt version in the Podfile to one
   known to handle consteval correctly under Apple Clang 17
3. A new Apple Clang release loosens the constant-expression rules
   enough that the existing fmt builds cleanly (unlikely; tightening is
   usually one-way)

**Smoke test before removal**:

```bash
# 1. Comment out the entire workaround block in ios/Podfile (between the
#    "TEMPORARY WORKAROUND" markers).
# 2. Re-install pods so the change takes effect.
cd ios && bundle exec pod install && cd ..

# 3. Try a clean build for both Detox and regular Debug.
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild \
  -workspace ios/warrendeleon.xcworkspace \
  -scheme warrendeleon -configuration Debug -sdk iphonesimulator \
  -derivedDataPath ios/build_test -arch arm64 ONLY_ACTIVE_ARCH=YES \
  build > /tmp/build_test.log 2>&1
echo "Exit: $?"
grep -E "BUILD SUCCEEDED|BUILD FAILED" /tmp/build_test.log | tail -1
```

If both builds succeed: delete the workaround block, delete this task
file, delete the wiki page (or move it to an "archived" section), commit.

If either build fails with the same fmt errors: restore the block, the
trigger wasn't actually met. Try again next RN bump.

## What to delete when done

1. The entire workaround block in `ios/Podfile` (between the "TEMPORARY
   WORKAROUND" `─` markers — about 18 lines)
2. This task file (`docs/planning/tasks/TASK-402-remove-fmt-consteval-workaround.md`)
3. The wiki page `~/.wiki/wiki/personal/xcode-26-fmt-consteval-rn.md`
   (or move it to a wiki "historical incompatibilities" section if you
   want to keep the lessons-learned record — see the user's wiki memory
   convention about not deleting wiki content)
4. Any references in `rn-project-roadmap.md` if it tracks build-state
   workarounds

## Why this task instead of just "future-me will notice"

The hook prints a yellow `[Podfile] ⚠️ Applying fmt FMT_USE_CONSTEVAL=0
workaround (TASK-402). Verify still needed when bumping RN or Xcode.`
on every `bundle exec pod install`. That nags. But nags get tuned out.
A discoverable task file in `docs/planning/tasks/` is the durable
reminder — it shows up in `ls docs/planning/tasks/` and in any task
review without needing to re-derive the context.

## Source

Surfaced 2026-05-04 while validating FU-08 (TrustKit Detox-skip
compile-time flag) on Xcode 26.4.1. The fmt incompatibility blocked
end-to-end binary inspection until the workaround landed in the Podfile
(commit see `git log -- ios/Podfile`).
