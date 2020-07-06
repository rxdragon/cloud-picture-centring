import Vue from 'vue'
Vue.directive('numberOnly', {
  inserted: (el, bind) => {
    el.addEventListener('keyup', (value) => {
      const reg = /^[0-9]*$/g
      const reg2 = /[0-9]+/g
      const has = !reg.test(event.target.value)
      el.__vue__.isComposing = false
      if (has) {
        const regArr = reg2.exec(event.target.value)
        const trueText = regArr ? regArr[0] : ''
        event.target.value = trueText
        getMinMaxNumer(event.target)
        event.target.dispatchEvent(new Event('input'))
      } else {
        if (getMinMaxNumer(event.target)) {
          event.target.dispatchEvent(new Event('input'))
        }
      }
    })
  }
})

function getMinMaxNumer (dom) {
  const min = Number(dom.min)
  const max = Number(dom.max)
  if (!dom.value) return false
  if (min && dom.value < min) {
    dom.value = min
    return true
  }
  if (max && dom.value > max) {
    dom.value = max
    return true
  }
  return false
}
