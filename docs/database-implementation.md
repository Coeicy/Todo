# 本地数据库实现

## 1. 数据库工具类 (utils/db.js)

```javascript
const DB = {
  // 数据库初始化
  init() {
    try {
      // 确保存储结构完整
      if (!wx.getStorageSync('tasks')) {
        wx.setStorageSync('tasks', []);
      }
      if (!wx.getStorageSync('attachments')) {
        wx.setStorageSync('attachments', []);
      }
      return true;
    } catch (error) {
      console.error('数据库初始化失败:', error);
      return false;
    }
  },

  // 任务相关方法
  tasks: {
    // 创建任务
    create(taskData) {
      try {
        const tasks = wx.getStorageSync('tasks') || [];
        const now = new Date();
        
        // 生成任务ID: yyyyMMddHHmmss + 4位随机数
        const timestamp = now.toISOString()
          .replace(/[-:T.Z]/g, '')
          .slice(0, 14);
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0');
        
        const task = {
          id: timestamp + random,
          title: taskData.title || '',
          priority: taskData.priority || 0,
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

        tasks.push(task);
        wx.setStorageSync('tasks', tasks);
        return task;
      } catch (error) {
        console.error('创建任务失败:', error);
        throw error;
      }
    },

    // 更新任务
    update(id, updates) {
      try {
        const tasks = wx.getStorageSync('tasks');
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('任务不存在');

        const updatedTask = { ...tasks[index], ...updates };
        tasks[index] = updatedTask;
        wx.setStorageSync('tasks', tasks);
        return updatedTask;
      } catch (error) {
        console.error('更新任务失败:', error);
        throw error;
      }
    },

    // 删除任务
    delete(id) {
      try {
        const tasks = wx.getStorageSync('tasks');
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        // 删除相关附件
        task.attachments.forEach(attachment => {
          this.attachments.delete(attachment.id);
        });

        wx.setStorageSync('tasks', tasks.filter(t => t.id !== id));
      } catch (error) {
        console.error('删除任务失败:', error);
        throw error;
      }
    },

    // 获取所有任务
    getAll() {
      return wx.getStorageSync('tasks') || [];
    },

    // 获取单个任务
    get(id) {
      const tasks = wx.getStorageSync('tasks');
      return tasks.find(t => t.id === id);
    },

    // 按条件查询任务
    query(conditions = {}) {
      let tasks = this.getAll();

      // 按日期范围筛选
      if (conditions.startDate) {
        tasks = tasks.filter(t => new Date(t.startTime) >= new Date(conditions.startDate));
      }
      if (conditions.endDate) {
        tasks = tasks.filter(t => new Date(t.endTime) <= new Date(conditions.endDate));
      }

      // 按优先级筛选
      if (typeof conditions.priority !== 'undefined') {
        tasks = tasks.filter(t => t.priority === conditions.priority);
      }

      // 按完成状态筛选
      if (typeof conditions.completed !== 'undefined') {
        tasks = tasks.filter(t => t.completed === conditions.completed);
      }

      return tasks;
    }
  },

  // 附件相关方法
  attachments: {
    // 添加附件
    async add(taskId, file) {
      try {
        const task = DB.tasks.get(taskId);
        if (!task) throw new Error('任务不存在');

        const attachment = await this.processFile(file);
        task.attachments.push(attachment);
        
        DB.tasks.update(taskId, {
          attachments: task.attachments
        });
        
        return attachment;
      } catch (error) {
        console.error('添加附件失败:', error);
        throw error;
      }
    },

    // 处理文件
    async processFile(file) {
      try {
        const attachment = {
          id: this.generateId(),
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
      } catch (error) {
        console.error('处理文件失败:', error);
        throw error;
      }
    },

    // 删除附件
    async delete(id) {
      try {
        const tasks = DB.tasks.getAll();
        for (const task of tasks) {
          const index = task.attachments.findIndex(a => a.id === id);
          if (index !== -1) {
            const attachment = task.attachments[index];
            // 删除文件
            await wx.removeSavedFile({
              filePath: attachment.path
            });
            if (attachment.thumbnail) {
              await wx.removeSavedFile({
                filePath: attachment.thumbnail
              });
            }
            // 更新任务
            task.attachments.splice(index, 1);
            DB.tasks.update(task.id, {
              attachments: task.attachments
            });
            break;
          }
        }
      } catch (error) {
        console.error('删除附件失败:', error);
        throw error;
      }
    }
  },

  // 数据导入导出
  data: {
    // 导出数据
    export() {
      try {
        const data = {
          version: '1.0',
          exportTime: new Date().toISOString(),
          tasks: DB.tasks.getAll()
        };
        return JSON.stringify(data, null, 2);
      } catch (error) {
        console.error('导出数据失败:', error);
        throw error;
      }
    },

    // 导入数据
    import(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (!this.validateData(data)) {
          throw new Error('数据格式无效');
        }
        
        const existingTasks = DB.tasks.getAll();
        const mergedTasks = [...existingTasks, ...data.tasks];
        
        wx.setStorageSync('tasks', mergedTasks);
      } catch (error) {
        console.error('导入数据失败:', error);
        throw error;
      }
    },

    // 验证数据格式
    validateData(data) {
      return (
        data &&
        typeof data === 'object' &&
        Array.isArray(data.tasks) &&
        data.version &&
        data.exportTime
      );
    }
  }
};

module.exports = DB;
```

## 2. 使用示例

```javascript
// 页面中使用
const db = require('../../utils/db')

Page({
  async onLoad() {
    // 初始化数据库
    db.init();
    
    // 创建任务
    const task = await db.tasks.create({
      title: '项目会议',
      priority: 2,
      startTime: '2024-01-20T14:30:00.000Z',
      endTime: '2024-01-20T16:00:00.000Z',
      location: '会议室A',
      notes: '讨论项目进度'
    });

    // 添加附件
    const attachment = await db.attachments.add(
      task.id,
      {
        name: 'meeting.pdf',
        type: 'application/pdf',
        size: 1024576,
        // ... 文件数据
      }
    );

    // 查询任务
    const todayTasks = db.tasks.query({
      startDate: new Date().toISOString().split('T')[0],
      completed: false
    });

    // 导出数据
    const backup = db.data.export();
  }
});
``` 