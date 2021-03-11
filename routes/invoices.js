const express = require("express")
const ExpressError = require("../expressError")
const router = express.Router()
const db = require('../db')

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`)
        return res.json({ invoices: results.rows })
    } catch (e) {
        return next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }
        return res.send({ invoice: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING comp_code, amt`, [comp_code, amt]);
        return res.status(201).json({ invoice: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;
        let paid_date;
        if (paid === true) {
            // https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = yyyy + '-' + mm + '-' + dd;
            paid_date = today
        } else if (paid === false) {
            paid_date = null
        }
        const results = await db.query(`UPDATE invoices SET amt=$1, paid_date=$2, paid=$3 WHERE id=$4 RETURNING id, amt, paid_date, paid`, [ amt, paid_date, paid, id]);
        const returnValues = await db.query(`
            SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices
            WHERE id = ${id}
        `)
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update invoice with id of ${id}`, 404)
        }
        return res.send({ invoice: returnValues.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
        return res.send({ status: "deleted" })
    } catch (e) {
        return next(e)
    }
})

module.exports = router;