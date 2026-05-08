const http = require('http')
const https = require('https')
const { URL } = require('url')

const services = [
  { name: 'api-gateway', url: 'http://localhost:3000/api/health' },
  { name: 'auth-service', url: 'http://localhost:3001/health' },
  { name: 'user-service', url: 'http://localhost:3002/health' },
  { name: 'post-service', url: 'http://localhost:3003/health' },
  { name: 'provider-service', url: 'http://localhost:3004/health' },
  { name: 'admin-service', url: 'http://localhost:3005/health' },
  { name: 'notification-service', url: 'http://localhost:3006/health' },
  { name: 'chat-service', url: 'http://localhost:3007/health' },
  { name: 'user-frontend', url: 'http://localhost:5173/' },
  { name: 'admin-frontend', url: 'http://localhost:5174/' },
]

function requestUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    const u = new URL(url)
    const lib = u.protocol === 'https:' ? https : http
    const start = Date.now()
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: 'GET',
        timeout,
      },
      (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString().slice(0, 200)
          resolve({ status: res.statusCode, time: Date.now() - start, body })
        })
      },
    )
    req.on('error', (err) => resolve({ error: err.message }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ error: 'timeout' })
    })
    req.end()
  })
}

;(async () => {
  console.log('Checking services...')
  const results = await Promise.all(
    services.map(async (s) => {
      const r = await requestUrl(s.url)
      return { ...s, result: r }
    }),
  )

  let ok = 0
  console.log('\nService status:')
  console.log('---------------------------------------------------------------')
  for (const r of results) {
    const { name, url, result } = r
    if (result.error) {
      console.log(`${name.padEnd(18)} | FAIL  | ${String(result.error).padEnd(10)} | ${url}`)
    } else {
      const pass = result.status === 200
      if (pass) ok++
      console.log(
        `${name.padEnd(18)} | ${pass ? 'OK    ' : 'WARN  '} | ${String(result.status).padEnd(3)} | ${result.time}ms | ${url}`,
      )
    }
  }
  console.log('---------------------------------------------------------------')
  console.log(`OK: ${ok}/${results.length}`)
  if (ok !== results.length) process.exitCode = 1
})()
