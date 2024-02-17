//MYSQL Conexão com DB PhPMYADMIN Wordpress (LatePoint)
const mysql = require('mysql')
const axios = require('axios');

const moment = require('moment');
moment.locale('pt-br');
var logHour = moment().format('LLL')


//Conexão MYSQL
const conexao = mysql.createConnection({
    host: '185.214.126.5',
    user: 'u871428688_cN35V',
    password: 'gCwNjV8AaO',
    database: 'u871428688_Rlg2E',
})

// //MYSQL Wordpress LatePoint
conexao.connect(function (erro) {
    if (erro) throw erro;
    console.log(`${logHour} | MySQL OK - Funcionando Corretamente.`)
  })
  

module.exports = conexao;

