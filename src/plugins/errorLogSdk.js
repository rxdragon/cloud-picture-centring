import Vue from 'vue'
import LogSdk from 'mainto-fed-log'

const logSdk = new LogSdk({
	project: 'cloud-picture-centring',
	autoTrack: true
})

Vue.use(logSdk)
