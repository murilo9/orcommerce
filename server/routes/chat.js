var mysql = require('mysql');   //Faz o require do módulo mysql
var fs = require('fs');     //Faz o require do módulo fs

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

    app.route('/chat')
    .post(function(req, res){
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('Recebeu POST chat');
        var funcao = req.body.funcao;
        switch(funcao){
            case 'select':
            console.log(req.body);
                //Coleta os dados da request:
                var sessionId = req.body.sessionId;
                var email = req.body.email;
                var anuncioId = req.body.anuncioId;
                //Verifica se a session id é válida:
                if(!sessionVerif(sessionId, email)){
                    res.status(401)     //Status 401 unauthorized
                    res.end();
                }else{
                    //Verifica se o usuário não é o próprio dono do anúncio:
                    var sql = "SELECT * FROM tbAnuncios WHERE stDono='"+email+"' && itId="+anuncioId;
                    pool.query(sql, function(err, result, fidels){
                        if(err){
                            console.log(err);
                            res.status(500);
                            res.end();
                        }else{
                            if(result.length > 0){      //Caso haja algum resultado, então o usuário é o dono
                                res.status(405);    //Status 405 not allowed
                                res.end();
                            }else{      //Caso não haja resultado, prossegue:
                                //Verifica se uma conversa com este usuário/anúncio existe:
                                var sql2 = "SELECT * FROM tbChat WHERE stUsuario='"+email+"' && itAnuncio="+anuncioId;
                                pool.query(sql2, function(err, result, fields){
                                    if(err){
                                        console.log(err);
                                        res.status(500);
                                        res.end();
                                    }else{
                                        if(result.length > 0){      //Se a conversa existir
                                            res.send({chatId: result[0].itId});     //Envia a id do chat para acessar o arquivo
                                        }else{      //Se a conversa não existir, cria a conversa:
                                            var id = Math.floor(Math.random()*999999999);   //Gera a chat id
                                            var sql3 = "INSERT INTO tbChat VALUES("+id+",'"+email+"',"+anuncioId+")";
                                            pool.query(sql3, function(err, result, fields){
                                                if(err){
                                                    console.log(err);
                                                    res.status(500);
                                                    res.end();
                                                }else{      //Caso o insert tenha sido bem-sucedido
                                                    //Cria o arquivo do chat no servidor:
                                                    fs.appendFileSync('anuncios/_'+anuncioId+'/chats/_'+id+'.html', '');
                                                    res.send({chatId: id});     //Envia a id na response
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
                break;
    
            case 'update':
                //Coleta os dados da request:
                var sessionId = req.body.sessionId;
                var email = req.body.email;
                var anuncioId = req.body.anuncioId;
                var chatId = req.body.chatId;
                var ator = req.body.ator;
                var mensagem = '';
                //Configura o ator da mensagem (vendedor ou cliente)
                if(ator == 'cliente')
                    mensagem = "<div class='mensagem-cliente'>";
                else if(ator == 'vendedor')
                    mensagem = "<div class='mensagem-vendedor'>";
                else{   //Caso o ator não esteja definido
                    res.status(400);    //Status 400 bad request
                    res.end();
                    return 0;
                }
                //Verifica se a session id é válida:
                if(!sessionVerif(sessionId, email)){
                    res.status(401)     //Status 401 unauthorized
                    res.end();
                }else{
                    //Grava a mensagem no arquivo de chat:
                    mensagem += req.body.mensagem;
                    mensagem += '</div>';
                    fs.appendFileSync('anuncios/_'+anuncioId+'/chats/_'+chatId+'.html', mensagem, function(err){
                        if(err){
                            res.status(500);
                            res.end();
                        }else{
                            res.end();
                        }
                    });
                }
                break;
    
            default:
                res.status(404);
                res.end();
        }
    });

}