// quadrant.ts
type Task = {
  id: number;
  content: string;
  completed: boolean;
};

type Quadrant = {
  id: number;
  title: string;
  tasks: Task[];
};

type PageInstance = {
  data: {
    quadrants: Quadrant[];
  };
  setData(data: Partial<PageInstance['data']>): void;
  onLoad(): void;
  loadTasks(): void;
  addTask(e: WechatMiniprogram.TouchEvent): void;
  toggleTask(e: WechatMiniprogram.TouchEvent): void;
  deleteTask(e: WechatMiniprogram.TouchEvent): void;
  saveTasks(): void;
};

Page<PageInstance>({
  setData(data: Partial<PageInstance['data']>): void {
    // 微信小程序内置实现
  },
  data: {
    quadrants: [
      {
        id: 1,
        title: '重要且紧急',
        tasks: [] as Task[]
      },
      {
        id: 2,
        title: '重要不紧急',
        tasks: []
      },
      {
        id: 3,
        title: '紧急不重要',
        tasks: []
      },
      {
        id: 4,
        title: '不紧急不重要',
        tasks: []
      }
    ]
  },

  onLoad() {
    this.loadTasks();
  },

  loadTasks() {
    // TODO: 从本地存储加载任务
  },

  addTask(e: WechatMiniprogram.TouchEvent) {
    const quadrantId = e.currentTarget.dataset.quadrant;
    const quadrant = this.data.quadrants.find(q => q.id === quadrantId);
    if (!quadrant) return;

    wx.showModal({
      title: '添加任务',
      content: '请输入任务内容',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const newTask = {
            id: Date.now(),
            content: res.content,
            completed: false
          };
          quadrant.tasks.push(newTask);
          this.setData({ quadrants: this.data.quadrants });
          this.saveTasks();
        }
      }
    });
  },

  toggleTask(e: WechatMiniprogram.TouchEvent) {
    const { quadrantId, taskId } = e.currentTarget.dataset;
    const quadrant = this.data.quadrants.find(q => q.id === quadrantId);
    if (!quadrant) return;

    const task = quadrant.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.setData({ quadrants: this.data.quadrants });
      this.saveTasks();
    }
  },

  deleteTask(e: WechatMiniprogram.TouchEvent) {
    const { quadrantId, taskId } = e.currentTarget.dataset;
    const quadrant = this.data.quadrants.find(q => q.id === quadrantId);
    if (!quadrant) return;

    wx.showModal({
      title: '删除任务',
      content: '确定要删除该任务吗？',
      success: (res) => {
        if (res.confirm) {
          quadrant.tasks = quadrant.tasks.filter(t => t.id !== taskId);
          this.setData({ quadrants: this.data.quadrants });
          this.saveTasks();
        }
      }
    });
  },

  saveTasks() {
    wx.setStorageSync('quadrantTasks', this.data.quadrants);
  }
});
