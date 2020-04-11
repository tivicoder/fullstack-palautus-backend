const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(cors())
morgan.token('content', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan('tiny', {
  skip: function (req, res) { return req.method === "POST" }
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', {
  skip: function (req, res) { return req.method !== "POST" }
}))
app.use(express.static('build'))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(note => note.id !== id)
  response.status(204).end()
})

app.get('/api/info', (request, response) => {
   response.send(`<div>Phonebook has info for ${persons.length} people</div><br/>` + 
            `<div>${Date()}</div>`)
})

app.post('/api/persons', (request, response) => {
  const newPerson = request.body

  // reject if name or number is empty
  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({error: 'name or number missing'})
  }

  // reject if name exists
  if (persons.find(person => person.name === newPerson.name)) {
    return response.status(400).json({error: 'name must be unique'})
  }

  newPerson.id = Math.floor(Math.random()*10000)
  persons = persons.concat(newPerson)

  response.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})