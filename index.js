const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const cron = require('node-cron')
const conexao = require('./mysql')
const request = require('request');

//Funções MYSQL
const Booking = require('./functions/Booking')
const Costumer = require('./functions/Customer')
const Service = require('./functions/Service')
const Agent = require('./functions/Agent')

const axios = require('axios');

const app = express()
const server = require('http').createServer(app);
const port = 80

//Inf API painel.w-api.app

const host = 'apistart02.megaapi.com.br'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb25uZWN0aW9uS2V5Ijoidy1hcGlfTVlRWDZOQ0FOTiIsImlhdCI6MTcwNjcyNzk0NX0.EmwN8ix3m7daeB_lnvIIexmZaKSBbeT8MeqMkZ9ppeI'
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//Cors
app.use(cors())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

//BodyParser

app.use(bodyParser.json({
  extended: true,
  limit: '100000kb',
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '100000kb',
}));

//MYSQL Wordpress LatePoint
conexao.connect(function (erro) {
  if (erro) throw erro;
  console.log('conexão efetuada')
})

//Data Atual
const moment = require('moment');
const { setTimeout } = require('timers/promises');

var localTime = moment().format('YYYY-MM-DD'); // store localTime
var hoje = localTime

//Data de amanhã
let d = new Date();

// Adicionando um dia a mais 
d.setDate(d.getDate() + 1);

let year = d.getFullYear()
let month = String(d.getMonth() + 1)
let day = String(d.getDate())

// Adding leading 0 if the day or month
// is one digit value
month = month.length == 1 ?
  month.padStart('2', '0') : month;

day = day.length == 1 ?
  day.padStart('2', '0') : day;

// Data atual
const tomorrow = `${day}/${month}/${year}`;

//Rotas

app.get('/', (req, res) => {
  res.send('olá, essa é a página inicial')
})

//Notificação quando o agendamento é criado.
app.post('/webhook/create', (req, res) => {

  function toMessage() {
    var phone = req.body.customer.custom_fields.cf_wPDBOZcQ
    var phoneNumber = phone.match(/\d/g).join("")
    var name_client = req.body.customer.full_name

    var name_barber = req.body.agent.full_name
    var price = req.body.price
    var service = req.body.service_name
    var duration = req.body.duration
    var date = req.body.start_date
    var hour = req.body.start_time

    var agendamentos = "SELECT * from wp_latepoint_bookings WHERE status = 'approved' "

    var mensagem = `Olá, ${name_client} 😊

    *O seu agendamento foi realizado com sucesso!*
    
    *Barbeiro*: ${name_barber}.
    *Serviço:* ${service}.
    *Valor Total:* ${price}.
    *Duração:* ${duration} min.
    *Data do Agendamento:* ${date} às ${hour}`

    var mensagem_reminder =
      `
*Informações do seu agendamento:*

*Barbeiro*: ${name_barber}.
*Serviço:* ${service}.
*Valor Total:* ${price}.
*Duração:* ${duration} min.
*Data do Agendamento:* ${date} às ${hour}`

    axios.post('https://host05.serverapi.dev/message/sendText?connectionKey=w-api_MYQX6NCANN',
      {
        phoneNumber, message:
          `Olá, ${name_client} 😊

*O seu agendamento foi realizado com sucesso!*

*Barbeiro*: ${name_barber}.
*Serviço:* ${service}.
*Valor Total:* ${price}.
*Duração:* ${duration} min.
*Data do Agendamento:* ${date} às ${hour}`, delayMessage: 5000
      }).then(response => { console.log(`Notificação do agendamento ${req.body.booking_code} realizada com sucesso.`) }).catch(error => { console.log(`Erro ao realizar o envio WhatsApp do agendamento ${req.body.booking_code}, informações do erro:${error}`) })

    conexao.query(`INSERT INTO wp_latepoint_reminders (booking_code, date, hour, phone, message, active, sent) VALUES  ("${req.body.booking_code}", "${date}", "${hour}", "${phoneNumber}", "${mensagem_reminder}", "yes", "no")`), async function (error, results, fields) {
      console.log(`Agendamento ${req.body.booking_code} realizado com sucesso.`)
      if (error) throw err;
    }
  }

  if (res.statusCode == 200) {
    res.send(toMessage())
  } else {
    console.log(`Erro ao enviar a notificação. Erro: ${res.statusCode}`)
  }
})

