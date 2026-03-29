const { Select, Input } = require('enquirer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/config');
const modelsPath = path.join(__dirname, '../src/models');
const entitiesPath = path.join(__dirname, '../src/entities');

if (!fs.existsSync(configPath)) fs.mkdirSync(configPath, { recursive: true });

async function setupDatabase() {
  const dbPrompt = new Select({
    name: 'orm',
    message: 'Which ORM/ODM would you like to set up?',
    choices: [
      'Mongoose (MongoDB)',
      'Prisma (PostgreSQL, MySQL, SQLite, MongoDB)',
      'TypeORM (MySQL, PostgreSQL, etc.)',
      'Sequelize (MySQL, PostgreSQL, SQLite)',
      'MikroORM (TypeScript ORM)',
      'Knex.js (Query Builder)',
      'Lucid (AdonisJS ORM Framework)',
      'Back'
    ]
  });

  const orm = await dbPrompt.run();

  if (orm === 'Back') return main();

  console.log(`\n📦 Setting up ${orm}...\n`);

  try {
    if (orm === 'Mongoose (MongoDB)') {
      execSync('npm install mongoose', { stdio: 'inherit' });
      execSync('npm install -D @types/mongoose', { stdio: 'inherit' });
      fs.writeFileSync(path.join(configPath, 'database.ts'), `import mongoose from 'mongoose';\nimport { logger } from '../utils/logger';\n\nexport const connectDB = async () => {\n  try {\n    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/express-boilerplate');\n    logger.info('✅ MongoDB connected');\n  } catch (err) {\n    logger.error('❌ Error connecting to MongoDB', err);\n    process.exit(1);\n  }\n};\n`);
      if (!fs.existsSync(modelsPath)) fs.mkdirSync(modelsPath, { recursive: true });
      fs.writeFileSync(path.join(modelsPath, 'User.ts'), `import { Schema, model } from 'mongoose';\n\nconst userSchema = new Schema({ name: String, email: String }, { timestamps: true });\nexport const User = model('User', userSchema);\n`);
      console.log('\n✅ Mongoose setup completed! Check src/config/database.ts & src/models/User.ts');

    } else if (orm.includes('Prisma')) {
      execSync('npm install prisma --save-dev', { stdio: 'inherit' });
      execSync('npm install @prisma/client', { stdio: 'inherit' });
      execSync('npx prisma init', { stdio: 'inherit' });
      fs.writeFileSync(path.join(configPath, 'database.ts'), `import { PrismaClient } from '@prisma/client';\nimport { logger } from '../utils/logger';\n\nexport const prisma = new PrismaClient();\n\nexport const connectDB = async () => {\n  await prisma.$connect();\n  logger.info('✅ Prisma connected');\n};\n`);
      console.log('\n✅ Prisma setup completed! Check prisma/schema.prisma & src/config/database.ts');

    } else if (orm.includes('TypeORM')) {
      execSync('npm install typeorm reflect-metadata mysql2 pg', { stdio: 'inherit' });
      fs.writeFileSync(path.join(configPath, 'database.ts'), `import { DataSource } from 'typeorm';\nimport { logger } from '../utils/logger';\n\nexport const AppDataSource = new DataSource({\n  type: 'postgres', // change to mysql/sqlite as needed\n  host: process.env.DB_HOST || 'localhost',\n  port: 5432,\n  username: process.env.DB_USER || 'postgres',\n  password: process.env.DB_PASSWORD || 'password',\n  database: process.env.DB_NAME || 'boilerplate',\n  synchronize: true,\n  logging: false,\n  entities: [__dirname + '/../entities/*.ts'],\n});\n\nexport const connectDB = async () => {\n  try {\n    await AppDataSource.initialize();\n    logger.info('✅ TypeORM Data Source initialized');\n  } catch (err) {\n    logger.error('❌ TypeORM Initialization Error', err);\n  }\n};\n`);
      if (!fs.existsSync(entitiesPath)) fs.mkdirSync(entitiesPath, { recursive: true });
      fs.writeFileSync(path.join(entitiesPath, 'User.ts'), `import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';\n\n@Entity()\nexport class User {\n  @PrimaryGeneratedColumn()\n  id: number;\n\n  @Column()\n  name: string;\n}\n`);
      console.log('\n✅ TypeORM setup completed! Check src/config/database.ts & src/entities/User.ts');

    } else if (orm.includes('Sequelize')) {
      execSync('npm install sequelize pg pg-hstore mysql2 sqlite3', { stdio: 'inherit' });
      execSync('npm install -D @types/sequelize', { stdio: 'inherit' });
      fs.writeFileSync(path.join(configPath, 'database.ts'), `import { Sequelize } from 'sequelize';\nimport { logger } from '../utils/logger';\n\nexport const sequelize = new Sequelize(process.env.DB_NAME || 'boilerplate', process.env.DB_USER || 'postgres', process.env.DB_PASSWORD || 'password', {\n  host: process.env.DB_HOST || 'localhost',\n  dialect: 'postgres', // change to mysql or sqlite\n  logging: false,\n});\n\nexport const connectDB = async () => {\n  try {\n    await sequelize.authenticate();\n    logger.info('✅ Sequelize connected successfully.');\n  } catch (err) {\n    logger.error('❌ Sequelize connection error:', err);\n  }\n};\n`);
      if (!fs.existsSync(modelsPath)) fs.mkdirSync(modelsPath, { recursive: true });
      fs.writeFileSync(path.join(modelsPath, 'User.ts'), `import { DataTypes } from 'sequelize';\nimport { sequelize } from '../config/database';\n\nexport const User = sequelize.define('User', {\n  name: {\n    type: DataTypes.STRING,\n    allowNull: false\n  },\n  email: {\n    type: DataTypes.STRING\n  }\n});\n`);
      console.log('\n✅ Sequelize setup completed! Check src/config/database.ts & src/models/User.ts');

    } else if (orm.includes('MikroORM')) {
      execSync('npm install @mikro-orm/core @mikro-orm/postgresql @mikro-orm/mysql', { stdio: 'inherit' });
      fs.writeFileSync(path.join(configPath, 'database.ts'), `import { MikroORM } from '@mikro-orm/core';\nimport { logger } from '../utils/logger';\n\nexport const connectDB = async () => {\n  try {\n    const orm = await MikroORM.init({\n      entities: ['./dist/entities'],\n      entitiesTs: ['./src/entities'],\n      dbName: process.env.DB_NAME || 'boilerplate',\n      type: 'postgresql', // change as needed\n      clientUrl: process.env.DB_URL,\n    });\n    logger.info('✅ MikroORM connected successfully.');\n    return orm;\n  } catch (err) {\n    logger.error('❌ MikroORM connection error:', err);\n  }\n};\n`);
      if (!fs.existsSync(entitiesPath)) fs.mkdirSync(entitiesPath, { recursive: true });
      fs.writeFileSync(path.join(entitiesPath, 'User.ts'), `import { Entity, PrimaryKey, Property } from '@mikro-orm/core';\n\n@Entity()\nexport class User {\n  @PrimaryKey()\n  id!: number;\n\n  @Property()\n  name!: string;\n}\n`);
      console.log('\n✅ MikroORM setup completed! Check src/config/database.ts & src/entities/User.ts');

    } else if (orm.includes('Knex.js')) {
      execSync('npm install knex pg mysql2 sqlite3', { stdio: 'inherit' });
      fs.writeFileSync(path.join(configPath, 'database.ts'), `import knex from 'knex';\nimport { logger } from '../utils/logger';\n\nexport const db = knex({\n  client: 'pg', // change to mysql2 or sqlite3\n  connection: {\n    host: process.env.DB_HOST || '127.0.0.1',\n    user: process.env.DB_USER || 'postgres',\n    password: process.env.DB_PASSWORD || 'password',\n    database: process.env.DB_NAME || 'boilerplate'\n  }\n});\n\nexport const connectDB = async () => {\n  try {\n    await db.raw('SELECT 1');\n    logger.info('✅ Knex connected successfully.');\n  } catch (err) {\n    logger.error('❌ Knex connection error:', err);\n  }\n};\n`);
      console.log('\n✅ Knex.js setup completed! Check src/config/database.ts');

    } else if (orm.includes('Lucid')) {
      // NOTE: Lucid is an AdonisJS specific tool that can be used standalone but typically reqs extra setup.
      execSync('npm install @adonisjs/lucid @adonisjs/core', { stdio: 'inherit' });
      fs.writeFileSync(path.join(configPath, 'database.ts'), `// Lucid ORM setup\nimport { Database } from '@adonisjs/lucid/database';\nimport { logger } from '../utils/logger';\n\n// Note: configuring standalone Lucid requires careful setup of adonis env.\nexport const connectDB = async () => {\n  logger.info('✅ Lucid ORM configuration template generated (requires Adonis application container bindings in standard express)');\n};\n`);
      console.log('\n✅ Lucid ORM setup generated! Note: Lucid works best inside AdonisJS, standalone setup in Express requires manual dependency injection Container configuration.');
    }

    console.log('\n👉 Don\'t forget to uncomment `// await connectDB();` in src/server.ts\n');

  } catch (err) {
    if(err === '') {
      console.log('Cancelled');
      process.exit();
    }
    console.error('An error occurred during DB installation.', err);
  }
}

