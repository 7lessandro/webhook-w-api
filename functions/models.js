const conexao = require('./mysql')
//Criar models para enviar as requisições do webhook diretamente ao MYSQL

//Pesquisar Agendamento
var Booking = function(id) {

    if(id != undefined) {
        conexao.query(`SELECT * FROM wp_latepoint_bookings WHERE id = ${id}`, function (err, booking) {
            if (err) throw err;
            console.log(booking[0])
        })
    }

}

//Pesquisar Cliente
var Customer = function(id) {

    if(id != undefined) {
        conexao.query(`SELECT * FROM wp_latepoint_costumer WHERE id = ${id}`, function (err, costumer) {
            if (err) throw err;
            console.log(costumer[0])
        })
    }

}

//Pesquisar Serviço
var Service = function(id) {

    if(id != undefined) {
        const resultados = conexao.query(`SELECT * FROM wp_latepoint_services WHERE id = ${id}`)
        .then(service => service.json())
        .catch(error => console.log(error))
        .finally()
    }

}
module.exports = Booking, Customer, Service;