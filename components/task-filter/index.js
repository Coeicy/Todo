Component({
  properties: {
    // 当前选中的过滤器
    current: {
      type: String,
      value: 'all'
    }
  },

  data: {
    filters: [
      { key: 'all', text: '全部' },
      { key: 'today', text: '今天' },
      { key: 'important', text: '重要' },
      { key: 'completed', text: '已完成' }
    ]
  },

  methods: {
    // 切换过滤器
    onFilterChange(e) {
      const { filter } = e.currentTarget.dataset
      if (filter !== this.properties.current) {
        this.triggerEvent('change', { filter })
      }
    }
  }
}) 