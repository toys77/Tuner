import { describe, expect, it } from 'vitest'
import { midiToNoteParts, noteNameToMidi } from './notes'

describe('note naming', () => {
  it('uses sharp names', () => expect(midiToNoteParts(61, 'sharp')).toEqual({ note: 'C♯', octave: 4 }))
  it('uses flat names', () => expect(midiToNoteParts(61, 'flat')).toEqual({ note: 'D♭', octave: 4 }))
  it('round-trips a named note', () => expect(noteNameToMidi('B', 0)).toBe(23))
})
