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
    const devEncryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    console.log('🔑 Encryption Key:', devEncryptionKey);

    console.log('\n--- Step 1 — Login ---');
    let login = await request('POST', '/auth/login', { privyToken: 'did:privy:encTestUser', email: 'encryption@test.com' });
    let token = login.data?.token;
    if (!token) {
      console.warn('Login failed, attempting dev-token fallback');
      const dev = await request('POST', '/auth/dev-token', { privyDid: 'did:privy:encTestUser', email: 'encryption@test.com' });
      token = dev.data?.token;
    }
    if (!token) {
      console.error('Failed to acquire token');
      process.exit(1);
    }
    console.log('Token acquired successfully');

    console.log('\n--- Step 2 — Send Message (Unencrypted Prompt Flow) ---');
    const msg = await request('POST', '/chat/message', 
      { message: "Hello! My favorite color is green.", sessionMessages: [] }, 
      { Authorization: `Bearer ${token}` }
    );
    console.log('Response:', msg.data?.response);

    console.log('\n--- Step 3 — Save Session (Encrypted) ---');
    const save = await request('POST', '/chat/save', 
      {
        messages: [
          { role: 'user', content: "Hello! My favorite color is green." },
          { role: 'assistant', content: "Got it! Your favorite color is green." },
        ],
      }, 
      { 
        Authorization: `Bearer ${token}`,
        'x-encryption-key': devEncryptionKey
      }
    );
    console.log('Save response:', JSON.stringify(save.data, null, 2));
    const hash = save.data?.rootHash;
    if (!hash) {
      console.error('Did not receive a 0G rootHash!');
      process.exit(1);
    }

    console.log('\n--- Step 4 — Fetch Memory (WITH correct encryption key) ---');
    const memoryWithKey = await request('GET', `/chat/memory/${hash}`, null, {
      Authorization: `Bearer ${token}`,
      'x-encryption-key': devEncryptionKey
    });
    console.log('Retrieved decrypted memory:', JSON.stringify(memoryWithKey.data, null, 2));
    
    if (memoryWithKey.data?.memory?.messages?.[0]?.content !== "Hello! My favorite color is green.") {
      console.error('Decryption verification failed! Message mismatch.');
      process.exit(1);
    }
    console.log('✅ Decryption verified successfully!');

    console.log('\n--- Step 5 — Fetch Memory (WITHOUT encryption key) ---');
    const memoryWithoutKey = await request('GET', `/chat/memory/${hash}`, null, {
      Authorization: `Bearer ${token}`
    });
    console.log('Retrieved raw memory (should be ciphertext string):', JSON.stringify(memoryWithoutKey.data, null, 2));

    if (!memoryWithoutKey.data?.memory?.isEncrypted || typeof memoryWithoutKey.data?.memory?.ciphertext !== 'string') {
      console.error('E2E validation failed: Raw memory was decrypted or returned as an object without the key!');
      process.exit(1);
    }
    console.log('✅ Ciphertext protection verified successfully! isEncrypted=true, ciphertext is opaque string.');

    console.log('\n--- Step 6 — Fetch Memories List ---');
    const list = await request('GET', '/chat/memories', null, { Authorization: `Bearer ${token}` });
    console.log('Memories index database titles (should be ciphertext):');
    list.data?.memories?.forEach(m => {
      console.log(`- Title: ${m.title} (hash: ${m.root_hash})`);
    });

    console.log('\n🎉 E2E Encryption Script Finished Successfully!');
  } catch (err) {
    console.error('E2E Encryption script error', err);
    process.exit(1);
  }
})();
