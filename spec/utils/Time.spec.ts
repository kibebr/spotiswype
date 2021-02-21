import {
  msToS,
  msToM, 
  msToMMSS,
  mmssToString
} from '../../src/utils/Time'

describe('Utils', () => {
  describe('Time', () => {
    describe('Milliseconds to seconds', () => {
      it('converts 10000ms to 10s', () => {
        expect(msToS(10000)).toBe(10)
      })

      it('converts 0ms to 0s', () => {
        expect(msToS(0)).toBe(0)
      })
    })

    describe('Milliseconds to minutes', () => {
      it('converts 30000ms to 5m', () => {
        expect(msToM(300000)).toBe(5)
      })

      it('converts 780000ms to 13m', () => {
        expect(msToM(780000)).toBe(13)
      })
    })

    describe('Milliseconds to [MM, SS] where SS >= 0 && SS <= 60 ', () => {
      it('converts 300000ms to [5, 0]', () => {
        expect(msToMMSS(300000)).toStrictEqual([5, 0])
      })

      it('converts 780000ms to [13, 0]', () => {
        expect(msToMMSS(780000)).toStrictEqual([13, 0])
      })

      it('converts 810000ms to [13, 30]', () => {
        expect(msToMMSS(810000)).toStrictEqual([13, 30])
      })

      it('converts 787000ms to [13, 7]', () => {
        expect(msToMMSS(787000)).toStrictEqual([13, 7])
      })
    })

    describe('[MM, SS] to string, if SS === 7 then SS must turn into <string>07', () => {
      it('converts [5, 0] to 5:00', () => {
        expect(mmssToString([5, 0])).toBe('5:00')
      })

      it('converts [13, 4] to 13:04', () => {
        expect(mmssToString([13, 4])).toBe('13:04')
      })

      it('converts [3, 9] to 3:09', () => {
        expect(mmssToString([3, 9])).toBe('3:09')
      })

      it('converts [4, 20] to 4:20', () => {
        expect(mmssToString([4, 20])).toBe('4:20')
      })
    })
  })
})
