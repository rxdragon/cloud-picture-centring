<template>
  <div v-loading="loading" class="jurisdiction">
    <div
      v-for="(moduleItem, moduleIndex) in jurisdictionList"
      :key="moduleIndex"
      class="module-box"
    >
      <div class="module-header">
        <el-checkbox
          v-model="moduleItem.setAll"
          :disabled="moduleItem.isRole"
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
            :disabled="menuItem.isRole"
            :indeterminate="menuItem.isIndeterminate"
            @change="checkMenuAllPermission(menuItem, moduleItem)"
          >
            {{ menuItem.name }}
          </el-checkbox>
        </div>
        <!-- 菜单盒子 -->
        <el-checkbox-group v-model="menuItem.checkPermission" class="permission-box" @change="handlePermission(menuItem, moduleItem)">
          <el-checkbox
            v-for="(permissionItem, permissionIndex) in menuItem.permission"
            :key="permissionIndex"
            :disabled="permissionItem.isRole"
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
    hasPermission: { type: Array, default: () => [] }, // 含有权限
    rolePermission: { type: Array, default: () => [] } // 角色权限
  },
  data () {
    return {
      jurisdictionList: [],
      firstShow: true,
      loading: true
    }
  },
  watch: {
    hasPermission (value) {
      if (this.firstShow && this.jurisdictionList.length) {
        this.initializeData()
      }
    }
  },
  created () {
    this.getJurisdictionList()
  },
  methods: {
    /**
     * @description 获取权限接口
     */
    async getJurisdictionList () {
      const data = await Staff.getJurisdictionList()
      this.jurisdictionList = JSON.parse(JSON.stringify(data))
      if (this.firstShow) {
        this.initializeData()
      }
    },
    /**
     * @description 选中单个权限
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
      if (moduleItem.setAll) {
        moduleItem.isIndeterminate = false
      } else {
        moduleItem.isIndeterminate = moduleItem.menu.some(item => item.isIndeterminate !== item.setAll)
      }
      this.updateParent()
    },
    /**
     * @description 选中模块全部权限
     */
    checkMenuAllPermission (menuItem, moduleItem) {
      if (menuItem.setAll) {
        moduleItem.checkMenu.push(menuItem)
      } else {
        for (const index in moduleItem.checkMenu) {
          if (menuItem.id === moduleItem.checkMenu[index].id) {
            moduleItem.checkMenu.splice(index, 1)
          }
        }
      }
      menuItem.checkPermission = menuItem.setAll ? menuItem.permission : []
      menuItem.isIndeterminate = false
      moduleItem.setAll = moduleItem.checkMenu.length === moduleItem.menu.length
      if (moduleItem.setAll) {
        moduleItem.isIndeterminate = false
      } else {
        moduleItem.isIndeterminate = moduleItem.menu.some(item => item.isIndeterminate !== item.setAll)
      }
      this.updateParent()
    },
    /**
     * @description 选择模块全部权限
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
      moduleItem.isIndeterminate = false
      this.updateParent()
    },
    /**
     * @description 更父组件绑定权限数据
     */
    updateParent () {
      const updateData = []
      this.jurisdictionList.forEach(moduleItem => {
        moduleItem.menu.forEach(menuItem => {
          menuItem.checkPermission.forEach(permissionItem => {
            updateData.push(+permissionItem.id)
          })
        })
      })
      this.firstShow = false
      this.$emit('change', updateData)
    },
    /**
     * @description 初始化选择权限
     */
    initializeData () {
      this.jurisdictionList.forEach(moduleItem => {
        moduleItem.checkMenu = []
        moduleItem.menu.forEach(menuItem => {
          menuItem.checkPermission = []
          menuItem.permission.forEach(permissionItem => {
            // 如果有权限 放进菜单的选择权限中 初始化角色
            permissionItem.isRole = false
            menuItem.isRole = false
            moduleItem.isRole = false
            if (this.rolePermission.includes(+permissionItem.id)) {
              permissionItem.isRole = true
              menuItem.isRole = true
              moduleItem.isRole = true
            }
            if (this.hasPermission.includes(+permissionItem.id)) {
              menuItem.checkPermission.push(permissionItem)
            }
          })
          menuItem.setAll = menuItem.checkPermission.length === menuItem.permission.length
          menuItem.isIndeterminate = Boolean(menuItem.checkPermission.length && !menuItem.setAll)
          if (menuItem.setAll) {
            moduleItem.checkMenu.push(menuItem)
          }
        })
        moduleItem.setAll = moduleItem.checkMenu.length === moduleItem.menu.length
        moduleItem.isIndeterminate = Boolean(moduleItem.checkMenu.length && !moduleItem.setAll)
      })
      this.loading = false
    }
  }
}
</script>

<style lang="less">
.jurisdiction {
  width: calc(~'100% - 100px');
  min-height: 100px;

  .module-box {
    .module-header {
      width: 100%;
      padding: 10px;
      background-color: #eee;
    }

    .menu-box {
      display: grid;
      grid-template-columns: 200px 4fr;
      grid-column-gap: 1px;
      align-items: center;
      background-color: #333;
      border-bottom: 1px solid #333;

      .menu-header {
        display: flex;
        height: 100%;
        padding: 10px;
        background-color: #fff;
      }

      .permission-box {
        display: flex;
        flex-wrap: wrap;
        height: 100%;
        background-color: #fff;

        .permission-name {
          padding: 10px;
          margin-right: 10px;

          .el-checkbox__input {
            margin: 4px;
            vertical-align: top;
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
