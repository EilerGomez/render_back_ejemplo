// app.js
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configuración de PostgreSQL usando variables de entorno
const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

db.connect()
  .then(() => console.log('Conectado a la base de datos PostgreSQL.'))
  .catch((err) => console.error('Error al conectar a PostgreSQL:', err));

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente.');
});

// Crear Persona
app.post('/personas', async (req, res) => {
    const { nombre, edad, parentesco } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO Persona (nombre, edad, parentesco) VALUES ($1, $2, $3) RETURNING idpersona',
            [nombre, edad, parentesco]
        );
        res.json({ id: result.rows[0].idpersona });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

// Listar Persona
app.get('/personas', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Persona');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

// Actualizar Persona
app.put('/personas/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, edad, parentesco } = req.body;

    try {
        await db.query(
            'UPDATE Persona SET nombre = $1, edad = $2, parentesco = $3 WHERE idpersona = $4',
            [nombre, edad, parentesco, id]
        );
        res.json({ message: 'Registro actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

// Eliminar Persona
app.delete('/personas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM Persona WHERE idpersona = $1', [id]);
        res.json({ message: 'Registro eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

// Arrancar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}.`);
});
