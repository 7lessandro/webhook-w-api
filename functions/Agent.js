const conexao = require('../mysql')

//Pesquisar Barbeiro
var Agent = function(id) {

    if(id != undefined) {
        conexao.query(`SELECT * FROM wp_latepoint_agents WHERE id = ${id}`, function (err, agent) {
            if (err) throw err;
            console.log(agent[0])
        })
    }

}

module.exports = Agent;