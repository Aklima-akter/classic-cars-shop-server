const express = require('express')
const { MongoClient } = require('mongodb')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g47ip.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
// console.log('connect to the database')

async function run() {
  try {
    await client.connect()
    const database = client.db('classicCarShop')
    const productsCollection = database.collection('products')
    const usersCollection = database.collection('users')
    const reviewsCollection = database.collection('reviews')
    const bookingCollection = database.collection('allBooking')

    //get api
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({})
      const product = await cursor.toArray()
      res.send(product)
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id
      // console.log('getting spcific products', id)
      const query = { _id: ObjectId(id) }
      const product = await productsCollection.findOne(query)
      res.send(product)
    })

    app.get('/allBooking/:email', async (req, res) => {
      const result = await bookingCollection
        .find({
          email: req.params.email,
        })
        .toArray()
      res.send(result)
    })

    app.get('/allBooking', async (req, res) => {
      const cursor = bookingCollection.find({})
      const product = await cursor.toArray()
      res.send(product)
    })
    //get review
    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({})
      const product = await cursor.toArray()
      res.send(product)
    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      let isAdmin = false
      if (user?.role === 'admin') {
        isAdmin = true
      }
      res.json({ admin: isAdmin })
    })

    //insert product
    app.post('/products', async (req, res) => {
      const products = req.body
      console.log('post', products)
      const result = await productsCollection.insertOne(products)
      res.send(result)
    })
    app.post('/allBooking', async (req, res) => {
      const products = req.body
      console.log('post', products)
      const result = await bookingCollection.insertOne(products)
      res.send(result)
    })
    //insert Review
    app.post('/reviews', async (req, res) => {
      const review = req.body
      console.log('post', review)
      const result = await reviewsCollection.insertOne(review)
      res.send(result)
    })

    //post api
    app.post('/users', async (req, res) => {
      const user = req.body
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    // put api
    app.put('/users', async (req, res) => {
      const user = req.body
      const filter = { email: user.email }
      const options = { upsert: true }
      const updateDoc = { $set: user }
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      res.json(result)
    })
    //make admin
    app.put('/users/admin', async (req, res) => {
      console.log('conected')
      const user = req.body
      console.log('put', user)
      const filter = { email: user.email }
      const updateDoc = { $set: { role: 'admin' } }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.json(result)
    })

    //status update
    app.put('/allBooking/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          status: 'Shipped',
        },
      }
      const result = await bookingCollection.updateOne(
        query,
        options,
        updateDoc,
      )
      res.json(result)
    })

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id
      console.log('deletion user with id', id)
      const query = { _id: ObjectId(id) }
      const result = await productsCollection.deleteOne(query)
      console.log('deleting user with id', result)
      res.send(result)
    })

    app.delete('/allBooking/:id', async (req, res) => {
      const id = req.params.id
      console.log('deletion user with id', id)
      const query = { _id: ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      console.log('deleting user with id', result)
      res.send(result)
    })
  } finally {
    // await client.close()
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
