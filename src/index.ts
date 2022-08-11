import { handleRequest as handlePost } from './post'
import { handleRequest as handleGet } from './get';

addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(handleGet(event.request));
  } else {
    event.respondWith(handlePost(event.request));
  }
})
