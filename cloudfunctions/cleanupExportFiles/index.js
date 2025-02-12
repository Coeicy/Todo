// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const now = new Date()

  try {
    // 查找过期的导出文件记录
    const expiredFiles = await db.collection('export_files')
      .where({
        expireTime: _.lt(now)
      })
      .get()
      .then(res => res.data)

    if (expiredFiles.length === 0) {
      return {
        success: true,
        message: '没有需要清理的文件',
        cleaned: 0
      }
    }

    // 删除云存储中的文件
    const fileIDs = expiredFiles.map(file => file.fileID)
    await cloud.deleteFile({
      fileList: fileIDs
    })

    // 删除数据库记录
    const deletePromises = expiredFiles.map(file => 
      db.collection('export_files').doc(file._id).remove()
    )
    await Promise.all(deletePromises)

    // 记录清理日志
    await db.collection('system_logs').add({
      data: {
        type: 'cleanup_export_files',
        count: expiredFiles.length,
        fileIDs,
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '清理完成',
      cleaned: expiredFiles.length,
      files: fileIDs
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
} 