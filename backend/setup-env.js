const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const questions = [
  {
    name: 'DB_HOST',
    question: '數據庫主機 (localhost): ',
    default: 'localhost'
  },
  {
    name: 'DB_USER',
    question: '數據庫用戶名 (root): ',
    default: 'root'
  },
  {
    name: 'DB_PASSWORD',
    question: '數據庫密碼: ',
    default: ''
  },
  {
    name: 'DB_NAME',
    question: '數據庫名稱 (checkin_system): ',
    default: 'checkin_system'
  },
  {
    name: 'JWT_SECRET',
    question: 'JWT 密鑰 (隨機生成): ',
    default: require('crypto').randomBytes(32).toString('hex')
  },
  {
    name: 'JWT_REFRESH_SECRET',
    question: 'JWT 刷新密鑰 (隨機生成): ',
    default: require('crypto').randomBytes(32).toString('hex')
  },
  {
    name: 'PORT',
    question: '服務器端口 (3000): ',
    default: '3000'
  },
  {
    name: 'NODE_ENV',
    question: '環境 (development): ',
    default: 'development'
  }
]

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.question, (answer) => {
      resolve(answer || question.default)
    })
  })
}

async function setupEnv() {
  const env = {}
  
  for (const q of questions) {
    env[q.name] = await askQuestion(q)
  }
  
  const envContent = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  
  fs.writeFileSync('.env', envContent)
  console.log('\n環境變量設置完成！')
  rl.close()
}

setupEnv() 