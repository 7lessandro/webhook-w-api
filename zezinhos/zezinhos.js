const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const cron = require('node-cron')
const conexao = require('./mysql')

const axios = require('axios');

const app = express()
const server = require('http').createServer(app);
const port = process.env.ZEZINHOSPORT || 3000

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

app.set('view engine', 'ejs');
app.set('views', './views');

//Data Atual
const moment = require('moment');
moment.locale('pt-br');

var localTime = moment().format('YYYY-MM-DD'); // store localTime
var logHour = moment().format('LLL')

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
  res.json({
    "barber": "Zezinhos Barbearia",
    "status": res.statusCode,
    "server_start": `${logHour}`
  })
})

//Notificação quando o agendamento é criado.
app.post('/webhook/create', (req, res) => {

  function toMessage() {
    var phone = req.body.customer.custom_fields.cf_wPDBOZcQ
    var phoneNumber = phone.match(/\d/g).join("")
    var name_client = req.body.customer.full_name

    var name_barber = req.body.agent.full_name
    var price = req.body.price
    var payment = req.body.payment_method
    var service = req.body.service_name
    var duration = req.body.duration
    var date = req.body.start_date
    var hour = req.body.start_time

    if (payment === 'local') {
      payment = 'Pagamento Presencial'
    }

    var mensagem = `Olá *${name_client}*!

Como você está?
    
Somos da *Zezinhos Barbearia* e gostaríamos de informar que seu agendamento com nosso barbeiro *${name_barber}* 💇🏻‍♂️ foi realizado com sucesso ✅

Estaremos te esperando no dia *${date}* às *${hour}h* 📆
    
Você agendou o serviço de *${service}*, com um tempo estimado de finalização de *${duration} minutos* ⏱️.
A forma de pagamento selecionada foi *${payment}* com o valor total de *${price}* 💵

*Endereço:*
📍 Rua Dr. Ruy Barbosa, 279 - Vila Hortência, Sorocaba - SP.
    
Até mais! 😄`

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
        phoneNumber, message: mensagem, delayMessage: 5000
      }).then(response => { console.log(`${logHour} | Notificação do agendamento ${req.body.booking_code} realizada com sucesso.`) }).catch(error => { console.log(`${logHour} | Erro ao realizar o envio WhatsApp do agendamento ${req.body.booking_code}, informações do erro:${error}`) })

    conexao.query(`INSERT INTO wp_latepoint_reminders (booking_code, date, hour, phone, message, active, sent) VALUES  ("${req.body.booking_code}", "${date}", "${hour}", "${phoneNumber}", "${mensagem_reminder}", "yes", "no")`), async function (error, results, fields) {
      if (error) throw err;
      console.log(`${logHour} | Agendamento ${req.body.booking_code} realizado com sucesso.`)
    }
  }

  if (res.statusCode == 200) {
    res.send(toMessage())
  } else {
    console.log(`${logHour} | Erro ao enviar a notificação. Erro: ${res.statusCode}`)
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
      }).then(response => { console.log(`${logHour} | Notificação do cancelamento do agendamento ${req.body.booking_code} realizada com sucesso.`) }).catch(error => { console.log(error) })

    conexao.query(`UPDATE wp_latepoint_reminders SET active = 'no' where booking_code = '${req.body.booking_code}'`, async function (error, results, fields) {
      console.log(`${logHour} | ${req.body.booking_code} foi cancelado com sucesso.`)
    })
  }

  if (res.statusCode == 200) {
    res.send(toMessage())
  } else {
    console.log(`${logHour} | Erro ao enviar a notificação. Erro: ${res.statusCode}`)
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

//Enviar mensagem após finalização do serviço
app.post('/webhook/end', (req, res) => {

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

    axios.post('https://host05.serverapi.dev/message/sendImageUrl?connectionKey=w-api_MYQX6NCANN',
      {
        phoneNumber, url: "https://genialcarimbos.com.br/cdn/shop/products/1781a8c181ce929429300a42c7a58d5b.png?v=1668608769", caption: `Obrigado *${name_client}* por confiar em nosso trabalho. Ficamos muito felizes com a sua presença hoje em nossa barbearia.
O seu feedback é muito importante para nós, fique a vontade para dizer o que você acha:

Avaliação: https://abre.ai/iTmS`

      }).then(response => { console.log(`${logHour} | Notificação do agendamento para avaliação ${req.body.booking_code} realizada com sucesso.`) }).catch(error => { console.log(`${logHour} | Erro ao realizar o envio WhatsApp da Avaliação do agendamento ${req.body.booking_code}, informações do erro:${error}`) })
  }

  if (res.statusCode == 200) {
    res.send(toMessage())
  } else {
    console.log(`${logHour} | Erro ao enviar a notificação da Avaliação. Erro: ${res.statusCode}`)
  }
})

app.listen(port, () => {
  console.log(`${logHour} | Servidor OK - Funcionando Corretamente.`)
})

// Rotina Cron Job para lembrar que o cliente possui um agendamento marcado para a data de amanhã (Enviado todo dia às 19h00)
cron.schedule('20 09 * * *', () => {
  var tomorrowsAppointments = `SELECT * FROM wp_latepoint_reminders WHERE date = "${tomorrow}" AND active = "yes" AND sent = "no";`

  conexao.query(tomorrowsAppointments, function (err, result) {
    if (err) throw err;

    var numbers = []
    var bookingCodes = []

    result.forEach(booking => {
      numbers.push(booking.phone)
      bookingCodes.push(booking.booking_code)
    });

    axios.post('https://host05.serverapi.dev/message/sendTextMany?connectionKey=w-api_MYQX6NCANN',
      {
        numbers, message: {
          text: `*⚠️ ATENÇÃO ⚠️*
Boa noite, tudo bem? Estamos passando para te lembrar que amanhã é o seu agendamento, ok? 
    
Para mais informações referente ao seu agendamento consulte nossas mensagens anteriores ou acesse nosso site ZezinhosBarbearia.com.br e logue em sua conta.
    `}, delayMessage: 9000
      })
      .then(() => console.log(`${logHour} | Cron Jobs dos lembretes enviados: ${bookingCodes}`))
      .catch((error) => console.log(`${logHour} | Ops, erro ao enviar a notificação Cron dos Lembretes. ${error.message}`))

  })
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});