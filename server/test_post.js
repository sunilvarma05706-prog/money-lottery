async function test() {
  try {
    const resLogin = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const login = await resLogin.json();
    const token = login.token;
    console.log('Token:', token);

    const resPost = await fetch('http://localhost:5000/api/number', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        slotValue: '22:05',
        number: '88',
        special: false
      })
    });
    const postText = await resPost.text();
    console.log('Post res status:', resPost.status);
    console.log('Post successful:', postText);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
