import { t } from "elysia";
import { app } from "./core/app";
import { initializeDatabase } from "./database/db";
import { ApiKeyHandler } from "./handlers/api-key";

const db = initializeDatabase();

app
  .decorate('database', db)
  .decorate('apiKeyHandler', ApiKeyHandler)
  .post('/key', ({ apiKeyHandler }) => {
    return apiKeyHandler.generate('test');
  })
  .guard({
    headers: t.Object({
      'x-api-key': t.String()
    })
  })
  .onBeforeHandle(async ({ set, headers, apiKeyHandler }) => {

    const apiKey = headers['x-api-key'] || null;

    const apiKeyIsValid = apiKeyHandler.verify(apiKey);

    console.log(
      await apiKeyHandler.decrypt(apiKey!)
    );
    

    if (apiKeyIsValid == false) {
      return set.status = 'Unauthorized';
    }
  })
  .get('/broths', ({ database }) => {
    return 'eba!'
  })
  .get('/proteins', (ctx) => {
    return 'opa!'
  })
  .post('/orders', (ctx) => {
    return 'oba!'
  })
  .listen(3000, () => {
    console.log(
      `Servidor está rodando na porta ${app.server?.hostname}:${app.server?.port}`
    );
  })