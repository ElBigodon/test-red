import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

export const app = new Elysia({ prefix: '/api/v1' })
  .use(cors())
  .use(swagger({
    path: '/doc',
    documentation: {
      info: {
        title: 'Red Ventures Test V1',
        version: '0.1'
      },
    }
  })
  )

