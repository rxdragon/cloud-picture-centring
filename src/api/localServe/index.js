import axios from '@/plugins/axios.js'

console.log(window.location)
const baseURL = window.location.port ? window.location.origin : window.location.port + '::3000'
export function sayHello () {
  return axios({
    baseURL,
    url: '/hello',
    method: 'GET'
  }).then(msg => {
    console.log(msg)
  })
}