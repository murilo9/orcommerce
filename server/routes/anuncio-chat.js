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

module.exports = function(app, sessionVerif){

    app.route('/anuncio/chat')
    .get(function(req, res){
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('Recebeu POST anuncio');
        //Coleta os dados da request:
        var anuncioId = req.query.anuncioId;
        var sessionId = req.query.sessionId;
        var email = req.query.email;
        //Verifica se a session id é válida:
        if(!sessionVerif(sessionId, email)){
            res.status(401)     //Status 401 unauthorized
            res.end();
        }else{
            //Pesquisa no BD o número de chats deste anúncio:
            var sql = "SELECT COUNT(stUsuario) AS qtd FROM tbChat WHERE itAnuncio="+anuncioId;
            pool.query(sql, function(err, result, fields){
                if(err){
                    console.log(err);
                    res.status(500);
                    res.end();
                }else{
                    var response = {qtd: '', chats: []};  //Declara o objeto que será enviado na response
                    response.qtd = result[0].qtd;   //Armazena o resultado do count em qtd
                    //Pega os dados de cada chat que este anúncio possui:
                    var sql2 = "SELECT C.itId AS chatId, C.stUsuario AS usuarioEmail, U.stUsername AS usuarioNome "+
                                "FROM tbChat C INNER JOIN tbUsuarios U "+
                                "ON C.stUsuario=U.stEmail WHERE itAnuncio="+anuncioId;
                    pool.query(sql2, function(err, result, fields){
                        if(err){
                            console.log(err);
                            res.status(500);
                            res.end();
                        }else{
                            result.forEach(function(val, i){    //Percorre o array de results
                                var chat = {id: '', usuarioEmail: '', usuarioNome: ''};     //Criar protótipo do objeto chat
                                chat.id = result[i].chatId;    //Coleta a chat id
                                chat.usuarioEmail = result[i].usuarioEmail;    //Coleta o email do usuario
                                chat.usuarioNome = result[i].usuarioNome;  //Coleta a username do usuario
                                response.chats.push(chat);   //Armazena o objeto chat temporário em response.chats
                            });
                            res.send(response);     //Envia o objeto na response
                        }
                    });
                }
            });
        }
    });

}