//Notificação quando o agendamento é cancelado.
app.post('/webhook/update', (req, res) => {

  function toMessage() {
    var phone = req.body.customer.custom_fields.cf_wPDBOZcQ
    var phoneNumber = phone.match(/\d/g).join("")
    var name_client = req.body.customer.full_name

    var name_barber = req.body.agent.full_name
    var price = req.body.price
    var service = req.body.service_name
    var duration = req.body.duration
    var date = req.body.start_date
    var hour = req.body.start_time

    var message = `Olá, ${name_client} 😊

Poxa, vejo que o seu agendamento do dia *${date} às ${hour}* foi cancelado :(

O seu barbeiro ${name_barber} já foi notificado, tá bom? Estaremos sempre à disposição!!`


    axios.post('https://host05.serverapi.dev/message/sendText?connectionKey=w-api_MYQX6NCANN',
      {
        phoneNumber, message, delayMessage: 5000
      }).then(response => { console.log(`Notificação do cancelamento do agendamento ${req.body.booking_code} realizada com sucesso.`) }).catch(error => { console.log(error) })

    conexao.query(`UPDATE wp_latepoint_reminders SET active = 'no' where booking_code = '${req.body.booking_code}'`, async function (error, results, fields) {
      console.log(`${req.body.booking_code} foi cancelado com sucesso.`)
    })
  }

  if (res.statusCode == 200) {
    res.send(toMessage())
  } else {
    console.log(`Erro ao enviar a notificação. Erro: ${res.statusCode}`)
  }
})


//Enviar lembrete de agendamento para apenas 01 contato
app.get('/webhook/reminder/:bookingid', (req, res) => {
  const bookingId = req.params.bookingid
  var data = ''
  var phoneNumber = ''

  if (bookingId != undefined) {

    var sql = `SELECT * FROM wp_latepoint_reminders WHERE booking_code = "${bookingId}"`
    conexao.query(sql, function (err, result) {
      if (err) throw err;
      data = result[0]
      phoneNumber = data.phone
      console.log(`${phoneNumber}"@s.whatsapp.net`)

      axios.post('https://host05.serverapi.dev/message/sendText?connectionKey=w-api_MYQX6NCANN',
        {
          phoneNumber, message: "Heey @" + phoneNumber + "estou passando para avisar que você tem um agendamento confirmado para amanhã, ok? Estamos no aguardo rs\r\n"

            +

            data.message
        })
        .then(() => console.log(`Lembrete foi enviado com sucesso`))
        .catch((error) => console.log(`Ops, erro ao enviar a notificação. ${error}`))
    });
    res.send('Lembrete enviado com sucesso!')
  } else {
    console.log('deu errado')
  }
})


////////////// Comentário do Cron

// var tomorrowsAppointments = `SELECT * FROM wp_latepoint_reminders WHERE date = "${tomorrow}" AND active = "yes" AND sent = "no";`

// conexao.query(tomorrowsAppointments, function (err, result) {
//   if (err) throw err;

//   var numbers = []
//   var bookingCodes = []

//   result.forEach(booking => {
//     numbers.push(booking.phone)
//     bookingCodes.push(booking.booking_code)
//   });

//   axios.post('https://host05.serverapi.dev/message/sendTextMany?connectionKey=w-api_MYQX6NCANN',
//     {
//       numbers, message: {
//         text: `Olá! Tudo bem? Estamos passando para te lembrar que amanhã é o seu agendamento, ok? 
    
// Para mais informações referente ao seu agendamento consulte nossas mensagens anteriores ou acesse nosso site www.www.rkentretenimento.com.br e logue em sua conta.
//     `}, delayMessage: 10000
//     })
//     .then(() => console.log(`Notificação dos seguintes agendamentos enviadas: ${bookingCodes}`))
//     .catch((error) => console.log(`Ops, erro ao enviar a notificação. ${error.message}`))

// })

app.listen(port, () => {
  console.log(`Servidor OK}`)
})

///////////////////////////////////////////////////////////////////////////////////////////////////////

//CronJobs -> Lembrete para acessar os Reminders

//Fazer uma atualização todo dia as 23:00 para reativar os lembretes

// cron.schedule('* * * * * *', () => {
//   console.log('Rodando a cada 5 minutos uma ação para visualizar se tem agendamentos para a data de amanhã para enviar uma notificação de lembrete');

//   conexao.connect(function (erro) {
//     if (erro) throw erro;
//     console.log('conexão efetuada')

//     var agendamentosAprovados = `SELECT * FROM wp_latepoint_reminders WHERE date like "%${amanhã}%"`
//     console.log(agendamentosAprovados)

// conexao.query(agendamentosAprovados, function (erro, agendamento) {
//   if (erro) throw erro;
//   //Verificar se possui algum agendamento para amanhã
//   if (agendamento[0] != undefined) {

//     var cliente = `SELECT id, first_name, email, phone FROM wp_latepoint_customers WHERE id = ${agendamento[0].agent_id}`
//     conexao.query(cliente, function (erro, cliente) {
//       if (erro) throw erro;

//       //Localizar o cliente em base do ID do resultado anterior do agendamento
//       if (cliente[0] != undefined) {
//         console.log(cliente)
//       } else {
//         //Erro caso não localize nenhum cliente
//         console.log('Não possui nenhum cliente com este ID')
//       }
//     })
//   } else {
//     //Caso não tenha, enviar uma mensagem de erro
//     console.log('Não possui nenhum agendamento para amanhã =)')
//   }
// })

//////////////////////////

//   })

// }, {
//   scheduled: true,
//   timezone: "America/Sao_Paulo"
// });
