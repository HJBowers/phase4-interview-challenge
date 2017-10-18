const db = require('./db')
const pg = require('pg')

const dbName = 'dbvinyl'
const connectionString = process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`
const client = new pg.Client(connectionString)

client.connect()


// Albums
const getAlbums = (cb) => {
  _query('SELECT * FROM albums', [], cb)
}

const getAlbumsByID = (albumID, cb) => {
  _query('SELECT * FROM albums WHERE id = $1', [albumID], cb)
}

const _query = (sql, variables, cb) => {
  console.log('QUERY ->', sql.replace(/[\n\s]+/g, ' '), variables)

  client.query(sql, variables, (error, result) => {
    if (error) {
      console.log('QUERY -> !!ERROR!!')
      console.error(error)
      cb(error)
    } else {
      console.log('QUERY ->', JSON.stringify(result.rows))
      cb(error, result.rows)
    }
  })
}

// Reviews
const getReviewsByDate = (cb) => {
  _query(`
    SELECT
      reviews.*, users.name, albums.title
    FROM
      reviews
    INNER JOIN
      users
    ON
      reviews.user_id = users.id
    INNER JOIN
      albums
    ON
      reviews.album_id = albums.id
    ORDER BY
      date_created
    DESC
    `, [], cb)
  }

  const getReviewsByAlbumId = (album_id) => {
    return db.query(`
      SELECT
        reviews.*, users.name, albums.title
      FROM
        reviews
      INNER JOIN
        users
      ON
        reviews.user_id = users.id
      INNER JOIN
        albums
      ON
        reviews.album_id = albums.id
      WHERE
        album_id = $1
      `, [album_id])
  }

  const getReviewsByUserId = (userId) => {
    return db.query(`
      SELECT
      reviews.*, users.name, albums.title
      FROM
      reviews
      INNER JOIN
      users
      ON
      reviews.user_id = users.id
      INNER JOIN
      albums
      ON
      reviews.album_id = albums.id
      WHERE
      reviews.user_id = $1
      `, [userId])
    }

  const removeReview = (id) => {
    return db.none('DELETE FROM reviews WHERE id = $1', [id])
  }

  // `
  // SELECT reviews.*, users.name
  // FROM reviews
  // INNER JOIN users ON reviews.user_id = users.id
  // WHERE album_id = $1
  // `

  const createNewReview = (user_id, description, album_id) => {
    return db.query(`
      INSERT INTO
      reviews (user_id, description, album_id)
      VALUES
      ($1::INTEGER, $2::text, $3::INTEGER)
      RETURNING
      *
      `, [user_id, description, album_id])
    }

// Users
const signupUser = (name, email, password) => {
  return db.one(`
    INSERT INTO
      users (name, email, password)
    VALUES
      ($1::text, $2::text, $3::text)
    RETURNING
      *
  `, [name, email, password])
}

const loginUser = (email, password) => {
  return db.query(`
    SELECT
      *
    FROM
      users
    WHERE
      email=$1 AND password=$2
  `, [email, password])
}

const userProfile = (userId) => {
  return db.one(`
    SELECT
      *
    FROM
      users
    WHERE
      id=$1
  `, [userId])
}


const getAlbumByID = (albumID) => {
  return db.one(`
    SELECT
      *
    FROM
      albums
    WHERE id = $1
  `, [albumID])
}



module.exports = {
  getAlbums,
  getAlbumsByID,
  signupUser,
  loginUser,
  userProfile,
  getReviewsByUserId,
  getReviewsByDate,
  removeReview,
  getAlbumByID,
  createNewReview,
  getReviewsByAlbumId
}
