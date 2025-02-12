Component({
  properties: {
    // 任务列表数据
    tasks: {
      type: Array,
      value: []
    },
    // 是否显示空状态
    showEmpty: {
      type: Boolean,
      value: true
    },
    // 空状态文本
    emptyText: {
      type: String,
      value: '暂无任务'
    }
  },

  methods: {
    // 点击任务项
    onTaskClick(e) {
      const { task } = e.currentTarget.dataset
      this.triggerEvent('click', { task })
    },

    // 切换任务状态
    toggleStatus(e) {
      const { task } = e.currentTarget.dataset
      this.triggerEvent('statusChange', { 
        task,
        completed: !task.completed
      })
      // 阻止事件冒泡
      e.stopPropagation()
    },

    // 切换重要标记
    toggleImportant(e) {
      const { task } = e.currentTarget.dataset
      this.triggerEvent('importantChange', {
        task,
        important: !task.important
      })
      // 阻止事件冒泡
      e.stopPropagation()
    }
  }
}) 