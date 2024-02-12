const conexao = require('../mysql')

//Pesquisar Serviços
// var Service = function(id) {

//     if(id != undefined) {
//         conexao.query(`SELECT * FROM wp_latepoint_services WHERE id = ${id}`, function (err, service) {
//             if (err) throw err;
//             console.log(service[0])
//         })
//     }

// }

var Service = function(id) {

    if(id != undefined) {
        const query = `SELECT * FROM wp_latepoint_services WHERE id = ${id}`
        conexao.query(query, function(err, result) {
            return result
        }).then(() => {console.log(result)}).catch(() => {console.log('deu merda')})
    }

}

module.exports = Service;