export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  priority: 1 | 2 | 3 | 4; // 重要程度：1-最重要，4-最不重要
  completed: boolean;
  creatorId: string;
  themeColor: string;
  attachments?: string[]; // 附件路径数组
  createTime: Date;
  updateTime: Date;
}

export interface TaskGroup {
  title: string;
  tasks: Task[];
}

export interface User {
  id: string;
  name: string;
  themeColor: string;
} 