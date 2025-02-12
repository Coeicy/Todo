// 云函数入口文件
const cloud = require('wx-server-sdk')
const xlsx = require('node-xlsx')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { 
    type,
    startDate,
    endDate,
    success
  } = event
  
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command

  try {
    // 构建查询条件
    const query = {
      openid: wxContext.OPENID
    }

    if (type) query.type = type
    if (typeof success === 'boolean') query.success = success
    
    // 日期范围查询
    if (startDate || endDate) {
      query.createTime = {}
      if (startDate) query.createTime = _.gte(new Date(startDate))
      if (endDate) query.createTime = _.lte(new Date(endDate))
    }

    // 获取日志数据
    const logs = await db.collection('notification_logs')
      .where(query)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => res.data)

    // 转换为Excel数据
    const excelData = [
      ['通知类型', '发送时间', '状态', '任务ID', '通知内容', '错误信息']
    ]

    logs.forEach(log => {
      excelData.push([
        log.type,
        new Date(log.createTime).toLocaleString(),
        log.success ? '成功' : '失败',
        log.taskId || '-',
        JSON.stringify(log.data),
        log.error || '-'
      ])
    })

    // 生成Excel文件
    const buffer = xlsx.build([{
      name: '通知日志',
      data: excelData
    }])

    // 上传到云存储
    const fileName = `notification_logs_${Date.now()}.xlsx`
    const uploadResult = await cloud.uploadFile({
      cloudPath: `exports/${fileName}`,
      fileContent: buffer
    })

    // 设置文件过期时间（24小时）
    const expireTime = Date.now() + 24 * 60 * 60 * 1000
    await cloud.database().collection('export_files').add({
      data: {
        fileID: uploadResult.fileID,
        createTime: db.serverDate(),
        expireTime: new Date(expireTime),
        type: 'notification_logs'
      }
    })

    return {
      success: true,
      fileID: uploadResult.fileID
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
} 