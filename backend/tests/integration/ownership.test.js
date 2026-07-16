const request = require('supertest');
const app = require('../../app');
const prisma = require('../../lib/prisma');
const { notificarVencidos } = require('../../services/recordatorios.service');
const { authHeader, registerUser } = require('./helpers');

const shouldRun = process.env.RUN_INTEGRATION_TESTS === '1';

(shouldRun ? describe : describe.skip)('ownership integration (IDOR)', () => {
  let canRun = false;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL no definida; omitiendo integracion');
      return;
    }
    try {
      await prisma.$connect();
      canRun = true;
    } catch (err) {
      if (process.env.CI) {
        throw err;
      }
      console.warn(
        'DB no alcanzable; omitiendo integracion:',
        err.message?.split('\n')[0]
      );
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  function skipIfNoDb() {
    if (!canRun) {
      expect(true).toBe(true);
      return true;
    }
    return false;
  }

  describe('transacciones', () => {
    test('usuario B no puede leer, editar ni borrar transacción de A', async () => {
      if (skipIfNoDb()) return;
      const userA = await registerUser(app, 'tx-a');
      const userB = await registerUser(app, 'tx-b');

      const cuentaRes = await request(app)
        .post('/api/finanzas/cuentas')
        .set(authHeader(userA.token))
        .send({ nombre: 'Cuenta test', tipo: 'EFECTIVO', saldoInicial: 1000 });
      expect(cuentaRes.status).toBe(201);

      const txRes = await request(app)
        .post('/api/transacciones')
        .set(authHeader(userA.token))
        .send({
          tipo: 'GASTO',
          monto: 25.5,
          cuentaOrigenId: cuentaRes.body.cuenta.id,
          descripcion: 'Gasto ownership test',
        });
      expect(txRes.status).toBe(201);
      const txId = txRes.body.transaccion.id;

      const getRes = await request(app)
        .get(`/api/transacciones/${txId}`)
        .set(authHeader(userB.token));
      expect(getRes.status).toBe(404);

      const putRes = await request(app)
        .put(`/api/transacciones/${txId}`)
        .set(authHeader(userB.token))
        .send({ descripcion: 'Intento IDOR' });
      expect(putRes.status).toBe(404);

      const delRes = await request(app)
        .delete(`/api/transacciones/${txId}`)
        .set(authHeader(userB.token));
      expect(delRes.status).toBe(404);

      const ownerGet = await request(app)
        .get(`/api/transacciones/${txId}`)
        .set(authHeader(userA.token));
      expect(ownerGet.status).toBe(200);
      expect(ownerGet.body.transaccion.id).toBe(txId);
    });
  });

  describe('recordatorios', () => {
    test('usuario B no puede leer ni borrar recordatorio de A', async () => {
      if (skipIfNoDb()) return;
      const userA = await registerUser(app, 'rec-a');
      const userB = await registerUser(app, 'rec-b');

      const createRes = await request(app)
        .post('/api/sistema/recordatorios')
        .set(authHeader(userA.token))
        .send({
          titulo: 'Recordatorio ownership',
          fechaRecordatorio: new Date().toISOString(),
        });
      expect(createRes.status).toBe(201);
      const recId = createRes.body.recordatorio.id;

      const getRes = await request(app)
        .get(`/api/sistema/recordatorios/${recId}`)
        .set(authHeader(userB.token));
      expect(getRes.status).toBe(404);

      const delRes = await request(app)
        .delete(`/api/sistema/recordatorios/${recId}`)
        .set(authHeader(userB.token));
      expect(delRes.status).toBe(404);

      const ownerGet = await request(app)
        .get(`/api/sistema/recordatorios/${recId}`)
        .set(authHeader(userA.token));
      expect(ownerGet.status).toBe(200);
    });
  });

  describe('categorías', () => {
    test('usuario B no puede editar ni borrar categoría de A', async () => {
      if (skipIfNoDb()) return;
      const userA = await registerUser(app, 'cat-a');
      const userB = await registerUser(app, 'cat-b');

      const createRes = await request(app)
        .post('/api/categorias')
        .set(authHeader(userA.token))
        .send({ nombre: 'Categoria ownership', tipo: 'GASTO' });
      expect(createRes.status).toBe(201);
      const catId = createRes.body.categoria.id;

      const putRes = await request(app)
        .put(`/api/categorias/${catId}`)
        .set(authHeader(userB.token))
        .send({ nombre: 'Robo IDOR' });
      expect(putRes.status).toBe(404);

      const delRes = await request(app)
        .delete(`/api/categorias/${catId}`)
        .set(authHeader(userB.token));
      expect(delRes.status).toBe(404);

      const ownerList = await request(app)
        .get('/api/categorias?soloPersonalizadas=true')
        .set(authHeader(userA.token));
      expect(ownerList.status).toBe(200);
      expect(
        ownerList.body.categorias.some((c) => c.id === catId)
      ).toBe(true);
    });
  });

  describe('recordatorios vencidos', () => {
    test('notificarVencidos es idempotente (una sola notificación)', async () => {
      if (skipIfNoDb()) return;
      const userA = await registerUser(app, 'venc-a');
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const createRes = await request(app)
        .post('/api/sistema/recordatorios')
        .set(authHeader(userA.token))
        .send({
          titulo: 'Vencido test',
          fechaRecordatorio: ayer.toISOString(),
        });
      expect(createRes.status).toBe(201);

      const first = await notificarVencidos({ userId: userA.user.id });
      expect(first.notificados).toBe(1);

      const second = await notificarVencidos({ userId: userA.user.id });
      expect(second.notificados).toBe(0);

      const notifs = await prisma.notificacion.findMany({
        where: {
          userId: userA.user.id,
          tipo: 'RECORDATORIO',
        },
      });
      expect(notifs).toHaveLength(1);
    });
  });
});
