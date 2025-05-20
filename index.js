//Imports
const express = require("express");
const routes = require("./routes/index.js");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config({path:'variables.env'});
const cors = require('cors');
const path = require('path');

const {DB_CONNECTION,SERVER_PORT,FRONTEND_URL} = process.env


//conexion a la DB
mongoose.Promise = global.Promise;
mongoose.connect(DB_CONNECTION)
.then(()=>console.log('MongoDB Conectado..'))
.catch((err)=>console.log(err));

// App del Servidor
const app = express();

// habilitar bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// const whitelist = [FRONTEND_URL];
// const corsOptions = {
//     origin: (origin, callback) =>{
//         // Revisar si la peticion viene de un server en la whitelist
//         const existe = whitelist.some( dominio => dominio === origin );
//         if(existe){
//             callback(null,true)
//         } else {
//             callback(new Error('Error de CORS'))
//         }
//     }
// }

// Habilitar cors
app.use(cors());

// Routing de la app
app.use('/', routes());

//carpeta publica
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// puerto
app.listen(SERVER_PORT)

