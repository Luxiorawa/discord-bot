const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
dotenv.config()

const pool = mysql.createPool({
    connectionLimit: 50,
    queueLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DEFAULT,
    waitForConnections: true,
})

exports.select = async function (sql, args = []) {
    try {
        console.log(`[MySQL] - Executing following select : ${sql}`)

        const [rows] = await pool.query(sql, args)
        if (rows.length === 1) {
            return rows[0]
        }
    } catch (error) {
        console.log(`An error occured during select ${error}`)
        throw new Error(error)
    }
}

exports.selectList = async function (sql, args = []) {
    try {
        console.log(`[MySQL] - Executing following selectList : ${sql}`)
        const [rows] = await pool.query(sql, args)
        if (rows.length >= 1) {
            return rows
        }
    } catch (error) {
        console.log(`An error occured during selectList ${error}`)
        throw new Error(error)
    }
}

exports.insert = async function (sql, args = []) {
    try {
        console.log(`[MySQL] - Executing following insert : ${sql}`)
        const [rows] = await pool.query(sql, args)
        if (rows.affectedRows === 1) {
            return rows.insertId
        }
    } catch (error) {
        console.log(`An error occured during insert ${error}`)
        throw new Error(error)
    }
}

exports.update = async function (sql, args = []) {
    try {
        console.log(`[MySQL] - Executing following update : ${sql}`)
        const [rows] = await pool.query(sql, args)
        if (rows.affectedRows >= 1) {
            return true
        }
    } catch (error) {
        console.log(`An error occured during update ${error}`)
        throw new Error(error)
    }
}

exports.delete = async function (sql, args = []) {
    try {
        console.log(`[MySQL] - Executing following delete : ${sql}`)
        const [rows] = await pool.query(sql, args)
        if (rows.affectedRows >= 1) {
            return true
        }
    } catch (error) {
        console.log(`An error occured during delete ${error}`)
        throw new Error(error)
    }
}
