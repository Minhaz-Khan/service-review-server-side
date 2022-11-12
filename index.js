const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authoraization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'unauthorized access 2' })
        }
        req.decoded = decoded
        next()
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.drtwsrz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const servicesCollection = client.db('servicesReview').collection('services');
        const reviewsCollection = client.db('servicesReview').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' })
            res.send({ token })
        })


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
        app.get('/myreview/:email', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log(decoded);
            if (decoded.user !== req.params.email) {
                return res.status(403).send({ message: 'unautorized access 3' })
            }
            const email = req.params.email;
            const query = { email: email };
            const cursor = reviewsCollection.find(query).sort({ timestamp: 1 });
            const reviews = await cursor.toArray();
            res.send(reviews);

        })

        app.get('/myreviewDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.findOne(query);
            res.send(result)
        })
        app.put('/myreviewDetails/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const Review = req.body;
            console.log(Review);
            const options = { upsert: true };
            const updateReviw = {
                $set: {
                    review: Review.review,
                    rating: Review.rating
                },
            };
            const result = await reviewsCollection.updateOne(filter, updateReviw, options);
            res.send(result)
        })
        app.delete('/myreviewDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result)
        })
        app.post('/review', async (req, res) => {
            const doc = req.body;
            const result = await reviewsCollection.insertOne(doc)
            const id = req.body.serviceId;
            const query = { serviceId: id };
            const cursor = reviewsCollection.find(query).sort({ timestamp: 1 });
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