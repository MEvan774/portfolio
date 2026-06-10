# VoiceRacers WebGL — startup crash report

## TL;DR
The WebGL build boots, then **crashes on the first frame(s)** with a WebAssembly trap:
`RuntimeError: float unrepresentable in integer range`. After that Unity's player loop is
dead and spams `the PlayerLoop internal function has been called recursively` indefinitely.

**Smoking gun:** the game's own log line `VoiceMic: microphone ready @ 48000 Hz` appears
**after** the crash. So the per-frame audio/pitch code starts running **before** `VoiceMic`
has finished its async microphone setup — it reads an empty device / unfilled AudioClip,
produces a `NaN` or `Infinity`, and a `(int)` / `Mathf.FloorToInt`-style cast on that value
traps the WASM VM. This is a **startup race condition in the audio/pitch path** (script
`VoiceMic`), not a rendering or hosting problem. The microphone itself works.

## Environment
- Unity **2020.3.49f1 (18249dd5551b)**, WebGL build (Gzip + Decompression Fallback)
- Browser: Chromium, WebGL 2.0 / OpenGL ES 3.0 (WebKit)
- Embedded in an `<iframe allow="microphone">`; permission is granted (reaches
  "microphone ready @ 48000 Hz"), so audio input works — the bug is about *when* it's used.

## Ordering that matters (init → crash → mic ready)
```
Input Manager initialize...
The referenced script on this Behaviour (Game Object 'Item') is missing!   (x2)
[several PostProcessing/VFX shaders "not supported on this GPU" — cosmetic]
ui is null! please add a ui ref.
Selected device =                         <-- mic device name is EMPTY here
ui is null! please add a ui ref.
Revert to start location true
>>> RuntimeError: float unrepresentable in integer range   <-- CRASH (first frame)
... "PlayerLoop ... called recursively" repeats ...
VoiceMic: microphone ready @ 48000 Hz     <-- mic finishes initializing AFTER the crash
... recursion spam continues ...
```

## The crash
```
exception thrown: RuntimeError: float unrepresentable in integer range
    at wasm://wasm/052328a2   (x16 frames)
    at Object.dynCall_v (...:484405)
    at browserIterationFunc (...:176229)
    at Object.runIter (...:179290)
    at Browser_mainLoop_runner (...:177752)

Uncaught RuntimeError: float unrepresentable in integer range
    at 052328a2:0xbb1586
    at 052328a2:0xbb0d46
    at 052328a2:0xbc50b5
    at 052328a2:0x4aecd5
    at 052328a2:0x45c855
    at 052328a2:0x4a187b
    at 052328a2:0x4a0cec
    at 052328a2:0x437edd
    at 052328a2:0x432cd8
    at 052328a2:0x431fc0
    at 052328a2:0x431367
    at 052328a2:0x40b8c9
    at 052328a2:0x40b8de
    at 052328a2:0x40b463
    at 052328a2:0x40968c
    at 052328a2:0x1270cf2
    at dynCall_v / browserIterationFunc / runIter / Browser_mainLoop_runner
```
Repeated aftermath (a consequence, not the cause):
```
An abnormal situation has occurred: the PlayerLoop internal function has been called recursively...
  $func4215 -> $func4217 -> $func4212 -> $func4169 -> $func10799 -> $func10792 -> $func10946 -> $dynCall_vi
```

## What "float unrepresentable in integer range" means
A WebAssembly trap thrown when converting a `float`/`double` to an integer where the value is
**NaN, ±Infinity, or outside the int range**. In C# that's any `(int)x`, `(long)x`,
`Mathf.FloorToInt`, `Mathf.RoundToInt`, `Mathf.CeilToInt`, etc. On desktop/IL2CPP these casts
silently clamp or wrap; under WebGL/WASM they **trap and kill the player loop**. The trace runs
through `Browser_mainLoop_runner`, so it fires inside `Update`/`FixedUpdate`.

## Where to look (most → least likely)
1. **`VoiceMic`** (named in the logs) and whatever consumes its pitch/sample data each frame.
   The crash precedes "microphone ready", so on the first frames:
   - `Microphone.devices` is empty and/or `Microphone.GetPosition(device) == 0` → an AudioClip of
     length 0 → reading samples / dividing by sample count → `NaN`/`Infinity`.
   - Pitch→steering math (e.g. `(rawPitch - neutralPitch) / pitchRange`) with `pitchRange == 0` or
     an unset `rawPitch` → `NaN`/`Infinity` → later cast to int (bucket index, UI index, etc.).
2. Any `(int)` / `FloorToInt` / `RoundToInt` on a value derived from audio, time, or position
   during the first frames.
3. `ui is null! please add a ui ref.` — a UI reference isn't assigned; wire it regardless.

## Suggested fixes (Unity side)
- **Gate the audio loop until the mic is actually ready.** Don't run pitch analysis until
  `Microphone.devices.Length > 0` **and** `Microphone.GetPosition(device) > 0`. In WebGL,
  `Microphone.Start` returns before `getUserMedia` resolves, so guard with a `bool micReady` flag
  set from `VoiceMic`'s "ready @ 48000 Hz" callback.
- **Sanitize before every int cast:**
  ```csharp
  if (float.IsNaN(v) || float.IsInfinity(v)) v = 0f;
  v = Mathf.Clamp(v, min, max);
  int i = Mathf.FloorToInt(v);
  ```
- **Guard divisors:** ensure `pitchRange`, sample rate, FFT bin width, clip length, etc. are
  non-zero before dividing.
- Assign the missing `ui` reference and fix the missing script on GameObject `Item`.

## Not the cause (safe to ignore for this crash)
- `Content-Encoding: gzip` "reduce startup time" hints — informational; Decompression Fallback
  is handling it.
- `WebGL: INVALID_ENUM: getInternalformatParameter` — benign Unity-2020-WebGL noise.
- `... shader is not supported on this GPU` (PostProcessing/VFX) — those effects won't render on
  WebGL but don't crash.
- `The referenced script on 'Item' is missing` — a missing component; clean up, but unlikely the
  trap source.
```
