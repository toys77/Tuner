export type MicrophoneErrorCode = 'unsupported' | 'denied' | 'unavailable' | 'activation' | 'unknown'

export class MicrophoneError extends Error {
  constructor(public readonly code: MicrophoneErrorCode, message: string) {
    super(message)
    this.name = 'MicrophoneError'
  }
}

export interface MicrophoneSession {
  stream: MediaStream
  context: AudioContext
  analyser: AnalyserNode
  closeAudio(): Promise<void>
  close(): Promise<void>
}

const AUDIO_CONTEXT_START_TIMEOUT = 2_000

function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop())
}

async function resumeAudioContext(context: AudioContext) {
  if (context.state === 'running') return

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      context.resume(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('AudioContext resume timed out')), AUDIO_CONTEXT_START_TIMEOUT)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }

  const resumedState = context.state as AudioContextState
  if (resumedState !== 'running') throw new Error(`AudioContext is ${resumedState}`)
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia || !globalThis.AudioContext) {
    throw new MicrophoneError('unsupported', 'このブラウザはマイク入力に対応していません。')
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
      video: false,
    })
  } catch (error) {
    const name = error instanceof DOMException ? error.name : ''
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      throw new MicrophoneError('denied', 'マイクの使用が許可されていません。')
    }
    if (name === 'NotFoundError' || name === 'NotReadableError') {
      throw new MicrophoneError('unavailable', '利用できるマイクが見つかりません。')
    }
    throw new MicrophoneError('unknown', 'マイクを開始できませんでした。')
  }
}

export async function connectMicrophoneStream(stream: MediaStream): Promise<MicrophoneSession> {
  const context = new AudioContext({ latencyHint: 'interactive' })
  const source = context.createMediaStreamSource(stream)
  const highPass = context.createBiquadFilter()
  highPass.type = 'highpass'
  highPass.frequency.value = 20
  highPass.Q.value = 0.7
  const analyser = context.createAnalyser()
  analyser.fftSize = 8192
  analyser.smoothingTimeConstant = 0
  source.connect(highPass).connect(analyser)

  try {
    await resumeAudioContext(context)
  } catch {
    source.disconnect()
    highPass.disconnect()
    if (context.state !== 'closed') await context.close().catch(() => undefined)
    throw new MicrophoneError('activation', '音声解析を開始できませんでした。もう一度タップしてください。')
  }

  let audioClosed = false
  const closeAudio = async () => {
    if (audioClosed) return
    audioClosed = true
    source.disconnect()
    highPass.disconnect()
    if (context.state !== 'closed') await context.close().catch(() => undefined)
  }

  return {
    stream,
    context,
    analyser,
    closeAudio,
    async close() {
      stopStream(stream)
      await closeAudio()
    },
  }
}

export async function openMicrophone(): Promise<MicrophoneSession> {
  const stream = await requestMicrophoneStream()
  try {
    return await connectMicrophoneStream(stream)
  } catch (error) {
    stopStream(stream)
    throw error
  }
}
