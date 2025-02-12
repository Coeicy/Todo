declare module 'lunar-typescript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    getMonth(): number;
    getDay(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getJieQi(): string;
  }
} 