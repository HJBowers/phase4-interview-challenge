const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const routes = require('../src/routes/index')

const port = process.env.PORT || 3000

const app = express()

require('ejs')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.use(session({
  name: 'session',
  secret: 'nom nom nom',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 6000000
  }
}))

app.use('/', routes)

app.use((req, res) => {
  res.status(404).render('not_found')
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}...`)
})
