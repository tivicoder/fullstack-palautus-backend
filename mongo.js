const mongoose = require('mongoose')

if (process.argv.length != 3 && process.argv.length != 5) {
  console.log('give password and optionally name and number as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0-yocm8.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})
const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) getAllPersons()
else addPerson()

function getAllPersons() {
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

function addPerson() {
  const name = process.argv[3]
  const number = process.argv[4]
  const person = new Person({ name, number })

  person.save().then(response => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
