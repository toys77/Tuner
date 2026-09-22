export interface PlatformSignals {
  userAgent: string
  platform: string
  maxTouchPoints: number
  navigatorStandalone: boolean
  displayModeStandalone: boolean
}

export function isIosStandalone(signals: PlatformSignals): boolean {
  const iosDevice = /iPhone|iPad|iPod/i.test(signals.userAgent)
    || (signals.platform === 'MacIntel' && signals.maxTouchPoints > 1)
  return iosDevice && (signals.navigatorStandalone || signals.displayModeStandalone)
}

export function getPlatformSignals(): PlatformSignals {
  const iosNavigator = navigator as Navigator & { standalone?: boolean }
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    navigatorStandalone: iosNavigator.standalone === true,
    displayModeStandalone: globalThis.matchMedia?.('(display-mode: standalone)').matches ?? false,
  }
}

export function isCurrentIosStandalone(): boolean {
  return isIosStandalone(getPlatformSignals())
}
