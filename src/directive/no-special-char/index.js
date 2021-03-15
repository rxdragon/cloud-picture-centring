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
        const trueText = regArr ? regArr[0] : ''
        el.children[0].value = trueText
        el.children[0].dispatchEvent(new Event('input'))
      }
    })
  }
})


Vue.directive('no-special-chinese', {
  inserted: (el, bind) => {
    el.addEventListener('input', (value) => {
      const reg = /[`~!@¥#$%^&*()_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g
      const val = event.target.value
      const has = reg.test(val)
      if (has) {
        const trueText = val.replace(reg, '')
        el.children[0].value = trueText
        el.children[0].dispatchEvent(new Event('input'))
      }
    })
  }
})
