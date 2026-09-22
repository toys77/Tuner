import { describe, expect, it } from 'vitest'
import { isIosStandalone, type PlatformSignals } from './platform'

const base: PlatformSignals = {
  userAgent: 'Mozilla/5.0',
  platform: 'Win32',
  maxTouchPoints: 0,
  navigatorStandalone: false,
  displayModeStandalone: false,
}

describe('isIosStandalone', () => {
  it('recognizes an iPhone launched from the Home Screen', () => {
    expect(isIosStandalone({
      ...base,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
      platform: 'iPhone',
      navigatorStandalone: true,
    })).toBe(true)
  })

  it('recognizes iPadOS desktop user agents in standalone display mode', () => {
    expect(isIosStandalone({
      ...base,
      platform: 'MacIntel',
      maxTouchPoints: 5,
      displayModeStandalone: true,
    })).toBe(true)
  })

  it('does not treat a normal Safari tab or desktop PWA as iOS standalone', () => {
    expect(isIosStandalone({ ...base, userAgent: 'Mozilla/5.0 (iPhone)', platform: 'iPhone' })).toBe(false)
    expect(isIosStandalone({ ...base, displayModeStandalone: true })).toBe(false)
  })
})
