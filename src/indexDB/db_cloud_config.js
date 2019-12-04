export default {
  dbName: 'Cloud', // *数据库名称
  version: 1, // 数据库版本号（默认为当前时间戳）
  tables: [ // *数据库的表，即ObjectStore
    {
      tableName: 'setting', // *表名
      option: { autoIncrement: true }, // 表配置，即ObjectStore配置，此处指明主键为id
      indexs: [ // 数据库索引（建议加上索引）
        {
          key: 'settingKey', // *索引名
          option: { unique: true } // 索引配置，此处表示该字段不允许重复
        }, {
          key: 'settingValue',
          option: { unique: false }
        }
      ]
    }
  ]
}
