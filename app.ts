interface IAppOption {
  globalData: {
    currentUser?: {
      id: string;
      name: string;
      themeColor: string;
    };
  }
}

App<IAppOption>({
  globalData: {},
  onLaunch() {
    wx.cloud.init({
      env: 'your-env-id'
    });
    
    // 这里后续需要添加用户登录和主题色选择的逻辑
  }
}); 