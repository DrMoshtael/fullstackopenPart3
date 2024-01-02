const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
	.then(() => {
		console.log('connected to MongoDB')
	})
	.catch(error => {
		console.log('error connecting to MongoDB', error.message)
	})

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: [true, 'Name required']
	},
	number: {
		type: String,
		minLength: 9, //Exercise is ambiguous - is it 8 digits or minLength of 8?
		required: [true, 'Phone number required'],
		validate: {
			validator: number => {
				return /^\d{2,3}-\d+$/.test(number)
			},
			message: '`{VALUE}` is not a valid phone number'
		}
	},
})

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Person', personSchema)