const express = require('express')
const exp = express()

exp.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

exp.get('/hello', (req, res) => res.send('Hello World!'))


exp.listen(3000,() => {
  console.log('link contont')
})