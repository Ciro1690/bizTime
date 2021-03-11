process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('amazon', 'Amazon', 'ecommerce giant') RETURNING  code, name, description`);
    testCompany = result.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", () => {
    test("Get a list with one company", async () => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany] })
    })
})

describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany, invoices: [] })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/companies/amalon`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("Creates a single company", async () => {
        const res = await request(app).post('/companies').send({ name: 'Walmart', description: 'superstore' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code: 'walmart', name: 'Walmart', description: 'superstore' }
        })
    })
})

describe("PUT /companies/:code", () => {
    test("Updates a single company", async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({ name: 'Costco', description: 'superstore' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: { code: testCompany.code, name: 'Costco', description: 'superstore' }
        })
    })
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).put(`/companies/walmmart`).send({ name: 'Costco', description: 'superstore' });
        expect(res.statusCode).toBe(404);
    })
})
describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" })
    })
})