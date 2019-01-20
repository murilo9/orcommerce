var mysql = require('mysql');   //Faz o require do módulo mysql

//Declara o mysql connections pool:
var pool  = mysql.createPool({
    connectionLimit : 10,
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'orcommerce'
});

module.exports = function(app, session){

    app.route('/session')
    .get(function(req, res){                                //------Session GET------
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('Recebeu GET session');
        //Coleta os dados da request:
        var sessionId = req.body.sessionId;
        var email = req.body.email;
        var now = new Date();
        var found = 0;
        session.forEach(function(val, i){       //Percorre o array de session ids
            if(val.id == sessionId && val.email == email){
                if(val.expire < now)      //Caso a session tenha expirado
                    session.splice(i,i);
                else
                    found = 1;
            }
        });
        if(!found)      //Caso a session não seja válida ou tenha expirado
            res.status(404);        //Status 404 not found
        res.end();
    })
    .post(function(req, res){                               //------Session POST------
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('Recebeu POST session');
        var funcao = req.body.funcao;
        switch(funcao){
            case 'create':          //------Session create
                console.log('session create');
                console.log(req.body);
                //Coleta os dados da request:
                var email = req.body.email;
                var senha = req.body.senha;
                //Faz a consulta ao BD:
                var sql = "SELECT stSenha FROM tbUsuarios WHERE stEmail = '"+email+"'";
                pool.query(sql, function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500);
                    }else{
                        if(result[0].stSenha == senha){         //Caso o login seja válido
                            var id = Math.floor(Math.random()*99999999);     //Gera o session id
                            var expireDate = new Date();
                            expireDate.setMinutes(expireDate.getMinutes() + 20);    //Adiciona 20 min ao session expire time
                            //Armazena esta session id com o expire date e o email no array de sessions do server:
                            session.push({id: id, expire: expireDate, email: email});
                            res.send({sessionId: id});      //Envia a response com a session id
                            console.log('login efetuado com sucesso. Session id: '+ id);
                        }else{      //Caso o login seja inválido
                            res.status(401);    //Status 401 unauthorized
                        }
                    }
                    res.end();
                });
                break;
    
            case 'delete':          //------Session delete
                console.log('session delete');
                //Coleta os dados da request:
                console.log(req.body);
                var sessionId = req.body.sessionId;
                var email = req.body.email;
                var destroyed = false;
                session.forEach(function(val, i){       //Percorre o array de session
                    if(val.id == sessionId && val.email == email){      //Se achar a session
                        session.splice(i,i);    //Destrói a session
                        destroyed = true;
                    }
                });
                if(!destroyed)
                    res.status(404);
                res.end();
                break;
            
            default:
                res.status(404);    //Status 404 not found
                res.end();
        }
        
    });

}