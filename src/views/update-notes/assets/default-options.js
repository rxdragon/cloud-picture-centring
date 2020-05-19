// doc: https://nhnent.github.io/tui.editor/api/latest/ToastUIEditor.html#ToastUIEditor
export default {
  minHeight: '500px',
  height: '100%',
  viewer: true,
  language: 'zh-CN',
  initialEditType: 'wysiwyg',
  initialValue: '',
  previewStyle: 'vertical',
  useCommandShortcut: true,
  useDefaultHTMLSanitizer: true,
  usageStatistics: false,
  hideModeSwitch: false,
  theme: 'forest', // 'default', 'forest', 'dark', 'neutral'
  editorEvents: [
    'load',
    'change',
    'stateChange',
    'focus',
    'blur',
  ],
  toolbarItems: [
    'heading',
    'bold',
    'italic',
    'strike',
    'divider',
    'hr',
    'quote',
    'divider',
    'ul',
    'ol',
    'task',
    'indent',
    'outdent',
    'divider',
    'table',
    'image',
    'link',
    'divider',
    'code',
    'codeblock',
    {
      type: 'button',
      options: {
        $el: '<div>新增</div>',
        name: 'feature',
        text: '新增',
        event: 'feature', // you can use "Bold"
        tooltip: '新增功能',
        style: `line-height: 1;
        background: none;
        color: #3bbc7f;
        width: max-content;`
      }
    },
    {
      type: 'button',
      options: {
        $el: '<div>优化</div>',
        name: 'opt',
        text: '优化',
        event: 'optimize', // you can use "Bold"
        tooltip: '优化功能',
        style: `line-height: 1;
        background: none;
        color: #ff8f00;
        width: max-content;`
      }
    },
    {
      type: 'button',
      options: {
        $el: '<div>修复</div>',
        name: 'fix',
        text: '修复',
        event: 'fix', // you can use "Bold"
        tooltip: '修复功能',
        style: `line-height: 1;
        background: none;
        color: #ff3974;
        width: max-content;`
      }
    }
  ]
}
