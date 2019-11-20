import Vue from 'vue'
Vue.directive('numberOnly', {
  inserted: (el, bind) => {
    el.addEventListener('keyup', (value) => {
      const reg = /^[0-9]*$/g
      const reg2 = /[0-9]+/g
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
