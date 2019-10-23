<template>
  <div class="jurisdiction">
    <div v-for="(moduleItem, moduleIndex) in jurisdictionList" :key="moduleIndex" class="module-box">
      <div class="module-header">
        <el-checkbox
          v-model="moduleItem.setAll"
          :indeterminate="moduleItem.isIndeterminate"
          @change="checkModulePermission(moduleItem)"
        >
          {{ moduleItem.name }}
        </el-checkbox>
      </div>
      <div v-for="(menuItem, menuIndex) in moduleItem.menu" :key="menuIndex" class="menu-box">
        <div class="menu-header">
          <el-checkbox
            v-model="menuItem.setAll"
            :indeterminate="menuItem.isIndeterminate"
            @change="checkAllPermission(menuItem, moduleItem)"
          >
            {{ menuItem.name }}
          </el-checkbox>
        </div>
        <!-- 菜单盒子 -->
        <el-checkbox-group
          v-model="menuItem.checkPermission"
          class="permission-box"
          @change="handlePermission(menuItem, moduleItem)"
        >
          <el-checkbox
            v-for="(permissionItem, permissionIndex) in menuItem.permission"
            :key="permissionIndex"
            :label="permissionItem"
            class="permission-name"
          >
            {{ permissionItem.title }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>
import * as Staff from '@/api/staff'
export default {
  name: 'Jurisdiction',
  model: {
    prop: 'hasPermission',
    event: 'change'
  },
  props: {
    hasPermission: { type: Array, default: () => [] }
  },
  data () {
    return {
      jurisdictionList: []
    }
  },
  watch: {
    hasPermission: {
      handler: 'initializeData',
      immediate: false
    }
  },
  created () {
    this.jurisdictionList = JSON.parse(JSON.stringify(Staff.getJurisdictionList()))
    this.initializeData()
  },
  methods: {
    /**
     * @description 权限更改
     */
    handlePermission (menuItem, moduleItem) {
      const checkedCount = menuItem.checkPermission.length
      menuItem.setAll = checkedCount === menuItem.permission.length
      menuItem.isIndeterminate = checkedCount > 0 && checkedCount < menuItem.permission.length
      if (menuItem.setAll) {
        moduleItem.checkMenu.push(menuItem)
      } else {
        for (const index in moduleItem.checkMenu) {
          if (+menuItem.id === +moduleItem.checkMenu[index].id) {
            moduleItem.checkMenu.splice(index, 1)
          }
        }
      }
      moduleItem.setAll = moduleItem.checkMenu.length === moduleItem.menu.length
      moduleItem.isIndeterminate = menuItem.isIndeterminate !== menuItem.setAll
      this.updateParent()
    },
    /**
     * @description 选中模块全部权限
     */
    checkAllPermission (menuItem, moduleItem) {
      if (menuItem.setAll) {
        moduleItem.checkMenu.push(menuItem)
        moduleItem.setAll = moduleItem.checkMenu.length === moduleItem.menu.length
      } else {
        for (const index in moduleItem.checkMenu) {
          if (menuItem.id === moduleItem.checkMenu[index].id) {
            moduleItem.checkMenu.splice(index, 1)
          }
        }
        moduleItem.setAll = moduleItem.checkMenu.length === moduleItem.menu.length
      }
      menuItem.checkPermission = menuItem.setAll ? menuItem.permission : []
      menuItem.isIndeterminate = false
      moduleItem.isIndeterminate = menuItem.isIndeterminate !== menuItem.setAll
      this.updateParent()
    },
    /**
     * @description 选择全部权限
     * @param moduleItem 模块
     */
    checkModulePermission (moduleItem) {
      if (moduleItem.setAll) {
        for (const skillObj of moduleItem.menu) {
          skillObj.setAll = true
          skillObj.isIndeterminate = false
          skillObj.checkPermission = [...skillObj.permission]
        }
        moduleItem.checkMenu = [...moduleItem.menu]
      } else {
        for (const skillObj of moduleItem.menu) {
          skillObj.setAll = false
          skillObj.checkPermission = []
        }
        moduleItem.checkMenu = []
      }
      this.updateParent()
    },
    /**
     * @description 更父组件绑定权限数据
     */
    updateParent () {
      const updateData = []
      this.jurisdictionList.forEach(mdouleItem => {
        mdouleItem.menu.forEach(menuItem => {
          menuItem.checkPermission.forEach(permissionItem => {
            updateData.push(+permissionItem.id)
          })
        })
      })
      this.$emit('change', updateData)
    },
    /**
     * @description 初始化选择权限
     */
    initializeData () {
      console.log(this.jurisdictionList)
      this.jurisdictionList.forEach(mdouleItem => {
        mdouleItem.checkMenu = []
        mdouleItem.menu.forEach(menuItem => {
          menuItem.checkPermission = []
          menuItem.permission.forEach(permissionItem => {
            // 如果有权限 放进菜单的选择权限中
            if (this.hasPermission.includes(+permissionItem.id)) {
              menuItem.checkPermission.push(permissionItem)
            }
          })
          menuItem.setAll = menuItem.checkPermission.length === menuItem.permission.length
          menuItem.isIndeterminate = Boolean(menuItem.checkPermission.length && !menuItem.setAll)
          if (menuItem.setAll) { mdouleItem.checkMenu.push(menuItem) }
        })
        mdouleItem.setAll = mdouleItem.checkMenu.length === mdouleItem.menu.length
        mdouleItem.isIndeterminate = Boolean(mdouleItem.checkMenu.length && !mdouleItem.setAll)
      })
    }
  }
}
</script>

<style lang="less">
.jurisdiction {
  width: calc(~'100% - 100px');
  .module-box {
    .module-header {
      background-color: #eee;
      width: 100%;
      padding: 10px;
    }

    .menu-box {
      align-items: center;
      display: grid;
      grid-template-columns: 200px 4fr;
      grid-column-gap: 1px;
      background-color: #333;
      border-bottom: 1px solid #333;

      .menu-header {
        padding: 10px;
        background-color: #fff;
        height: 100%;
        display: flex;
      }

      .permission-box {
        display: flex;
        background-color: #fff;
        flex-wrap: wrap;
        height: 100%;

        .permission-name {
          padding: 10px;
          width: 12.5%;
          margin-right: 10px;

          .el-checkbox__input {
            vertical-align: top;
            margin: 4px;
          }

          .el-checkbox__label {
            width: 100%;
            white-space: normal;
          }
        }
      }
    }
  }
}
</style>
