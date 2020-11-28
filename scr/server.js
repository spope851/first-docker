const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const port = process.env.PORT || 5000;

const MONGO_URL = 'mongodb://admin:password@localhost:27017'
const MONGO_OPTIONS = { useUnifiedTopology: true, authSource: 'admin' }
const USER_DB = 'user_account'
const USER_TABLE = 'users'
const USER_ENDPOINT = '/api/users'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function getUsers(response,client) {
  let responses = []
  let cursor = client.db(USER_DB).collection(USER_TABLE).find()
  await cursor.forEach( el => {
    responses.push(el)
  })
  client.close()
  response.send(responses)
}

async function logout(response,client) {
  await client.db(USER_DB).collection(USER_TABLE).updateOne(
    {signedIn:true},
    { $set: {signedIn:false} }
  )
  getUsers(response,client)
}

async function login(response,client,id) {
  await client.db(USER_DB).collection(USER_TABLE).updateOne(
    {id:id},
    { $set: {signedIn:true} }
  )
  getUsers(response,client)
}

async function signup(response,client,body) {
  await client.db(USER_DB).collection(USER_TABLE).insertOne(body)
  getUsers(response,client)
}

async function populate(response,client,body) {
  await client.db(USER_DB).collection(USER_TABLE).insertMany(body)
  getUsers(response,client)
}

async function deleteUser(response,client,id) {
  await client.db(USER_DB).collection(USER_TABLE).deleteOne({id:id})
  getUsers(response,client)
}

async function changePassword(response,client,id,newPassword) {
  await client.db(USER_DB).collection(USER_TABLE).updateOne(
    {id:id},
    { $set: {
        password:newPassword,
        signedIn:false
      } 
    }
  )
  getUsers(response,client)
}

app.get(USER_ENDPOINT, (req, res) => {
  MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
    if (err) throw err  
    getUsers(res, client)      
  })
});

app.put(USER_ENDPOINT, (req, res) => {
  console.log('PUT   ',req.body)  
  MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
    if (err) throw err
    if (req.body.function === 'logout'){logout(res, client)}
    if (req.body.function === 'login'){login(res, client, req.body.id)}
    if (req.body.function === 'changePassword'){changePassword(res, client, req.body.id, req.body.newPassword)}
    if (req.body.function === 'populate'){populate(res, client, req.body.users)}
  })
});

app.post(USER_ENDPOINT, (req, res) => {
  console.log('POST  ',req.body);
  MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
    if (err) throw err  
    signup(res, client, req.body)      
  })
});

app.delete(USER_ENDPOINT, (req, res) => {
  console.log('DELETE',req.body);
  MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
    if (err) throw err  
    deleteUser(res, client, req.body.id)      
  })
});

app.listen(port, () => console.log(`Listening on port ${port}`));