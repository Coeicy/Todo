Component({
  properties: {
    count: {
      type: Number,
      value: 0
    },
    dot: {
      type: Boolean,
      value: false
    },
    color: {
      type: String,
      value: '#ff4d4f'
    }
  },

  data: {
    showBadge: false
  },

  observers: {
    'count, dot': function(count, dot) {
      this.setData({
        showBadge: dot || count > 0
      })
    }
  },

  methods: {
    onClick() {
      this.triggerEvent('click')
    }
  }
}) 