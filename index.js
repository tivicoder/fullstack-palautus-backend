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



const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })


const personSchema = new mongoose.Schema({
  name: String,
  number: String
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)



let personsCache = []

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    personsCache = persons.map(person => person.toJSON())
    console.log(personsCache)
    response.json(personsCache)
  })
})

app.get('/api/persons/:id', (request, response) => {
  // TODO: add exception handling for not found person
  Person.findById(request.params.id).then(person => {
    console.log('person: ', person)
    if (person) {
      response.json(person.toJSON())
    } else {
      response.status(404).end()
    }
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  Person.findByIdAndDelete(request.params.id).then(person => {
    console.log('removed')
    response.status(204).end()
  })
})

app.get('/api/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<div>Phonebook has info for ${persons.length} people</div><br/>` + 
    `<div>${Date()}</div>`)
  })
})

app.post('/api/persons', (request, response) => {
  const newPerson = new Person({
    name: request.body.name,
    number:  request.body.number
  })

  // reject if name or number is empty
  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({error: 'name or number missing'})
  }

  // reject if name exists
  if (personsCache.find(person => person.name === newPerson.name)) {
    return response.status(400).json({error: 'name must be unique'})
  }

  newPerson.save().then(savedPerson => {
    savedPerson = savedPerson.toJSON()
    personsCache = personsCache.concat(savedPerson)
    console.log('new persons: ', personsCache)
    response.json(savedPerson)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})