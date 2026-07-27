import { useEffect, useMemo, useState } from 'react'
import type { MicrophoneSession } from '../audio/microphone'
import { PitchSmoother } from '../audio/smoothing'
import { calculateRms, detectPitchYin } from '../audio/yinDetector'
import type { AppSettings, DetectorResult, InputStatus } from '../types/tuner'

interface DetectionState {
  result: DetectorResult | null
  rms: number
  inputStatus: InputStatus
}

const INITIAL_STATE: DetectionState = { result: null, rms: 0, inputStatus: 'no-input' }

function classifyInput(rms: number, sensitivity: number): InputStatus {
  if (rms >= 0.99) return 'clipping'
  const adjusted = rms * sensitivity
  if (adjusted < 0.0025) return 'no-input'
  if (adjusted < 0.01) return 'low'
  if (adjusted < 0.22) return 'ok'
  return 'high'
}

export function usePitchDetection(session: MicrophoneSession | null, settings: AppSettings): DetectionState {
  const [state, setState] = useState<DetectionState>(INITIAL_STATE)
  const smoother = useMemo(() => new PitchSmoother(5), [session])

  useEffect(() => {
    if (!session) {
      smoother.reset()
      setState(INITIAL_STATE)
      return
    }
    let frame = 0
    let active = true
    let lastAnalysis = 0
    const buffer = new Float32Array(session.analyser.fftSize)

    const analyze = (now: number) => {
      if (!active) return
      if (now - lastAnalysis >= 55) {
        lastAnalysis = now
        session.analyser.getFloatTimeDomainData(buffer)
        const rms = calculateRms(buffer)
        const inputStatus = classifyInput(rms, settings.inputSensitivity)
        let result: DetectorResult | null = null
        if (inputStatus !== 'no-input' && inputStatus !== 'clipping') {
          const raw = detectPitchYin(buffer, session.context.sampleRate, {
            threshold: 0.14,
            minClarity: inputStatus === 'low' ? 0.82 : 0.72,
          })
          if (raw) result = smoother.push(raw, settings.smoothing, now)
        }
        if (!result && !smoother.isSilent(settings.silenceTimeout, now)) {
          setState((previous) => ({ ...previous, rms, inputStatus }))
        } else {
          setState({ result, rms, inputStatus })
        }
      }
      frame = requestAnimationFrame(analyze)
    }
    frame = requestAnimationFrame(analyze)
    return () => {
      active = false
      cancelAnimationFrame(frame)
      smoother.reset()
    }
  }, [session, settings.inputSensitivity, settings.silenceTimeout, settings.smoothing, smoother])

  return state
}
