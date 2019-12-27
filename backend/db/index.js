
const config = require('../config/config.js');
const { Pool, types } = require('pg')

const pool = new Pool({
    user: global.gConfig.database.username,
    host: global.gConfig.database.address,
    database: global.gConfig.database.name,
    password: global.gConfig.database.password,
    port: global.gConfig.database.port,
    max: 10
})

types.setTypeParser(1114, str => str)

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  getClient: (callback) => {
    pool.connect((err, client, done) => {
      callback(err, client, done)
    })
  }
}