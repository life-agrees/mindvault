const http = require('http');

function request(method, path, body = null, headers = {}) {
  const opts = {
    hostname: 'localhost',
    port: 3002,
    path,
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async function run() {
  try {
    console.log('Step 1 — login');
    let login = await request('POST', '/auth/login', { privyToken: 'did:privy:test123', email: 'prince@test.com' });
    let token = login.data?.token;
    if (!token) {
      console.warn('Login failed, attempting dev-token fallback');
      const dev = await request('POST', '/auth/dev-token', { privyDid: 'did:privy:test123', email: 'prince@test.com' });
      if (!dev.data || !dev.data.token) {
        console.error('Dev-token fallback failed', { login, dev });
        process.exit(1);
      }
      token = dev.data.token;
    }
    // Do not print full tokens to logs. Print masked token for debugging only.
    function maskTok(t) {
      if (!t || t.length < 12) return 'REDACTED';
      return `${t.slice(0, 6)}...${t.slice(-6)}`;
    }
    console.log('token acquired:', maskTok(token));

    console.log('\nStep 2 — send message');
    const msg = await request('POST', '/chat/message', { message: "Hey! My name is Prince. I'm a full-stack developer from Nigeria building a Web3 wallet called Flow.", sessionMessages: [] }, { Authorization: `Bearer ${token}` });
    console.log('message response:', JSON.stringify(msg.data, null, 2));

    console.log('\nStep 3 — save session');
    const save = await request('POST', '/chat/save', {
      messages: [
        { role: 'user', content: "Hey! My name is Prince. I'm a full-stack developer from Nigeria building a Web3 wallet called Flow." },
        { role: 'assistant', content: 'Hey Prince! That sounds really exciting...' },
      ],
    }, { Authorization: `Bearer ${token}` });
    console.log('save response:', JSON.stringify(save.data, null, 2));

    console.log('\nStep 4 — ask what it remembers');
    const recall = await request('POST', '/chat/message', { message: 'Hey, what do you remember about me?', sessionMessages: [] }, { Authorization: `Bearer ${token}` });
    console.log('recall response:', JSON.stringify(recall.data, null, 2));

    console.log('\nStep 5 — list memories');
    const list = await request('GET', '/chat/memories', null, { Authorization: `Bearer ${token}` });
    console.log('memories:', JSON.stringify(list.data, null, 2));

    console.log('\nE2E script finished');
  } catch (err) {
    console.error('E2E script error', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
