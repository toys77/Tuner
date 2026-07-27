import { useCallback, useEffect, useRef, useState } from 'react'

interface ToneNodes {
  context: AudioContext
  oscillators: OscillatorNode[]
  gain: GainNode
}

export function useReferenceTone() {
  const [playing, setPlaying] = useState(false)
  const [frequency, setFrequency] = useState(440)
  const [volume, setVolumeState] = useState(0.22)
  const nodes = useRef<ToneNodes | null>(null)

  const stop = useCallback(() => {
    const current = nodes.current
    if (!current) return
    current.gain.gain.setTargetAtTime(0, current.context.currentTime, 0.025)
    window.setTimeout(() => {
      current.oscillators.forEach((oscillator) => { try { oscillator.stop() } catch { /* already stopped */ } })
      void current.context.close()
    }, 120)
    nodes.current = null
    setPlaying(false)
  }, [])

  const play = useCallback(async (nextFrequency: number) => {
    stop()
    const context = new AudioContext({ latencyHint: 'interactive' })
    await context.resume()
    const gain = context.createGain()
    const master = context.createGain()
    gain.gain.value = 0
    master.gain.value = volume
    gain.connect(master).connect(context.destination)
    const fundamental = context.createOscillator()
    fundamental.type = 'sine'
    fundamental.frequency.value = nextFrequency
    const overtone = context.createOscillator()
    overtone.type = 'triangle'
    overtone.frequency.value = nextFrequency * 2
    const overtoneGain = context.createGain()
    overtoneGain.gain.value = 0.12
    fundamental.connect(gain)
    overtone.connect(overtoneGain).connect(gain)
    fundamental.start()
    overtone.start()
    gain.gain.setTargetAtTime(0.72, context.currentTime, 0.035)
    nodes.current = { context, oscillators: [fundamental, overtone], gain: master }
    setFrequency(nextFrequency)
    setPlaying(true)
  }, [stop, volume])

  const setVolume = useCallback((next: number) => {
    const value = Math.min(0.6, Math.max(0, next))
    setVolumeState(value)
    if (nodes.current) nodes.current.gain.gain.setTargetAtTime(value, nodes.current.context.currentTime, 0.02)
  }, [])

  useEffect(() => stop, [stop])
  return { playing, frequency, volume, play, stop, setVolume }
}
