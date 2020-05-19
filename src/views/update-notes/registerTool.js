const tools = [
  {
    type: 'feature',
    tag: '&nbsp;<span class="mark-new">新增</span>&nbsp;'
  },
  {
    type: 'optimize',
    tag: '&nbsp;<span class="mark-opt">优化</span>&nbsp;'
  },
  {
    type: 'fix',
    tag: '&nbsp;<span class="mark-fix">修复</span>&nbsp;'
  }
]

/**
 * @description 批量注册事件
 * @param {*} editor 
 */
export function batchRegisterEvent (editor) {
  tools.forEach(toolItem => {
    registerToolEvent(editor, toolItem.type, toolItem.tag)
  })
}

/**
 * @description 注册事件
 * @param {*} editor 
 */
export function registerToolEvent (editor, type, tag) {
  editor.eventManager.addEventType(type)
  editor.eventManager.listen(type, () => {
    editor.exec(type)
  })
  editor.addCommand('markdown', {
    name: type,
    exec (mde) {
      const cm = mde.getEditor()
      const replacedText = tag
      cm.replaceSelection(replacedText)
      mde.focus()
    }
  })
  editor.addCommand('wysiwyg', {
    name: type,
    exec (wwe) {
      const sq = wwe.getEditor()
      sq.insertHTML(tag)
      sq.focus()
    }
  })
}
