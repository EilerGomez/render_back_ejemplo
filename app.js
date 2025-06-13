// app.js
const express = require('express')
const { Pool } = require('pg')

const app = express()
app.use(express.json())

// Usamos solo DATABASE_URL para la conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // necesario si Render usa SSL sin certificado válido
  }
})

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente.')
})

// Crear Persona
app.post('/personas', async (req, res) => {
  const { nombre, edad, parentesco } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO Persona (nombre, edad, parentesco) VALUES ($1, $2, $3) RETURNING idpersona',
      [nombre, edad, parentesco]
    )
    res.json({ id: result.rows[0].idpersona })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
})

// Listar Personas
app.get('/personas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Persona')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
})
// Traer una persona por su id
app.get('/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM Persona WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message }); // Usar err.message en lugar de err.toString()
  }
});

// Actualizar Persona
app.put('/personas/:id', async (req, res) => {
  const { id } = req.params
  const { nombre, edad, parentesco } = req.body

  try {
    await pool.query(
      'UPDATE Persona SET nombre = $1, edad = $2, parentesco = $3 WHERE id = $4',
      [nombre, edad, parentesco, id]
    )
    res.json({ message: 'Registro actualizado' })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
})

// Eliminar Persona
app.delete('/personas/:id', async (req, res) => {
  const { id } = req.params

  try {
    await pool.query('DELETE FROM Persona WHERE idpersona = $1', [id])
    res.json({ message: 'Registro eliminado' })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`)
})
