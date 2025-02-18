# 数据库与接口设计

## 1. 数据结构

### 1.1 任务数据模型
```typescript
interface Task {
  id: string;                 // 任务ID，格式：yyyyMMddHHmmss + 4位随机数
  title: string;              // 任务标题（文本）
  priority: Priority;         // 优先级（单选）
  startTime?: string;         // 开始时间（可选，ISO格式）
  endTime?: string;          // 结束时间（可选，ISO格式）
  isAllDay: boolean;         // 是否为全天任务
  location: string;          // 任务地点（文本）
  notes: string;             // 任务备注（长文本）
  url: string;               // 任务链接（文本）
  attachments: Attachment[]; // 任务附件
  completed: boolean;        // 是否完成
  createTime: string;        // 创建时间（ISO格式）
}

// 优先级枚举
enum Priority {
  NORMAL = 0,    // 😐 普通
  MEDIUM = 1,    // 🙂 一般
  HIGH = 2,      // 😟 重要
  URGENT = 3     // 😨 紧急
}

// 附件信息
interface Attachment {
  id: string;        // 附件ID
  name: string;      // 文件名
  type: string;      // 文件类型 MIME类型
  size: number;      // 文件大小(bytes)
  path: string;      // 本地存储路径
  thumbnail?: string;// 缩略图路径（图片/视频）
  duration?: number; // 时长（音频/视频，单位：秒）
}
```

## 2. 核心接口

### 2.1 任务管理
```typescript
const TaskManager = {
  // 创建任务
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const now = new Date();
    const task: Task = {
      id: this.generateTaskId(),
      title: taskData.title || '',
      priority: taskData.priority || Priority.NORMAL,
      startTime: taskData.startTime || null,
      endTime: taskData.endTime || null,
      isAllDay: taskData.isAllDay || false,
      location: taskData.location || '',
      notes: taskData.notes || '',
      url: taskData.url || '',
      attachments: [],
      completed: false,
      createTime: now.toISOString()
    };
    
    await this.saveTask(task);
    return task;
  },

  // 更新任务
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = await this.getTask(id);
    if (!task) throw new Error('任务不存在');
    
    const updatedTask = { ...task, ...updates };
    await this.saveTask(updatedTask);
    return updatedTask;
  },

  // 删除任务
  async deleteTask(id: string): Promise<void> {
    const task = await this.getTask(id);
    if (!task) return;
    
    // 删除相关附件
    for (const attachment of task.attachments) {
      await this.deleteAttachmentFile(attachment.path);
    }
    
    await this.removeTask(id);
  }
};
```

### 2.2 时间解析器
```typescript
const TimeParser = {
  // 解析时间文本
  parseTime(text: string): { startTime?: string, endTime?: string, isAllDay: boolean } {
    text = text.trim();
    
    // 处理全天任务
    if (!text) {
      return { isAllDay: true };
    }

    // 处理时间格式
    if (text.match(/^\d{1,2}:\d{2}$/)) {
      // 处理 "14:30" 格式
      return this.parseTimeOnly(text);
    }
    
    if (text.match(/^\d{1,2}(分钟|小时)$/)) {
      // 处理 "30分钟"、"2小时" 格式
      return this.parseDuration(text);
    }
    
    if (text.match(/^\d{1,2}号$/)) {
      // 处理 "15号" 格式
      return this.parseDayOnly(text);
    }
    
    if (text.match(/^\d{1,2}月\d{1,2}号$/)) {
      // 处理 "3月15号" 格式
      return this.parseMonthDay(text);
    }

    // 其他格式...
    return { isAllDay: true };
  },

  // 解析具体时间
  parseTimeOnly(text: string): { startTime: string, isAllDay: false } {
    const [hours, minutes] = text.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return {
      startTime: date.toISOString(),
      isAllDay: false
    };
  },

  // 解析时长
  parseDuration(text: string): { startTime: string, endTime: string, isAllDay: false } {
    const now = new Date();
    const match = text.match(/^(\d+)(分钟|小时)$/);
    const [_, num, unit] = match;
    const duration = unit === '小时' ? Number(num) * 60 : Number(num);
    
    const endTime = new Date(now.getTime() + duration * 60000);
    
    return {
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      isAllDay: false
    };
  }
};
```

### 2.3 附件管理
```typescript
const AttachmentManager = {
  // 添加附件
  async addAttachment(taskId: string, file: File): Promise<Attachment> {
    const task = await TaskManager.getTask(taskId);
    if (!task) throw new Error('任务不存在');

    const attachment = await this.processFile(file);
    task.attachments.push(attachment);
    
    await TaskManager.updateTask(taskId, {
      attachments: task.attachments
    });
    
    return attachment;
  },

  // 处理文件
  async processFile(file: File): Promise<Attachment> {
    const attachment: Attachment = {
      id: this.generateAttachmentId(),
      name: file.name,
      type: file.type,
      size: file.size,
      path: await this.saveFile(file)
    };

    // 处理特殊类型文件
    if (file.type.startsWith('image/')) {
      attachment.thumbnail = await this.createImageThumbnail(file);
    }
    else if (file.type.startsWith('video/')) {
      attachment.thumbnail = await this.createVideoThumbnail(file);
      attachment.duration = await this.getVideoDuration(file);
    }
    else if (file.type.startsWith('audio/')) {
      attachment.duration = await this.getAudioDuration(file);
    }

    return attachment;
  }
};
```

### 2.4 数据存储
```typescript
const Storage = {
  // 保存任务列表
  async saveTasks(tasks: Task[]): Promise<void> {
    await wx.setStorage({
      key: 'tasks',
      data: tasks
    });
  },

  // 读取任务列表
  async getTasks(): Promise<Task[]> {
    try {
      const { data } = await wx.getStorage({ key: 'tasks' });
      return data || [];
    } catch {
      return [];
    }
  },

  // 导出数据
  async exportData(): Promise<string> {
    const tasks = await this.getTasks();
    const data = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      tasks: tasks
    };
    return JSON.stringify(data, null, 2);
  },

  // 导入数据
  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);
      if (!this.validateData(data)) {
        throw new Error('数据格式无效');
      }
      
      const existingTasks = await this.getTasks();
      const mergedTasks = [...existingTasks, ...data.tasks];
      
      await this.saveTasks(mergedTasks);
    } catch (error) {
      throw new Error('导入失败：' + error.message);
    }
  }
};
``` 