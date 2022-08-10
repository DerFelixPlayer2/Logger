import { handleRequest, getNicePresentation } from './handler'

addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(getNicePresentation(event.request));
  } else {
    event.respondWith(handleRequest(event.request));
  }
})
