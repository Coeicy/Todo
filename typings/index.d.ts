/// <reference path="./wx/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    currentUser?: {
      id: string;
      themeColor: string;
    }
  }
} 