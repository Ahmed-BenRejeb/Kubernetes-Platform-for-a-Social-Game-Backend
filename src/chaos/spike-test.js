// src/chaos/spike-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Normal traffic
    { duration: '10s', target: 1000 }, // SUDDEN SPIKE
    { duration: '1m', target: 50 },    // Back to normal
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],

  },
};

export default function () {
  const res = http.get('http://10.109.94.57/players');
  
  check(res, {
    'recovered from spike': (r) => r.status === 200,
    'latency acceptable': (r) => r.timings.duration < 3000,
  });

  sleep(1);
}