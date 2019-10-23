import Vue from 'vue'

Vue.directive('maxLength16', {
  inserted: (el, bind) => {
    el.addEventListener('keyup', (value) => {
      const reg = /^[a-zA-Z0-9\u4e00-\u9fa5\s]{0,16}$/g
      const reg2 = /[a-zA-Z0-9\u4e00-\u9fa5\s]{0,16}/g
      const has = !reg.test(event.target.value)
      if (has) {
        const regArr = reg2.exec(event.target.value)
        const trueText = regArr ? regArr[0] : ''
        event.target.value = trueText
        event.target.dispatchEvent(new Event('input'))
      }
    })
  }
})
