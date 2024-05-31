import Elysia, { t } from "elysia";

export const ordersRoute = new Elysia({ prefix: 'orders' })
  .post('/', ({  }) => {

  }, {
    body: t.Object({
      brothId: t.String(),
      proteinId: t.String(),
    })
  })