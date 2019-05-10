import knex from 'knex'
import { Client } from 'pg'
import config from '../src/config'
let k = knex(config.knex)
let db = config.knex.connection
let rootClient = new Client(Object.assign({}, db, { database: 'postgres' }))
rootClient.connect()

async function createDatabase () {
  try {
    console.log('Creating db...')
    await rootClient.query(`CREATE DATABASE "${db.database}"`)
  } catch (err) {
    if (/exists/.test(err.message)) {
      console.log('Database already exists, skipping creation.')
    } else {
      console.log(err)
    }
  }
}

async function recreateDatabase () {
  try {
    console.log('Dropping database...')
    await rootClient.query(`DROP DATABASE IF EXISTS "${db.database}"`)
    await createDatabase()
    console.log('DB created.')
  } catch (err) {
    console.log(err)
  }
}

async function formatAndCreate () {
  try {
    await recreateDatabase()
    await k.migrate.latest()
  } catch (err) {
    console.log(err)
  }
}

async function migrate () {
  try {
    await createDatabase()
    console.log('DB created. Migrating...')
    await k.migrate.latest()
  } catch (err) {
    console.log(err)
  }
}

async function database (arg = 'create') {
  console.log(arg)
  switch (arg) {
    case 'create':
      await createDatabase()
      break
    case 'recreate':
      await recreateDatabase()
      break
    case 'migrate':
      await migrate()
      break
    case 'formatAndCreate':
      await formatAndCreate()
  }
  return
}

database(process.argv[3])
  .then(() => {
    console.log('Done.')
    process.exit()
  }).catch((err) => {
    console.log(err)
    process.exit(1)
  })