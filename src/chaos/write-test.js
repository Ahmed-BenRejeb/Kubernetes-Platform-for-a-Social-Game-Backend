import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // We will ramp up faster to force a crash
  stages: [
    { duration: '30s', target: 100 },  // Warm up with 100 users
    { duration: '1m', target: 500 },   // Push to 500
    { duration: '1m', target: 1000 },  // Push to 1000 (MySQL usually breaks here)
  ],
};

export default function () {
  // 1. Generate a random nickname so we don't get "Duplicate Entry" errors
  const randomId = Math.floor(Math.random() * 1000000);
  const payload = JSON.stringify({
    nickname: `Player_${randomId}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 2. Hit the POST endpoint
  const res = http.post('http://192.168.49.2:30002/players', payload, params);

  // 3. Check if it worked (Status 201 Created)
  check(res, {
    'is status 201': (r) => r.status === 201,
  });

  // Short sleep to simulate real traffic
  sleep(1);
}