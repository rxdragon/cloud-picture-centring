<template>
  <div class="transfer-extend">
    <div v-loading="loading" class="transfer" :style="{width,height}">
      <!-- 左侧穿梭框 原料框 -->
      <div class="transfer-left">
        <h3 class="transfer-title">
          <el-checkbox v-model="from_check_all" :indeterminate="from_is_indeterminate" @change="fromAllBoxChange" />
          <span>{{ fromTitle }}</span>
        </h3>
        <!-- 内容区 -->
        <div class="transfer-main">
          <el-input v-if="filter" v-model="filterFrom" prefix-icon="el-icon-search" :placeholder="placeholder" size="small" class="filter-tree" />
          <el-tree
            ref="from-tree"
            :data="self_from_data"
            show-checkbox
            :node-key="nodeKey"
            :default-expanded-keys="from_expanded_keys"
            :props="defaultProps"
            :filter-node-method="filterNodeFrom"
            :default-checked-keys="defaultCheckedKeys"
            :default-expand-all="openAll"
            @check="fromTreeChecked"
          />
        </div>
      </div>
      <!-- 穿梭区 按钮框 -->
      <div class="transfer-center">
        <p class="transfer-center-item">
          <el-button type="primary" :class="{'disable-box': from_disabled}" icon="el-icon-arrow-right" circle :disabled="from_disabled" @click="addToAims" />
        </p>
        <p class="transfer-center-item">
          <el-button type="primary" :class="{'disable-box': to_disabled}" :disabled="to_disabled" icon="el-icon-arrow-left" circle @click="removeToSource" />
        </p>
      </div>
      <!-- 右侧穿梭框 目标框 -->
      <div class="transfer-right">
        <h3 class="transfer-title">
          <el-checkbox v-model="to_check_all" :indeterminate="to_is_indeterminate" @change="toAllBoxChange" />
          <span>{{ toTitle }}({{ to_data_people }})</span>
        </h3>
        <!-- 内容区 -->
        <div class="transfer-main">
          <!-- <slot name='to'></slot> -->
          <el-input v-if="filter" v-model="filterTo" prefix-icon="el-icon-search" :placeholder="placeholder" size="small" class="filter-tree" />
          <el-tree
            slot="to"
            ref="to-tree"
            :data="self_to_data"
            show-checkbox
            :node-key="nodeKey"
            :default-expanded-keys="to_expanded_keys"
            :props="defaultProps"
            :filter-node-method="filterNodeTo"
            :default-expand-all="openAll"
            @check="toTreeChecked"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransferExtend',
  props: {
    // 宽度
    width: { type: String, default: '100%' },
    // 高度
    height: { type: String, default: '320px' },
    // 标题
    title: { type: Array, default: () => ['源列表', '目标列表'] },
    // 穿梭按钮名字
    buttonText: { type: Array, default: () => [] },
    // 源数据
    fromData: { type: Array, default: () => [] },
    // 选中数据
    toData: { type: Array, default: () => [] },
    // el-tree 配置项
    defaultProps: { type: Object, default: () => { return { label: 'label', children: 'children' } } },
    // el-tree node-key 必须唯一
    nodeKey: { type: String, default: 'id' },
    // 自定义 pid参数名
    pid: { type: String, default: 'pid' },
    // 是否只返回叶子节点
    leafOnly: { type: Boolean, default: false },
    // 是否启用筛选
    filter: { type: Boolean, default: false },
    // 是否展开所有节点
    openAll: { type: Boolean, default: false },
    // 穿梭后是否展开节点
    transferOpenNode: { type: Boolean, default: true },
    // 源数据 默认选中节点
    defaultCheckedKeys: { type: Array, default: () => [] },
    // 筛选placeholder
    placeholder: { type: String, default: '输入关键字进行过滤' },
    // 默认穿梭一次默认选中数据
    defaultTransfer: { type: Boolean, default: false },
    // 快速选中
    cacheCheck: { type: Array, default: () => [] }
  },
  data () {
    return {
      from_is_indeterminate: false, // 源数据是否半选
      from_check_all: false, // 源数据是否全选
      to_is_indeterminate: false, // 目标数据是否半选
      to_check_all: false, // 目标数据是否全选
      from_expanded_keys: [], // 源数据展开节点
      to_expanded_keys: [], // 目标数据展开节点
      self_from: [], // 子组件左侧数据
      self_to: [], // 子组件右侧数据
      from_disabled: true, // 添加按钮是否禁用
      to_disabled: true, // 移除按钮是否禁用
      from_check_keys: [], // 源数据选中key数组 以此属性关联穿梭按钮，总全选、半选状态
      to_check_keys: [], // 目标数据选中key数组 以此属性关联穿梭按钮，总全选、半选状态
      filterFrom: '', // 源数据筛选
      filterTo: '', // 目标数据筛选
      loading: false // 是否加载
    }
  },
  computed: {
    // 左侧数据
    self_from_data () {
      const from_array = [...this.fromData, ...this.self_from]
      from_array.forEach(item => {
        item[this.pid] = 0
      })
      return from_array
    },
    // 右侧数据
    self_to_data () {
      const to_array = [...this.toData, ...this.self_to]
      to_array.forEach(item => {
        item[this.pid] = 0
      })
      return to_array
    },
    to_data_people () {
      let peopleNum = 0
      this.self_to_data.forEach(group => {
        peopleNum += group.children.length
      })
      return peopleNum
    },
    // 左侧菜单名
    fromTitle () {
      const [text] = this.title
      return text
    },
    // 右侧菜单名
    toTitle () {
      const [, text] = this.title
      return text
    },
    // 右侧菜单名2
    toTitleSecond () {
      const [, , text] = this.title
      return text
    },
    // 右侧菜单名3
    toTitleThird () {
      const [, , , text] = this.title
      return text
    },
    // 上部按钮名
    fromButton () {
      if (this.buttonText === undefined) {
        return
      }

      const [text] = this.buttonText
      return text
    },
    // 下部按钮名
    toButton () {
      if (this.buttonText === undefined) {
        return
      }
      const [, text] = this.buttonText
      return text
    }
  },
  watch: {
    // 左侧 状态监测
    from_check_keys (val) {
      if (val.length > 0) {
        // 穿梭按钮是否禁用
        this.from_disabled = false
        // 总半选是否开启
        this.from_is_indeterminate = true

        // 总全选是否开启 - 根据选中节点中为根节点的数量是否和源数据长度相等
        const allCheck = val.filter(item => item[this.pid] === 0)
        if (allCheck.length === this.self_from_data.length) {
          // 关闭半选 开启全选
          this.from_is_indeterminate = false
          this.from_check_all = true
        } else {
          this.from_is_indeterminate = true
          this.from_check_all = false
        }
      } else {
        this.from_disabled = true
        this.from_is_indeterminate = false
        this.from_check_all = false
      }
    },
    // 右侧 状态监测
    to_check_keys (val) {
      if (val.length > 0) {
        // 穿梭按钮是否禁用
        this.to_disabled = false
        // 总半选是否开启
        this.to_is_indeterminate = true

        // 总全选是否开启 - 根据选中节点中为根节点的数量是否和源数据长度相等
        const allCheck = val.filter(item => item[this.pid] === 0)
        if (allCheck.length === this.self_to_data.length) {
          // 关闭半选 开启全选
          this.to_is_indeterminate = false
          this.to_check_all = true
        } else {
          this.to_is_indeterminate = true
          this.to_check_all = false
        }
      } else {
        this.to_disabled = true
        this.to_is_indeterminate = false
        this.to_check_all = false
      }
    },
    // 左侧 数据筛选
    filterFrom (val) {
      this.$refs['from-tree'].filter(val)
    },
    // 右侧 数据筛选
    filterTo (val) {
      this.$refs['to-tree'].filter(val)
    },
    toData (val) {
      console.log(val, 'toData')
    },
    // 监视默认选中
    defaultCheckedKeys: {
      handler (val) {
        if (val.length && this.defaultTransfer) {
          this.$nextTick(() => {
            this.from_check_keys = this.defaultCheckedKeys
            this.addToAims()
          })
        }
      },
      immediate: true
    },
    cacheCheck: {
      handler: function (val) {
        this.changeDefault()
      },
      immediate: false
    }
  },
  methods: {
    /**
     * @description 添加按钮
     */
    addToAims () {
      // 获取选中通过穿梭框的keys - 仅用于传送纯净的id数组到父组件同后台通信
      const keys = this.$refs['from-tree'].getCheckedKeys(this.leafOnly)
      // 获取半选通过穿梭框的keys - 仅用于传送纯净的id数组到父组件同后台通信
      const harfKeys = this.$refs['from-tree'].getHalfCheckedKeys()
      // 选中节点数据
      const arrayCheckedNodes = this.$refs['from-tree'].getCheckedNodes(this.leafOnly)
      // 获取选中通过穿梭框的nodes - 仅用于传送选中节点数组到父组件同后台通信需求
      const nodes = JSON.parse(JSON.stringify(arrayCheckedNodes))
      // 半选中节点数据
      const arrayHalfCheckedNodes = this.$refs['from-tree'].getHalfCheckedNodes()
      // 获取半选通过穿梭框的nodes - 仅用于传送选中节点数组到父组件同后台通信需求
      const halfNodes = JSON.parse(JSON.stringify(arrayHalfCheckedNodes))

      // 自定义参数读取设置
      const children__ = this.defaultProps.children || 'children'
      const pid__ = this.pid || 'pid'
      const id__ = this['nodeKey'] || 'id'

      /*
       * 先整合目标树没有父节点的叶子节点选中，需要整理出来此叶子节点的父节点直到根节点路径 - 此时所有骨架节点已有
       * 再将所有末端叶子节点根据pid直接推入目标树即可
       * 声明新盒子将所有半选节点的子节点清除 - 只保留骨架 因为排序是先父后子 因此不存在子元素处理好插入时父元素还没处理的情况
       * 下面一二步是为了搭建出来目标树没有根节点躯干节点时的叶子选中，给此叶子搭建出根节点和躯干节点
       */
      // let不存在状态提升 因此在函数调用之前赋值 并递归为以为数组！
      const self_to_data = JSON.stringify(this.self_to_data)
      // 第一步
      const skeletonHalfCheckedNodes = JSON.parse(JSON.stringify(arrayHalfCheckedNodes)) // 深拷贝数据 - 半选节点
      // 筛选目标树不存在的骨架节点 - 半选内的节点
      const newSkeletonHalfCheckedNodes = []
      skeletonHalfCheckedNodes.forEach(item => {
        if (!inquireIsExist(item)) {
          newSkeletonHalfCheckedNodes.push(item)
        }
      })
      // 筛选到目标树不存在的骨架后在处理每个骨架节点-非末端叶子节点 - 半选节点
      newSkeletonHalfCheckedNodes.forEach(item => {
        item[children__] = []
        if (item[pid__] === 0) {
          this.$refs['to-tree'].append(item)
        } else {
          this.$refs['to-tree'].append(item, item[pid__])
        }
      })
      // 第二步
      /* let cloneSkeletonCheckedNodes = JSON.parse(
        JSON.stringify(arrayCheckedNodes)
      ) // 深拷贝数据 -选中节点 */
      // 筛选目标树不存在的骨架节点 - 全选内的节点
      const newSkeletonCheckedNodes = []
      nodes.forEach(item => {
        if (!inquireIsExist(item)) {
          newSkeletonCheckedNodes.push(item)
        }
      })

      // 筛选到目标树不存在的骨架后在处理每个骨架节点-非末端叶子节点 - 全选节点
      newSkeletonCheckedNodes.forEach(item => {
        if (item[children__] && item[children__].length > 0) {
          item[children__] = []
          this.$refs['to-tree'].append(item, item[pid__])
        }
      })
      // 第三步 处理末端叶子元素 - 声明新盒子筛选出所有末端叶子节点
      const leafCheckedNodes = arrayCheckedNodes.filter(
        item => !item[children__] || item[children__].length === 0
      )
      // 末端叶子插入目标树
      leafCheckedNodes.forEach(item => {
        if (!inquireIsExist(item)) {
          this.$refs['to-tree'].append(item, item[pid__])
        }
      })
      // 递归查询data内是否存在item函数
      function inquireIsExist (item, strData = self_to_data) {
        // 将树形数据格式化成一维字符串 然后通过匹配来判断是否已存在
        const strItem =
          typeof item[id__] === 'number'
            ? `"${id__}":${item[id__]},`
            : `"${id__}":"${item[id__]}"`
        const reg = RegExp(strItem)
        const existed = reg.test(strData)
        return existed
      }
      // 左侧删掉选中数据
      arrayCheckedNodes.map(item => this.$refs['from-tree'].remove(item))
      // 处理完毕按钮恢复禁用状态
      this.from_check_keys = []

      // 目标数据节点展开
      if (this.transferOpenNode) {
        this.to_expanded_keys = keys
      }
      // 传递信息给父组件
      this.$emit('addbtn', this.self_from_data, this.self_to_data, {
        keys,
        nodes,
        harfKeys,
        halfNodes
      })
    },
    /**
     * @description 移除按钮
     */
    removeToSource () {
      // 获取选中通过穿梭框的keys - 仅用于传送纯净的id数组到父组件同后台通信
      const keys = this.$refs['to-tree'].getCheckedKeys(this.leafOnly)
      // 获取半选通过穿梭框的keys - 仅用于传送纯净的id数组到父组件同后台通信
      const harfKeys = this.$refs['to-tree'].getHalfCheckedKeys()
      // 获取选中通过穿梭框的nodes 选中节点数据
      const arrayCheckedNodes = this.$refs['to-tree'].getCheckedNodes(this.leafOnly)
      // 获取选中通过穿梭框的nodes - 仅用于传送选中节点数组到父组件同后台通信需求
      const nodes = JSON.parse(JSON.stringify(arrayCheckedNodes))
      // 半选中节点数据
      const arrayHalfCheckedNodes = this.$refs['to-tree'].getHalfCheckedNodes()
      // 获取半选通过穿梭框的nodes - 仅用于传送选中节点数组到父组件同后台通信需求
      const halfNodes = JSON.parse(JSON.stringify(arrayHalfCheckedNodes))

      // 自定义参数读取设置
      const children__ = this.defaultProps.children || 'children'
      const pid__ = this.pid || 'pid'
      const id__ = this['nodeKey'] || 'id'

      /*
       * 先整合目标树没有父节点的叶子节点选中，需要整理出来此叶子节点的父节点直到根节点路径 - 此时所有骨架节点已有
       * 再将所有末端叶子节点根据pid直接推入目标树即可
       * 声明新盒子将所有半选节点的子节点清除 - 只保留骨架 因为排序是先父后子 因此不存在子元素处理好插入时父元素还没处理的情况
       * 下面一二步是为了搭建出来目标树没有根节点躯干节点时的叶子选中，给此叶子搭建出根节点和躯干节点
       */
      // let不存在状态提升 因此在函数调用之前赋值 并递归为以为数组！
      const self_from_data = JSON.stringify(this.self_from_data)
      // 第一步
      const skeletonHalfCheckedNodes = JSON.parse(
        JSON.stringify(arrayHalfCheckedNodes)
      ) // 深拷贝数据 - 半选节点
      // 筛选目标树不存在的骨架节点 - 半选内的节点
      const newSkeletonHalfCheckedNodes = []
      skeletonHalfCheckedNodes.forEach(item => {
        if (!inquireIsExist(item)) {
          newSkeletonHalfCheckedNodes.push(item)
        }
      })
      // 筛选到目标树不存在的骨架后在处理每个骨架节点-非末端叶子节点 - 半选节点
      newSkeletonHalfCheckedNodes.forEach(item => {
        item[children__] = []
        if (item[pid__] === 0) {
          this.$refs['from-tree'].append(item)
        } else {
          this.$refs['from-tree'].append(item, item[pid__])
        }
      })

      // 第二步
      /* let cloneSkeletonCheckedNodes = JSON.parse(
        JSON.stringify(arrayCheckedNodes)
      ) // 深拷贝数据 -选中节点 */
      // 筛选目标树不存在的骨架节点 - 全选内的节点
      const newSkeletonCheckedNodes = []
      nodes.forEach(item => {
        if (!inquireIsExist(item)) {
          newSkeletonCheckedNodes.push(item)
        }
      })
      // 筛选到目标树不存在的骨架后在处理每个骨架节点-非末端叶子节点 - 全选节点
      newSkeletonCheckedNodes.forEach(item => {
        if (item[children__] && item[children__].length > 0) {
          item[children__] = []
          this.$refs['from-tree'].append(item, item[pid__])
        }
      })

      // 第三步 处理末端叶子元素 - 声明新盒子筛选出所有末端叶子节点
      const leafCheckedNodes = arrayCheckedNodes.filter(
        item => !item[children__] || item[children__].length === 0
      )
      // 末端叶子插入目标树
      leafCheckedNodes.forEach(item => {
        if (!inquireIsExist(item)) {
          this.$refs['from-tree'].append(item, item[pid__])
        }
      })
      // 递归查询data内是否存在item函数
      function inquireIsExist (item, strData = self_from_data) {
        // 将树形数据格式化成一维字符串 然后通过匹配来判断是否已存在
        const strItem =
          typeof item[id__] === 'number'
            ? `"${id__}":${item[id__]},`
            : `"${id__}":"${item[id__]}"`
        const reg = RegExp(strItem)
        const existed = reg.test(strData)
        return existed
      }
      // 右侧删掉选中数据
      arrayCheckedNodes.forEach(item => {
        this.$refs['to-tree'].remove(item)
      })
      console.log('time')
      // 处理完毕按钮恢复禁用状态
      this.to_check_keys = []

      // 目标数据节点展开
      if (this.transferOpenNode) {
        this.from_expanded_keys = keys
      }

      // 传递信息给父组件
      this.$emit('removebtn', this.self_from_data, this.self_to_data, {
        keys,
        nodes,
        harfKeys,
        halfNodes
      })
    },
    /**
     * @description 源树选中事件 - 是否禁用穿梭按钮
     * @param {*} nodeObj
     * @param {*} treeObj
     */
    fromTreeChecked (nodeObj, treeObj) {
      this.from_check_keys = treeObj.checkedNodes
    },
    /**
     * @description 目标树选中事件 - 是否禁用穿梭按钮
     * @param {*} nodeObj
     * @param {*} treeObj
     */
    toTreeChecked (nodeObj, treeObj) {
      this.to_check_keys = treeObj.checkedNodes
    },
    /**
     * @description 源数据 总全选checkbox
     * @param {*} val
     */
    fromAllBoxChange (val) {
      if (this.self_from_data.length === 0) {
        return
      }
      if (val) {
        this.from_check_keys = this.self_from_data
        this.$refs['from-tree'].setCheckedNodes(this.self_from_data)
      } else {
        this.$refs['from-tree'].setCheckedNodes([])
        this.from_check_keys = []
      }
    },
    /**
     * @description 目标数据 总全选checkbox
     * @param {*} params
     */
    toAllBoxChange (val) {
      if (this.self_to_data.length === 0) {
        return
      }
      if (val) {
        this.to_check_keys = this.self_to_data
        this.$refs['to-tree'].setCheckedNodes(this.self_to_data)
      } else {
        this.$refs['to-tree'].setCheckedNodes([])
        this.to_check_keys = []
      }
    },
    /**
     * @description 源数据 筛选
     * @param {*} value
     * @param {*} data
     */
    filterNodeFrom (value, data) {
      if (!value) return true
      return data[this.defaultProps.label].indexOf(value) !== -1
    },
    //
    /**
     * @description 目标数据筛选
     * @param {*} value
     * @param {*} data
     */
    filterNodeTo (value, data) {
      if (!value) return true
      return data[this.defaultProps.label].indexOf(value) !== -1
    },
    /**
     * @description 选中快捷选项
     */
    changeDefault () {
      this.loading = true
      this.to_check_keys = this.self_to_data
      this.$refs['to-tree'].setCheckedNodes(this.self_to_data)
      this.removeToSource()
      const defaultCheckKey = [...new Set([...this.cacheCheck, ...this.defaultCheckedKeys])]
      this.$refs['from-tree'].setCheckedKeys(defaultCheckKey)
      this.$nextTick(() => {
        this.addToAims()
        this.from_check_keys = JSON.parse(JSON.stringify(defaultCheckKey))
        this.loading = false
      })
    }
  }
}
</script>

