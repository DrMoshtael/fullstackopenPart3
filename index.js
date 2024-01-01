const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

const assignID = (request, response, next) => {
    request.id = JSON.stringify(request.body)
    next()
}

morgan.token('id',(request,response) => {
    return request.id
})

app.use(assignID)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :id'))



let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(people => {
            response.json(people)
        })
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(result => {
        response.send(`Phonebook has info for ${result} people.
        <br/><br/> ${Date()}`)
    })
    // console.log("count",count,typeof(count),"counted")
    // response.send(`Phonebook has info for ${count} people.
    // <br/><br/> ${Date()}`)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))

    // const id=Number(request.params.id)
    // const person=persons.find(person=>person.id===id)
    // if (!person) {return response.status(404).end()}
    // response.json(person)
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => response.status(204).end())
        .catch(error => next(error))

    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end()
})

// const generateID = () => {
//     return (
//         Math.floor(Math.random()*1000000)+1
//     )
// }



app.post('/api/persons', (request, response) => {
    const body = request.body
    
    if (body.name === undefined || body.number === undefined) {
        console.log('failed')
        return response.status(400).json({
            error:'name or number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(result => {
            response.json(result)
            console.log(result,'saved')
        })

    // if (persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())) {
    //     console.log('failed 2')
    //     return (response.status(400).json({
    //         error: 'name must be unique'
    //     }))
    // }
      
    // const person = {
    //     id: generateID(),
    //     name: body.name,
    //     number: body.number
    // }

    // persons = persons.concat(person)

    // response.json(person)
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandling = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response
            .status(400)
            .send({
                error: 'malformatted id'
            })
    }

    next(error)
}

app.use(errorHandling)

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`))