async function makeController() {
  const prompt = new Input({
    name: 'name',
    message: 'What is the name of the controller? (e.g. AuthController)'
  });
  
  const name = await prompt.run();
  if(!name) return main();
  
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  const controllerCode = `import { Request, Response } from 'express';\n\nexport class ${formattedName} {\n  public async index(req: Request, res: Response) {\n    res.status(200).json({ message: '${formattedName} Works!' });\n  }\n}\n`;
  
  const controllerPath = path.join(__dirname, '../src/controllers');
  if (!fs.existsSync(controllerPath)) fs.mkdirSync(controllerPath, { recursive: true });
  
  fs.writeFileSync(path.join(controllerPath, `${formattedName.toLowerCase()}.controller.ts`), controllerCode);
  console.log(`✅ Controller '${formattedName}' created in src/controllers/`);
}

async function main() {
  console.log('🛠  Express Boilerplate CLI (Adonis/Nest Style) 🛠\n');
  
  const prompt = new Select({
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'Setup Database (Choose ORM)',
      'Generate Controller',
      'Exit'
    ]
  });

  try {
    const action = await prompt.run();
    if (action === 'Setup Database (Choose ORM)') {
      await setupDatabase();
    } else if (action === 'Generate Controller') {
      await makeController();
    } else {
      console.log('Goodbye!');
      process.exit(0);
    }
  } catch (e) {
    if(e === '') {
      console.log('Exiting...');
    }
  }
}

main();
