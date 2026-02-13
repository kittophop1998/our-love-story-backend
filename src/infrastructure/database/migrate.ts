import { Migrator, FileMigrationProvider } from 'kysely'
import { db } from './maria'
import path from 'path'
import fs from 'fs/promises'

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, 'migrations'),
  }),
})

async function migrate() {
  const command = process.argv[2]

  if (command === 'down') {
    const { error, results } = await migrator.migrateDown()

    if (error) {
      console.error('Rollback failed', error)
      process.exit(1)
    }

    if (results) {
      results.forEach((it) => {
        if (it.status === 'Success') {
          console.log(`Rollback "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
          console.error(`Failed to rollback migration "${it.migrationName}"`)
        }
      })
    }

    console.log('Rollback completed successfully')
  } else {
    const { error, results } = await migrator.migrateToLatest()

    if (error) {
      console.error('Migration failed', error)
      process.exit(1)
    }

    if (results) {
      results.forEach((it) => {
        if (it.status === 'Success') {
          console.log(`Migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
          console.error(`Failed to execute migration "${it.migrationName}"`)
        }
      })
    }

    console.log('Migration completed successfully')
  }

  await db.destroy()
  process.exit(0)
}

migrate()
