const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y15rh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const donationCollection = client.db("careHub").collection("all_donation");
    const paymentsCollection = client.db("careHub").collection("payments");


    // All_donation
    app.get("/all_donation", async(req,res) => {
     const result = await donationCollection.find().toArray();
     res.send(result);
 })


     // specific for charity
     app.get('/charityDetails/:id', async(req, res) =>{
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await donationCollection.findOne(query);
          res.send(result);
      })


     app.get('/payments', async(req, res) =>{
      const result = await paymentsCollection.find().toArray();
      res.send(result);
      })


      //payment intent
      app.post('/create-payment-intent', async (req, res) => {
        const { price } = req.body;
    
        // Ensure price is a valid number
        if (isNaN(price) || price <= 0) {
            return res.status(400).send({ error: 'Invalid price value' });
        }
    
        const amount = parseInt(price * 100);
    
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card'],
            });
    
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Something went wrong' });
        }
    });
    

    // payment data save 
    app.post('/payments', async(req, res) =>{
      const payment = req.body;
      const paymentResult = await paymentsCollection.insertOne(payment);

      // console.log('payment info', payment)
      res.send(paymentResult)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
    res.send('care hub is running....')
})

app.listen(port, () => {
    console.log(`care hub is running on port ${port}`);
})


