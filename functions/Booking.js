const conexao = require('../mysql')
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

module.exports = Booking;