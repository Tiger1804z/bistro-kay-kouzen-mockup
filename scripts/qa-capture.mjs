import { writeFileSync } from 'node:fs'

const [url, scrollValue = '0', output = 'qa-cdp.png', debugPort = '9222'] = process.argv.slice(2)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let targets
for (let attempt = 0; attempt < 20; attempt += 1) {
  try {
    targets = await fetch(`http://127.0.0.1:${debugPort}/json`).then((response) => response.json())
    break
  } catch {
    await delay(250)
  }
}

if (!targets?.length) throw new Error('Chrome DevTools endpoint did not become available.')

const target = targets.find((item) => item.type === 'page')
const socket = new WebSocket(target.webSocketDebuggerUrl)
const pending = new Map()
let messageId = 0

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (!message.id || !pending.has(message.id)) return
  const { resolve, reject } = pending.get(message.id)
  pending.delete(message.id)
  if (message.error) reject(new Error(message.error.message))
  else resolve(message.result)
})

await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++messageId
  pending.set(id, { resolve, reject })
  socket.send(JSON.stringify({ id, method, params }))
})

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url })
await delay(3200)
const diagnostics = await send('Runtime.evaluate', { expression: `JSON.stringify({ href: location.href, readyState: document.readyState, height: document.documentElement.scrollHeight, title: document.title })`, returnByValue: true })
console.log(diagnostics.result.value)
const numericScroll = Number(scrollValue)
const scrollExpression = Number.isFinite(numericScroll)
  ? `window.scrollTo(0, ${numericScroll}); window.dispatchEvent(new Event('scroll'));`
  : `(() => { const [selector, progress = '0'] = ${JSON.stringify(scrollValue)}.split('@'); const element = document.querySelector(selector); const y = element.offsetTop + Math.max(element.offsetHeight - innerHeight, 0) * Number(progress); window.scrollTo(0, y); window.dispatchEvent(new Event('scroll')); })()`
await send('Runtime.evaluate', { expression: scrollExpression })
await delay(700)
const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
writeFileSync(output, Buffer.from(data, 'base64'))
await send('Browser.close').catch(() => undefined)
socket.close()
