const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.drtwsrz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const servicesCollection = client.db('servicesReview').collection('services');
        const reviewsCollection = client.db('servicesReview').collection('reviews');
        app.get('/homeservices', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const result = await cursor.limit(3).toArray();
            res.send(result);
        })
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result)

        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.findOne(query);
            res.send(result)

        })
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id };
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);

        })
        // app.get('/myreview/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email: email };
        //     const cursor = reviewsCollection.find(query);
        //     const reviews = await cursor.toArray();
        //     res.send(reviews);

        // })
        app.get('/myreview', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.post('/review', async (req, res) => {
            const doc = req.body;
            const result = await reviewsCollection.insertOne(doc)
            const id = req.body.serviceId;
            const query = { serviceId: id };
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            console.log(reviews);
            res.send(reviews);

        })
    }
    catch { }
}
run().catch(e => console.log(e))


app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(port, () => {
    console.log(`service review run on port: ${port}`);
})