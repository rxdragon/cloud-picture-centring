<template>
  <transition name="el-notification-fade">
    <div
      :class="['el-notification', customClass, horizontalClass]"
      class="my-notification"
      v-show="visible"
      :style="positionStyle"
      @mouseenter="clearTimer()"
      @mouseleave="startTimer()"
      role="alert"
    >
      <i
        class="el-notification__icon"
        :class="[ typeClass, iconClass ]"
        v-if="type || iconClass">
      </i>
      <div class="el-notification__group my-group" :class="{ 'is-with-icon': typeClass || iconClass }">
        <div class="left-box">
          <h2 class="el-notification__title" v-text="title"></h2>
          <div class="el-notification__content" v-show="message">
            <slot>
              <p v-if="!dangerouslyUseHTMLString">{{ message }}</p>
              <p v-else v-html="message"></p>
            </slot>
          </div>
        </div>
        <div class="operation-box"  v-if="showClose">
          <div class="operation-button close" @click.stop="close">关闭</div>
          <div class="operation-button open" @click.stop="click">查看</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
  let typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error'
  };

  export default {
    data() {
      return {
        visible: false,
        title: '',
        message: '',
        duration: 4500,
        type: '',
        showClose: true,
        customClass: '',
        iconClass: '',
        onClose: null,
        onClick: null,
        closed: false,
        verticalOffset: 0,
        timer: null,
        dangerouslyUseHTMLString: false,
        position: 'top-right'
      };
    },

    computed: {
      typeClass() {
        return this.type && typeMap[this.type] ? `el-icon-${ typeMap[this.type] }` : '';
      },

      horizontalClass() {
        return this.position.indexOf('right') > -1 ? 'right' : 'left';
      },

      verticalProperty() {
        return /^top-/.test(this.position) ? 'top' : 'bottom';
      },

      positionStyle() {
        return {
          [this.verticalProperty]: `${ this.verticalOffset }px`
        };
      }
    },

    watch: {
      closed(newVal) {
        if (newVal) {
          this.visible = false;
          this.$el.addEventListener('transitionend', this.destroyElement);
        }
      }
    },

    methods: {
      destroyElement() {
        this.$el.removeEventListener('transitionend', this.destroyElement);
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },

      click() {
        if (typeof this.onClick === 'function') {
          this.onClick();
          this.closed = true;
        }
      },

      close() {
        this.closed = true;
        if (typeof this.onClose === 'function') {
          this.onClose();
        }
      },

      clearTimer() {
        clearTimeout(this.timer);
      },

      startTimer() {
        if (this.duration > 0) {
          this.timer = setTimeout(() => {
            if (!this.closed) {
              this.close();
            }
          }, this.duration);
        }
      },
      keydown(e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          this.clearTimer(); // detele 取消倒计时
        } else if (e.keyCode === 27) { // esc关闭消息
          if (!this.closed) {
            this.close();
          }
        } else {
          this.startTimer(); // 恢复倒计时
        }
      }
    },
    mounted() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close();
          }
        }, this.duration);
      }
      document.addEventListener('keydown', this.keydown);
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.keydown);
    }
  };
</script>

<style lang="less" scoped>
.my-group {
  display: flex;
  width: 100%;
  margin-right: 0;
}

.left-box {
  width: 100%;
  padding: 14px 0;
  margin-right: 4px;
}

.my-notification {
  padding: 0;
}

.operation-box {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 80px;
  border-left: 1px solid #eee;
  opacity: 0;
  transition: all 0.3s;

  &:hover {
    opacity: 1;
  }

  .operation-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50%;
    font-size: 14px;
    color: #909399;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: rgb(244, 244, 245);
    }
  }

  .close {
    border-bottom: 1px solid #eee;
  }
}
</style>
