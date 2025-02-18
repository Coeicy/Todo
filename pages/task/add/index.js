const app = getApp()

Page({
  data: {
    form: {
      title: '',
      priority: 0,
      startYear: '',
      startMonth: '',
      startDay: '',
      startHour: '',
      startMinute: '',
      endYear: '',
      endMonth: '',
      endDay: '',
      endHour: '',
      endMinute: '',
      location: '',
      notes: '',
      url: ''
    },
    submitLoading: false,
    titleHeight: 44,    // 任务标题高度
    locationHeight: 44, // 地点输入高度
    urlHeight: 44,      // 链接输入高度
    notesHeight: 44,    // 备注高度
    textareaHeights: {}, // 存储每个textarea的实际高度
    keyboardHeight: 0,   // 键盘高度
    attachments: []
  },

  // 表单输入处理
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 设置优先级
  setPriority(e) {
    const priority = parseInt(e.currentTarget.dataset.priority)
    this.setData({
      'form.priority': priority
    })
  },

  // 选择地点
  async chooseLocation() {
    try {
      const location = await wx.chooseLocation();
      this.setData({
        'form.location': location.address
      });
    } catch (err) {
      console.error('选择地点失败:', err);
    }
  },

  // 提交表单
  async submitForm() {
    if (!this.validateForm()) return;
    
    this.setData({ submitLoading: true });
    try {
      await this.saveTask();
      wx.navigateBack();
    } catch (err) {
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    } finally {
      this.setData({ submitLoading: false });
    }
  },

  // 表单验证
  validateForm() {
    const { title } = this.data.form;
    if (!title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  // 保存任务
  async saveTask() {
    try {
      // 1. 整理表单数据
      const taskData = this.formatTaskData();
      
      // 2. 获取现有任务列表
      let tasks = wx.getStorageSync('tasks') || [];
      
      // 3. 生成新任务ID
      const taskId = Date.now().toString();
      taskData.id = taskId;
      
      // 4. 添加新任务到列表开头
      tasks.unshift(taskData);
      
      // 5. 保存更新后的任务列表
      wx.setStorageSync('tasks', tasks);

      // 6. 如果有附件，保存附件信息
      if (this.data.attachments.length > 0) {
        this.saveAttachments(taskId);
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      return taskId;
    } catch (err) {
      console.error('保存任务失败:', err);
      throw err;
    }
  },

  // 格式化任务数据
  formatTaskData() {
    const { form, attachments } = this.data;
    
    // 构建开始时间
    const startTime = this.formatDateTime(
      form.startYear,
      form.startMonth,
      form.startDay,
      form.startHour,
      form.startMinute
    );

    // 构建结束时间
    const endTime = this.formatDateTime(
      form.endYear,
      form.endMonth,
      form.endDay,
      form.endHour,
      form.endMinute
    );

    return {
      title: form.title.trim(),
      priority: form.priority,
      startTime,
      endTime,
      location: form.location.trim(),
      notes: form.notes.trim(),
      url: form.url.trim(),
      attachments: this.data.attachments,
      status: 'pending',
      createTime: Date.now(),
      updateTime: Date.now()
    };
  },

  // 格式化日期时间
  formatDateTime(year, month, day, hour, minute) {
    if (!year || !month || !day) return null;
    
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour) || 0,
      parseInt(minute) || 0
    );
    
    return date.getTime();
  },

  // 保存附件信息
  saveAttachments(taskId) {
    // 获取现有附件列表
    let attachmentsMap = wx.getStorageSync('attachments') || {};
    
    // 保存当前任务的附件
    attachmentsMap[taskId] = this.data.attachments.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      path: file.path,
      createTime: Date.now()
    }));

    // 更新存储
    wx.setStorageSync('attachments', attachmentsMap);
  },

  // 取消
  cancel() {
    wx.navigateBack();
  },

  // 切换重要标记
  toggleImportant() {
    this.setData({
      'form.important': !this.data.form.important
    })
  },

  // 显示复制成功提示
  showCopySuccess(text) {
    wx.showToast({
      title: text,
      icon: 'none',
      duration: 2000,
      style: {
        fontSize: '34rpx'
      }
    })
  },

  // 选择地点
  chooseLocation() {
    const location = this.data.form.location
    if (!location.trim()) {
      wx.showToast({
        title: '请先输入地点',
        icon: 'none'
      })
      return
    }

    // 复制地点文本并显示提示
    wx.setClipboardData({
      data: location,
      success: () => {
        this.showCopySuccess('地点已复制')
      }
    })
  },

  // 打开链接
  openUrl() {
    const url = this.data.form.url
    if (!url.trim()) {
      wx.showToast({
        title: '请先输入链接',
        icon: 'none'
      })
      return
    }
    
    // 复制链接并显示提示
    wx.setClipboardData({
      data: url,
      success: () => {
        this.showCopySuccess('链接已复制')
      }
    })
  },

  // 显示上传选项菜单
  showUploadActionSheet() {
    wx.showActionSheet({
      itemList: ['从聊天记录选择', '拍摄照片/视频', '从相册选择', '录制语音', '选择文件'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.chooseMessageFile()
            break
          case 1:
            this.captureMedia()
            break
          case 2:
            this.chooseImage()
            break
          case 3:
            this.recordVoice()
            break
          case 4:
            this.chooseFile()
            break
        }
      }
    })
  },

  // 从聊天记录选择
  chooseMessageFile() {
    wx.chooseMessageFile({
      count: 5,
      type: 'all',
      success: (res) => {
        this.handleFiles(res.tempFiles)
      }
    })
  },

  // 拍摄照片/视频
  captureMedia() {
    wx.showActionSheet({
      itemList: ['拍摄照片', '录制视频'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.chooseMedia({
            count: 9,
            mediaType: ['image'],
            sourceType: ['camera'],
            success: (res) => {
              this.handleFiles(res.tempFiles)
            }
          })
        } else {
          wx.chooseMedia({
            count: 1,
            mediaType: ['video'],
            sourceType: ['camera'],
            success: (res) => {
              this.handleFiles(res.tempFiles)
            }
          })
        }
      }
    })
  },

  // 从相册选择
  chooseImage() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: ['album'],
      success: (res) => {
        this.handleFiles(res.tempFiles)
      }
    })
  },

  // 录制语音
  recordVoice() {
    const recorderManager = wx.getRecorderManager()
    
    recorderManager.onStop((res) => {
      const { tempFilePath } = res
      this.handleFiles([{
        path: tempFilePath,
        name: '语音录制_' + new Date().toLocaleString(),
        size: 0,
        type: 'voice'
      }])
    })

    wx.showModal({
      title: '录音',
      content: '开始录音后点击确定结束录音',
      success: (res) => {
        if (res.confirm) {
          recorderManager.stop()
        }
      }
    })

    recorderManager.start({
      duration: 600000, // 最长10分钟
      format: 'mp3'
    })
  },

  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 5,
      type: 'file',
      success: (res) => {
        this.handleFiles(res.tempFiles)
      }
    })
  },

  // 统一处理文件
  handleFiles(files) {
    const newAttachments = files.map(async file => {
      const fileInfo = {
        name: file.name || file.originalFileObj?.name || '未命名文件',
        size: this.formatFileSize(file.size || 0),
        path: file.tempFilePath || file.path,
        type: file.type || this.getFileType(file.name || '')
      }

      // 如果是视频，生成封面图
      if (fileInfo.type === 'video') {
        try {
          const coverPath = await this.createVideoCover(fileInfo.path)
          fileInfo.coverPath = coverPath
        } catch (error) {
          console.error('生成视频封面失败:', error)
        }
      }

      return fileInfo
    })

    Promise.all(newAttachments).then(attachments => {
      this.setData({
        attachments: [...this.data.attachments, ...attachments]
      })
    })
  },

  // 生成视频封面
  createVideoCover(videoPath) {
    return new Promise((resolve, reject) => {
      wx.createVideoContext('temp-video').seek(0)
      wx.createVideoContext('temp-video').pause()
      
      setTimeout(() => {
        wx.createVideoContext('temp-video').takeSnapshot({
          success: (res) => {
            resolve(res.tempImagePath)
          },
          fail: reject
        })
      }, 500)
    })
  },

  // 获取文件类型
  getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase()
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    const docExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf']
    const videoExts = ['mp4', 'mov', 'avi', 'wmv']
    const audioExts = ['mp3', 'wav', 'aac']

    if (imageExts.includes(ext)) return 'image'
    if (docExts.includes(ext)) return 'document'
    if (videoExts.includes(ext)) return 'video'
    if (audioExts.includes(ext)) return 'audio'
    return 'file'
  },

  // 删除文件
  deleteFile(e) {
    const { index } = e.currentTarget.dataset
    const attachments = [...this.data.attachments]
    attachments.splice(index, 1)
    this.setData({ attachments })
  },

  // 格式化文件大小
  formatFileSize(size) {
    if (size < 1024) {
      return size + 'B'
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + 'KB'
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(1) + 'MB'
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(1) + 'GB'
    }
  },

  onLineChange(e) {
    const { lineCount } = e.detail;
    const lineHeight = 44; // 每行高度（rpx）
    const textarea = e.target;
    
    // 根据行数动态设置高度
    textarea.style.height = `${lineCount * lineHeight}rpx`;
  },

  onKeyboardHeightChange(e) {
    const { height } = e.detail
    this.setData({ keyboardHeight: height })
    this.adjustHeight()
  },

  adjustHeight() {
    const query = wx.createSelectorQuery()
    query.selectAll('.content-input, .input').boundingClientRect()
    query.exec(res => {
      if (res[0]) {
        const heights = {}
        res[0].forEach(item => {
          const field = item.dataset.field
          heights[field] = item.height + 20 // 添加额外空间
        })
        this.setData({ textareaHeights: heights })
      }
    })
  },

  // 预览文件
  previewFile(e) {
    const { index } = e.currentTarget.dataset
    const file = this.data.attachments[index]
    
    switch (file.type) {
      case 'image':
        // 预览图片
        const imageUrls = this.data.attachments
          .filter(item => item.type === 'image')
          .map(item => item.path)
        wx.previewImage({
          current: file.path,
          urls: imageUrls
        })
        break
        
      case 'video':
        // 播放视频
        wx.previewMedia({
          sources: [{
            url: file.path,
            type: 'video'
          }]
        })
        break
        
      case 'audio':
        // 播放音频
        const audioContext = wx.createInnerAudioContext()
        audioContext.src = file.path
        audioContext.play()
        break
        
      default:
        // 打开文件
        wx.openDocument({
          filePath: file.path,
          showMenu: true,
          success: function (res) {
            console.log('打开文档成功')
          },
          fail: function(error) {
            wx.showToast({
              title: '无法打开此类型文件',
              icon: 'none'
            })
          }
        })
    }
  },

  // 添加预览附件方法
  previewAttachment(e) {
    const attachment = e.currentTarget.dataset.attachment;
    if (attachment.type === 'image') {
      // 图片全屏预览
      wx.previewImage({
        current: attachment.path, // 当前显示图片的链接
        urls: [attachment.path] // 需要预览的图片链接列表
      });
    } else {
      // 其他类型文件的预览
      wx.openDocument({
        filePath: attachment.path,
        success: function (res) {
          console.log('打开文档成功');
        },
        fail: function(error) {
          console.error('打开文档失败', error);
          wx.showToast({
            title: '无法预览该类型文件',
            icon: 'none'
          });
        }
      });
    }
  },

  // 删除附件
  deleteAttachment(e) {
    e.stopPropagation();  // 阻止冒泡，防止触发预览
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '是否删除该附件？',
      success: (res) => {
        if (res.confirm) {
          const attachments = this.data.attachments.filter(item => item.id !== id);
          this.setData({ attachments });
        }
      }
    });
  },
}) 