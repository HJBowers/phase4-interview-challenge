const router = require('express').Router()
const db = require('../db/index.js')

// const setLocals = (req, res, next) => {
//   let loggedIn = false
//   let username = null
//   if (req.session.user) {
//     loggedIn = true
//     username = req.session.user.username
//   }
//   res.locals = {loggedIn, username}
//   next()
// }
//
// router.use(setLocals)

router.get('/', (req, res) => {
  db.getAlbums((error, albums) => {
    if (error) {
      res.status(500).render('error', {error})
    } else {
      return db.getReviewsByDate((error, reviews) => {
        if (error) {
          res.status(500).render('error', {error})
        } else {
          res.render('index', {albums, reviews, user: req.session.user})
        }
      })
    }
  })
})

router.get('/albums/:albumID', (req, res) => {
  const albumID = req.params.albumID
  return db.getAlbumByID(albumID)
  .then((album) => {
    return db.getReviewsByAlbumId(album.id)
  .then((reviews) => {
      res.render('album', {album, reviews, user: req.session.user})
    })
  })
})

router.get('/signup', (req, res) => {
  res.render('signup', { user: req.session.user || null, message: '' })
})

router.post('/signup', (req, res) => {
  const { name, email, password, confirm_password } = req.body
  if (password !== confirm_password) {
    res.render('signup', {error: 'Passwords don\'t match'})
  } else {
    db.signupUser(name, email, password)
    .then((user) => {
      req.session.user = user
      res.redirect(`/users/${user.id}`)
    })
  }
})

router.get('/login', (req, res) => {
  res.render('login', { user: req.session.user || null , message: '' })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  return db.loginUser(email, password)
  .then(userInfo => {
    if (userInfo.length === 0 || undefined) {
      return false
    } else {
      return userInfo[0]
    }
  })
  .then((user) => {
    if (user === false) {
      res.render('login', {user: req.session.user || null , message: 'Incorrect login info'})
    } else {
      req.session.user = user
      res.redirect(`/users/${user.id}`)
    }
  })
})

router.get('/logout', (req, response) => {
  req.session.destroy(() => {
    response.redirect('/')
  })
})

router.get('/users/:id', (req, res) => {
  userId = req.params.id
  if (req.session.user === undefined) {
    res.redirect('/login')
  } else {
    return db.getReviewsByUserId(req.session.user.id)
    .then((reviews) => {
      res.render('profile', {user: req.session.user, edit: false, reviews})
    })
  }
})

router.get('/albums/:albumID/reviews/new', (req, res) => {
  albumID = req.params.albumID
  return db.getAlbumByID(albumID)
  .then((album) => {
    res.render('newReview', {album, user: req.session.user})
  })
})

router.post('/newReview', (req, res) => {
  // album_id = req.params.albumID
  const { description, user_id, album_id } = req.body
  return db.createNewReview(user_id, description, album_id)
  .then((review) => {
    return userProfile(review.user_id)
    .then((user) => {
      res.redirect(`/albums/${album.id}`)
    })
  })
})

router.delete('/reviews/:id/delete', (req, res) => {
  db.removeReview(req.params.id)
  .then(() => res.redirect(`/albums/${album.id}`, {message: 'successful delete'}))
  .catch(error => res.status(500).render('error', {error}))
})


module.exports = router
