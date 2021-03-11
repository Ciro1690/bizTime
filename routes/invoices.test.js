process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testInvoice;
beforeEach(async () => {
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('amazon', 'Amazon', 'ecommerce giant') RETURNING  code, name, description`);
    const invResult = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('amazon', 65) RETURNING  id, comp_code, amt`);
    testInvoice = invResult.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
    test("Get a list with one invoice", async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoices: [expect.any(Object)] })
    })
})

describe("GET /invoices/:id", () => {
    test("Gets a single invoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoice: expect.any(Object) })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /invoices", () => {
    test("Creates a single invoice", async () => {
        const res = await request(app).post('/invoices').send({ comp_code: 'amazon', amt: 100 });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: expect.any(Object)
        })
    })
})

describe("PUT /invoices/:id", () => {
    test("Updates a single invoice", async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ comp_code: 'amazon', amt: '80' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: expect.any(Object)
        })
    })
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).put(`/invoices/0`).send({ comp_code: 'amazon', amt: '80' });
        expect(res.statusCode).toBe(404);
    })
})
describe("DELETE /invoices/:id", () => {
    test("Deletes a single invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" })
    })
})