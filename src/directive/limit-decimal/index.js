import Vue from 'vue'
Vue.directive('decimalOnly', {
  inserted: (el, bind) => {
    el.addEventListener('keyup', () => {
      const reg = /^\d+\.?\d{0,2}$/g
      const reg2 = /\d+\.?\d{0,2}/g
      const val = event.target.value
      const has = !reg.test(val)
      if (el.__vue__) {
        el.__vue__.isComposing = false
      }
      if (has) {
        const regArr = reg2.exec(val)
        const trueText = regArr ? regArr[0] : ''
        event.target.value = trueText
        if (el.__vue__) {
          el.__vue__.isComposing = false
        }
        event.target.dispatchEvent(new Event('input'))
      }
    })
  }
})
