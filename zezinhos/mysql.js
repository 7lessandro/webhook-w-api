//MYSQL Conexão com DB PhPMYADMIN Wordpress (LatePoint)
const mysql = require('mysql2')
const axios = require('axios');


// //Data Atual
// const moment = require('moment');

// var localTime = moment().format('YYYY-MM-DD'); // store localTime
// var hoje = localTime

// //Data de amanhã
// let d = new Date();

// // Adicionando um dia a mais 
// d.setDate(d.getDate() + 1);

// let year = d.getFullYear()
// let month = String(d.getMonth() + 1)
// let day = String(d.getDate())

// // Adding leading 0 if the day or month
// // is one digit value
// month = month.length == 1 ?
//     month.padStart('2', '0') : month;

// day = day.length == 1 ?
//     day.padStart('2', '0') : day;

// // Data atual
// const amanhã = `${year}-${month}-${day}`;


//Conexão MYSQL
const conexao = mysql.createConnection({
    host: '185.214.126.5',
    user: 'u871428688_j3RxS',
    password: 'Zezinho@1',
    database: 'u871428688_2i1Rj'
})

// var numbers = []

// //Enviar mensagem para vários clientes

// const clientes = `SELECT * FROM wp_latepoint_customers`
// conexao.query(clientes, function (erro, clientes) {
//     if (erro) throw erro;
//     clientes.forEach(cliente => {
//         numbers.push(cliente.phone.match(/\d/g).join(""))
//     });
    
//     if(numbers[0].lenght > 1) {
//         axios.post('https://host05.serverapi.dev/message/sendTextMany?connectionKey=w-api_MYQX6NCANN',
//         {
//             numbers: numbers, message: { text: "❤️" }, delayMessage: 5000
//         })
//         .then(() => console.log(`Notificação de vários números`))
//         .catch((error) => console.log(`Ops, erro ao enviar a notificação. ${error.message}`))
//     } else {
//         console.log('ops')
//     }

    
// })

module.exports = conexao

