// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { logId } = event
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  try {
    if (!logId) {
      throw new Error('日志ID不能为空')
    }

    // 获取日志详情
    const log = await db.collection('notification_logs')
      .doc(logId)
      .get()
      .then(res => res.data)

    // 验证权限
    if (log.openid !== wxContext.OPENID) {
      throw new Error('无权访问此日志')
    }

    // 格式化时间
    if (log.createTime) {
      log.createTime = new Date(log.createTime).toLocaleString()
    }

    // 获取关联的导出文件（如果有）
    let exportFile = null
    if (log.exportFileId) {
      exportFile = await db.collection('export_files')
        .doc(log.exportFileId)
        .get()
        .then(res => res.data)
        .catch(() => null)
    }

    return {
      success: true,
      data: {
        ...log,
        exportFile
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
} 