<style lang="less">
@import "~@/styles/variables.less";

.transfer {
  position: relative;
  overflow: hidden;

  .el-tree {
    min-width: 100%;
    display: inline-block !important;
  }

  .transfer-left {
    left: 0;
  }

  .transfer-right {
    right: 0;
  }

  .transfer-left,
  .transfer-right {
    position: absolute;
    top: 0;
    border: 1px solid @borderColor;
    width: 40%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 5px;
    vertical-align: middle;
    background-color: #fff;
  }

  .transfer-main {
    padding: 10px;
    height: calc(100% - 41px);
    box-sizing: border-box;
    overflow: auto;

    .el-input {
      width: 100% !important;
      margin-right: 0 !important;

      input {
        border-color: #dcdfe6 !important;
      }
    }
  }

  .transfer-center {
    position: absolute;
    top: 50%;
    left: 40%;
    width: 20%;
    transform: translateY(-50%);
    text-align: center;

    .disable-box {
      background-color: #f5f7fa;
      color: #c0c4cc;
      border: 1px solid #dcdfe6;
    }
  }

  .transfer-center-item {
    padding: 10px;
    overflow: hidden;
  }

  .transfer-title {
    border-bottom: 1px solid @borderColor;
    height: 40px;
    line-height: 40px;
    color: #333;
    font-size: 16px !important;
    background-color: #f5f7fa;
    width: 100%;
    margin: 0 !important;
    padding-left: 10px;

    .el-checkbox {
      margin-right: 10px;
    }
  }

  .filter-tree {
    margin-bottom: 10px;
  }
}
</style>
