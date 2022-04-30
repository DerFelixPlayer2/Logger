import { handleRequest, getNicePresentation } from './handler'

addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(getNicePresentation());
  } else {
    event.respondWith(handleRequest(event.request));
  }
})
