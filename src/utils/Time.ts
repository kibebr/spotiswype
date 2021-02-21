export const msToS = (ms: number): number => ms / 1000
export const msToM = (ms: number): number => ms / 60000

export const msToMMSS = (ms: number): [number, number] => [
  Math.floor(ms / 60000),
  (ms % 60000) / 1000
]

export const mmssToString = (mms: [number, number]): string => `${mms[0]}:${(mms[1] < 10 ? '0' : '')}` + `${mms[1]}`
