// 简单的 Markdown 解析函数
function marked(text) {
  if (!text) return '';
  
  // 转义 HTML 特殊字符
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return text
    // 标题
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 引用
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // 列表
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
    // 处理列表包装
    .replace(/(<li>.*<\/li>)\n(<li>.*<\/li>)/g, '<ul>$1$2</ul>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // 换行
    .replace(/\n/g, '<br>');
}

module.exports = marked; 