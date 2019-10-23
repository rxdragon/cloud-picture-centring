import Vue from 'vue'
Vue.directive('no-special', {
  inserted: (el, bind) => {
    el.addEventListener('input', (value) => {
      const reg = /^[0-9a-zA-Z]+$/g
      const reg2 = /[0-9a-zA-Z]+/g
      const val = event.target.value
      const has = !reg.test(val)
      if (has) {
        const regArr = reg2.exec(val)
        console.log(regArr)
        const trueText = regArr ? regArr[0] : ''
        el.children[0].value = trueText
        el.children[0].dispatchEvent(new Event('input'))
      }
    })
  }
})
