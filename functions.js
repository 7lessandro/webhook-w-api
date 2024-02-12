// var moment = require('moment');

// //Data de hoje
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
// console.log(`${year}-${month}-${day}`);



//Arrays

const numeros_msg = []

const clientes = [
    {
        id: 1,
        first_name: 'Alessandro Silva',
        email: 'alessandroascencio@outlook.com',
        phone: '+5515991986577'
    },
    {
        id: 2,
        first_name: 'João Silva',
        email: 'alessandroascencio@outlook.com',
        phone: '+55155236577'
    },
    {
        id: 2,
        first_name: 'Frederico Lombardi',
        email: 'alessandroascencio@outlook.com',
        phone: '+551555344577'
    },
]

clientes.forEach(numero => {
    numeros_msg.push(numero.phone.match(/\d/g).join(""))
});

console.log(numeros_msg)