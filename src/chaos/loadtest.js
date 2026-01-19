import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  // Key configuration: Scale up to 1000 users over 1 minute
  stages: [

    { duration: '1m', target: 1000 }, // Ramp to 1000 users
  ],
};

export default function () {
  // Hit the DB endpoint
  http.get('http://192.168.49.2:30002/chaos/db-stress');

  // Real users don't click instantly. They wait 1s.
  sleep(1);

}