const conexao = require('../mysql')

//Pesquisar Cliente
var Customer = function(id) {

    if(id != undefined) {
        conexao.query(`SELECT * FROM wp_latepoint_customers WHERE id = ${id}`, function (err, customer) {
            if (err) throw err;
            return customer[0]
        })
    }

}

module.exports = Customer;