import axios from '@/plugins/axios.js'

console.log(window.location)
const baseURL = 'http://localhost:3000'

export function sayHello () {
  return axios({
    baseURL,
    url: '/hello',
    method: 'GET',
    withCredentials: false
  }).then(msg => {
    console.log(msg)
  })
}
