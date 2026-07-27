export type MicrophoneErrorCode = 'unsupported' | 'denied' | 'unavailable' | 'unknown'

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
  close(): Promise<void>
}

export async function openMicrophone(): Promise<MicrophoneSession> {
  if (!navigator.mediaDevices?.getUserMedia || !globalThis.AudioContext) {
    throw new MicrophoneError('unsupported', 'このブラウザはマイク入力に対応していません。')
  }
  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
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

  const context = new AudioContext({ latencyHint: 'interactive' })
  await context.resume()
  const source = context.createMediaStreamSource(stream)
  const highPass = context.createBiquadFilter()
  highPass.type = 'highpass'
  highPass.frequency.value = 20
  highPass.Q.value = 0.7
  const analyser = context.createAnalyser()
  analyser.fftSize = 8192
  analyser.smoothingTimeConstant = 0
  source.connect(highPass).connect(analyser)

  return {
    stream,
    context,
    analyser,
    async close() {
      stream.getTracks().forEach((track) => track.stop())
      if (context.state !== 'closed') await context.close()
    },
  }
}
