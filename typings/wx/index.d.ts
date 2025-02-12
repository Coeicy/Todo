declare namespace WechatMiniprogram {
  interface UserInfo {
    avatarUrl: string
    nickName: string
    gender: number
    country: string
    province: string
    city: string
    language: string
  }

  interface Touch {
    clientX: number;
    clientY: number;
  }

  interface TouchEvent {
    touches: Touch[];
    changedTouches: Touch[];
    currentTarget: {
      dataset: Record<string, any>;
    };
  }

  interface Input {
    detail: {
      value: string;
    };
    currentTarget: {
      dataset: Record<string, any>;
    };
  }
}

declare const wx: {
  cloud: {
    init(config: { env: string }): void;
    database(): {
      collection(name: string): {
        doc(id: string): {
          get(): Promise<any>;
          update(options: { data: any }): Promise<any>;
        };
        get(): Promise<any>;
        add(options: { data: any }): Promise<any>;
      };
    };
    uploadFile(options: {
      cloudPath: string;
      filePath: string;
    }): Promise<{ fileID: string }>;
  };
  navigateTo(options: { url: string }): Promise<void>;
  navigateBack(): void;
  showToast(options: { title: string; icon?: 'success' | 'none' }): void;
  chooseLocation(): Promise<{ name: string; address: string; latitude: number; longitude: number }>;
  chooseMedia(options: {
    count: number;
    mediaType: ('image' | 'video')[];
    sourceType: ('album' | 'camera')[];
  }): Promise<{
    tempFiles: Array<{
      tempFilePath: string;
      size: number;
    }>;
  }>;
  showModal(options: {
    title: string;
    content: string;
    editable?: boolean;
    success?: (res: {
      confirm: boolean;
      content?: string;
    }) => void;
  }): void;
  setStorageSync(key: string, data: any): void;
};

declare function App<T extends Record<string, any>>(app: T): void;
declare function Page<T extends Record<string, any>>(page: T): void;
declare function getApp<T extends Record<string, any>>(): T;
