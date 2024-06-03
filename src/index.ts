import { t } from "elysia";
import { app } from "./core/app";
import { ApiKeyHandler } from "./handlers/api-key";
import { brothsExamples, proteinsExamples } from "./constants";

const broths = brothsExamples.map(({ name, description }, i) => ({
  id: i + 1,
  imageInactive: "https://tech.redventures.com.br/icons/salt/inactive.svg",
  imageActive: "https://tech.redventures.com.br/icons/salt/active.svg",
  name,
  description,
  price: Math.ceil(Math.random() * 100)
}))

const proteins = proteinsExamples.map(({ name, description }, i) => ({
  id: i + 1,
  imageInactive: "https://tech.redventures.com.br/icons/pork/inactive.svg",
  imageActive: "https://tech.redventures.com.br/icons/pork/active.svg",
  name,
  description,
  price: Math.ceil(Math.random() * 100)
}))

app
  .decorate('apiKeyHandler', ApiKeyHandler)
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      if (error.message.includes('x-api-key')) {
        set.status = 'Forbidden'
      }
      
      return { error: error.message };
    }

    return error;
  })
  .post('/key/generate', ({ apiKeyHandler, body }) =>
    apiKeyHandler.generate(JSON.stringify(body || null))
  )
  .guard({
    headers: t.Object({ 'x-api-key': t.String({ error: 'x-api-key header missing' }) })
  })
  .resolve(async ({ set, headers, apiKeyHandler }) => {
    const apiKey = headers['x-api-key'] || null;

    const apiKeyIsValid = await apiKeyHandler.verify(apiKey);

    if (apiKeyIsValid == false) {
      set.status = 'Unauthorized';
      throw new Error('x-api-key header missing')
    }

    return {};
  })
  .get('/broths', () => Array.from(broths))
  .get('/proteins', () => Array.from(proteins))
  .post('/orders', ({ body: { brothId, proteinId }, set }) => {

    const protein = proteins.find(({ id }) => id === proteinId) || null;

    const broth = broths.find(({ id }) => id === brothId) || null;

    if (protein == null || broth == null) {
      return set.status = 'Bad Request';
    }
    
    const randomGeneratedOrder = Math.ceil(Math.random() * 10_000);

    return new Promise(
      (res) => setTimeout(
        () => res({ orderId: randomGeneratedOrder }), Math.ceil(Math.random() * 5_000)
      )
    );
  }, {
    body: t.Object({
      brothId: t.Integer({ minimum: 1 }),
      proteinId: t.Integer({ minimum: 1 })
    }, { error: 'Invalid brothId or proteinId' })
  })
  .listen(3000, () => {
    console.log(
      `Servidor está rodando na porta ${app.server?.hostname}:${app.server?.port}`
    );
  })