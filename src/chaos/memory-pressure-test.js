// src/chaos/memory-pressure-test.js (FIXED)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 300 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 100 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
  },
};

export default function () {
  const randomId = Math.floor(Math.random() * 1000000);
  
  const payload = JSON.stringify({
    nickname: `Player_${randomId}`,
    metadata: 'x'.repeat(5000), 
  });

  // ✅ CHANGED: Use the correct Minikube IP and NodePort
  const res = http.post('http://192.168.49.2:30002/players', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status 201': (r) => r.status === 201,
    'response time <1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}