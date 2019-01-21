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

app.route('/usuario')
.get(function(req, res){                                //------Usuario GET------
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Recebeu GET ususario');
    //Coleta os dados da request:
    var sessionId = req.query.sessionId;
    var email = req.query.email;
    //Verifica se a session existe e se ela não expirou:
    if(!sessionVerif(sessionId, email)){     //Se a sessão não for válida
        res.status(401);    //Status 401 unauthorized
        res.end();
    }else{      //Se a sessão for válida
        //Coleta os dados do usuário no BD:
        var sql = "SELECT * FROM tbUsuarios WHERE stEmail='"+email+"'";
        pool.query(sql, function(err, result, fields){
            if(err){        //Em caso de erro na execução da consulta
                console.log(err);
                res.status(500);    //Status: 500 internal server error
                res.end();                 
            }else{
                if(result.length == 0){    //Se não houver um usuario com este email registrado
                    res.status(400);    //Status 400 bad request
                    res.end();
                    return 0;
                }else{      //Caso o usuário exista, evia os dados
                    var nome = result[0].stUsername;
                    var cidade = result[0].stCidade;
                    var estado = result[0].stEstado;
                    res.send({nome, cidade, estado});   //Envia o objeto na response
                }
            }
        })
    }
})
.post(function(req, res){                               //------Usuario POST------
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Recebeu POST usuario');
    var funcao = req.body.funcao;
    switch(funcao){
        case 'create':              //------Usuario create
            //Coleta os dados da request:
            var email = req.body.email;
            var nome = req.body.nome;
            var senha = req.body.senha;
            var estado = req.body.estado;
            var cidade = req.body.cidade;
            //Verifica se este email ja foi cadastrado:
            var sql = "SELECT stEmail FROM tbUsuarios WHERE stEmail='"+email+"'";
            pool.query(sql, function(err, result,fields){
                if(err){        //Em caso de erro na execução da consulta
                    console.log(err);
                    res.status(500);    //Status: 500 internal server error
                    res.end();                 
                }else{
                    if(result.length > 0){    //Se já houver um usuario com este email registrado
                        res.status(400);    //Status 400 bad request
                        res.end();
                        return 0;
                    }
                }
                //Caso o email não exista, fa o cadastro:
                var sql = "INSERT INTO tbUsuarios VALUES ('"+email+"','"+senha+"','"+nome+"','"+estado+"','"+cidade+"')";
                pool.query(sql, function(err, result, fields){
                    if(err){        //Em caso de erro na execução da consulta
                        console.log(err);
                        res.status(500);    //Status: 500 internal server error           
                    }
                    res.end();
                });
            });
            break;

        case 'delete':              //------Usuario delete
            console.log('deletar conta');
            //Coleta os dados da request:
            var email = req.body.email;
            var senha = req.body.senhaAtual;
            var sessionId = req.body.sessionId;
            if(!sessionVerif(sessionId, email)){     //Se a sessão não for válida
                res.status(401);    //Status 401 unauthorized
                res.end();
            }else{
                //Verifica se a senha está correta:
                var sql = "SELECT stSenha FROM tbUsuarios WHERE stEmail='"+email+"'";
                pool.query(sql, function(err, result, fields){
                    if(err){        //Em caso de erro na execução da consulta
                        console.log('Erro ao coletar os anúncios do usuário: '+err);
                        res.status(500);    //Status: 500 internal server error   
                        res.end();        
                    }else{
                        console.log(result[0].stSenha);
                        console.log(senha);
                        if(result[0].stSenha !== senha){    //Caso a senha esteja incorreta
                            res.status(401);    //Status 401 unauthorized
                            res.end();
                        }else{      //Caso a senha esteja correta
                            //Coleta todos os dados do usuário na base de dados (que servirão de base para os deletes):
                            var sql1 = "SELECT itId AS id FROM tbAnuncios WHERE stDono='"+email+"'";
                            pool.query(sql1, function(err, result, fields){
                                if(err){        //Em caso de erro na execução da consulta
                                    console.log('Erro ao coletar os anúncios do usuário: '+err);
                                    res.status(500);    //Status: 500 internal server error   
                                    res.end();        
                                }else{
                                    var anuncios = result;  //Guarda as ids dos anúncios no array anúncios
                                    //Deleta os chats que o usuário iniciou:
                                    var sql2 = "DELETE FROM tbChat WHERE stUsuario='"+email+"'";
                                    pool.query(sql2, function(err, result){
                                        if(err){        //Em caso de erro na execução da consulta
                                            console.log('Erro ao deletar os chats que o usuário iniciou:'+err);
                                            res.status(500);    //Status: 500 internal server error   
                                            res.end();        
                                        }else{
                                            //Faz o delete dos chats dos anúncios que o usuário possui:
                                            var sql3 = "DELETE FROM tbChat WHERE 1=0";
                                            var where = '';
                                            anuncios.forEach(function(val, i){
                                                where += ' || itAnuncio='+anuncios[i].id;    //Coloca a id do anúncio na clausula where
                                            });
                                            sql3 += where;  //Junta o script sql com a clausula where
                                            pool.query(sql3, function(err, result){
                                                if(err){        //Em caso de erro na execução da consulta
                                                    console.log('Erro ao deletar os chats que o usuário iniciou:'+err);
                                                    res.status(500);    //Status: 500 internal server error   
                                                    res.end();        
                                                }else{
                                                    //Deleta os anúncios que o usuário possui:
                                                    var sql4 = "DELETE FROM tbAnuncios WHERE 1=0";
                                                    where = '';
                                                    anuncios.forEach(function(val, i){
                                                        where += ' || itId='+anuncios[i].id;    //Coloca a id do anúncio na clausula where
                                                    });
                                                    sql4 += where;  //Junta o script sql com a clausula where
                                                    pool.query(sql4, function(err, result){
                                                        if(err){        //Em caso de erro na execução da consulta
                                                            console.log('Erro ao deletar os chats que o usuário iniciou:'+err);
                                                            res.status(500);    //Status: 500 internal server error   
                                                            res.end();        
                                                        }else{
                                                            //Deleta a conta do usuário:
                                                            var sql5 = "DELETE FROM tbUsuarios WHERE stEmail='"+email+"'";
                                                            pool.query(sql5, function(err, result){
                                                                if(err){        //Em caso de erro na execução da consulta
                                                                    console.log('Erro ao deletar os chats que o usuário iniciou:'+err);
                                                                    res.status(500);    //Status: 500 internal server error   
                                                                    res.end();        
                                                                }else{
                                                                    res.end();
                                                                }
                                                            });
                                                        }
                                                    });

                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                })
                
            }
            break;

        case 'update':              //------Usuario update
            //Coleta os dados da request:
            var email = req.body.email;
            var sessionId = req.body.sessionId;
            var username = req.body.username;
            var senhaAtual = req.body.senhaAtual;
            var senhaNova = req.body.senhaNova;
            var cidade = req.body.cidade;
            var estado = req.body.estado;
            //Verifica se a session existe e se ela não expirou:
            var sessionValid = sessionVerif(sessionId, email);
            if(!sessionValid){     //Se a sessão não for válida
                res.status(401);    //Status 401 unauthorized
                res.end();
            }else{
                //Verifica se a senha atual está correta:
                var sql = "SELECT stSenha FROM tbUsuarios WHERE stEmail='"+email+"'";
                pool.query(sql, function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500);
                        res.end();
                    }else{
                        if(result.length == 0){     //Caso o email não seja encontrado
                            res.status(400);    //Status 400 bad request
                            res.end()
                        }else{      //Caso o email seja encontrado
                            if(result[0].stSenha != senhaAtual){     //Se a senha atual estiver incorreta
                                res.status(403);    //Status 403 forbidden
                                res.end();
                            }else{      //Caso a senha atual esteja correta
                                //Faz o update dos dados do usuário no BD:
                                var sql2 = "UPDATE tbUsuarios SET stUsername='"+username+"', stSenha='"+senhaNova+"', "+
                                            "stCidade='"+cidade+"', stEstado='"+estado+"' WHERE stEmail='"+email+"'";
                                pool.query(sql2, function(err, result, fields){
                                    if(err){
                                        console.log(err);
                                        res.status(500);
                                    }
                                    res.end();
                                });
                            }
                        }
                    }
                })
            }
            break;

        default:
            res.status(404);    //Status 404 not found
            res.end();
    }
});

}