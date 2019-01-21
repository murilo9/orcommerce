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

    app.route('/anuncio')
    .get(function(req, res){        //------GET anuncio
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('Recebeu GET anuncio');
        var tipoConsulta = req.query.tipoConsulta;
        switch(tipoConsulta){
            case 'usuario':     //Select anuncios de um usuário
                //Coleta os dados da request:
                var sessionId = req.query.sessionId;
                var email = req.query.email;
                //Verifica se a session é válida:
                if(!sessionVerif(sessionId, email)){
                    res.status(401);    //Status 401 unauthorized
                    res.end();
                }else{
                    //Faz a consulta ao BD:
                    var sql = "SELECT * FROM tbAnuncios WHERE stDono='"+email+"' ORDER BY dtData DESC";
                    pool.query(sql, function(err, result, fields){
                        if(err){
                            console.log(err);
                            res.status(500);
                            res.end();
                        }else{
                            var anuncios = [];
                            if(result.length > 0){      //Se houver resultado
                                result.forEach(function(val, i){    //Percorre o array de resultados
                                    var tmp = {id: '', nome: '', descri: '', categoria: '', foto: '',
                                            data: '', cidade: '', estado: '', preco: '', estoque: ''};
                                    //Colhe as propriedades:
                                    tmp.id = result[i].itId;
                                    tmp.url = 'anuncio.html?id='+tmp.id;
                                    tmp.urlmod = 'modificar-anuncio.html?id='+tmp.id;
                                    tmp.nome = result[i].stNomeItem;
                                    tmp.descri = result[i].stDescricao;
                                    tmp.categoria = result[i].stCategoria;
                                    tmp.foto = 'server/anuncios/_'+tmp.id+'/'+result[i].stFoto;
                                    tmp.data = new Date(result[i].dtData);
                                    tmp.cidade = result[i].stCidade;
                                    tmp.estado = result[i].stEstado;
                                    tmp.preco = result[i].dcPreco;
                                    tmp.estoque = result[i].itEstoque;
                                    //Propriedades cujos dados virão de outro lugar:
                                    tmp.chats = [];
                                    tmp.chatQtd = 0;
                                    anuncios.push(tmp);     //Armazena este anúncio no array anuncios
                                });
                            }
                            res.send(anuncios);     //Envia o objeto anuncios na response
                        }
                    });
                }
                break;
    
            case 'ultimos':     //Select últimos 5 anúncios
                //Faz a consulta ao BD:
                var sql = "SELECT * FROM tbAnuncios ORDER BY dtData DESC LIMIT 5";
                pool.query(sql, function(err, result, fidels){
                    if(err){
                        console.log(err);
                        res.status(500);
                        res.end();
                    }else{
                        var anuncios = [];
                        result.forEach(function(val, i){    //Percorre o array de resultados
                            var tmp = {id: '', nome: '', foto: '', cidade: '', estado: '', preco: ''};
                            tmp.id = result[i].itId;
                            tmp.url = 'anuncio.html?id='+tmp.id;
                            tmp.nome = result[i].stNomeItem;
                            tmp.foto = 'server/anuncios/_'+tmp.id+'/'+result[i].stFoto;
                            tmp.cidade = result[i].stCidade;
                            tmp.estado = result[i].stEstado;
                            tmp.preco = result[i].dcPreco;
                            anuncios.push(tmp);     //Armazena este anúncio no array anuncios
                        });
                        res.send(anuncios);     //Envia o array de anuncios na response
                    }
                })
                break;
    
            case 'full':    //Select todos os dados de um anúncio específico
                //Coleta os dados da request:
                var anuncioId = req.query.id;
                //Faz a consulta ao BD:
                var sql = "SELECT A.itId AS id, A.stDono AS donoEmail, U.stUsername AS donoNome, "+
                        "A.stNomeItem AS nome, A.stDescricao AS descri, A.stCategoria AS categ, "+
                        "A.stFoto AS foto, A.dtData AS data, A.stCidade AS cidade, "+
                        "A.stEstado AS estado, A.dcPreco AS preco, A.itEstoque AS estoque "+
                        "FROM tbAnuncios A INNER JOIN tbUsuarios U ON A.stDono=U.stEmail WHERE A.itId="+anuncioId;
                pool.query(sql, function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500);
                        res.end();
                    }else{
                        var anuncio = {id: '', donoEmail: '', donoNome: '', nome: '', descri: '', categoria: '',
                                        foto: '', data: '', cidade: '', estado: '', preco: '', estoque: ''};
                        anuncio.id = result[0].id;
                        anuncio.donoEmail = result[0].donoEmail;
                        anuncio.donoNome = result[0].donoNome;
                        anuncio.nome = result[0].nome;
                        anuncio.descri = result[0].descri;
                        anuncio.categoria = result[0].categ;
                        anuncio.foto = 'server/anuncios/_'+anuncio.id+'/'+result[0].foto;
                        anuncio.data = new Date(result[0].data);
                        anuncio.cidade = result[0].cidade;
                        anuncio.estado = result[0].estado;
                        anuncio.preco = result[0].preco;
                        anuncio.estoque = result[0].estoque;
                        res.send(anuncio);      //Envia os dados do anúncio na response
                    }
                });
                break;
            
            case 'iniciados':     //Select todos os anúncios que o usuário iniciou um chat
                //Coleta os dados da request:
                var email = req.query.email;
                //Faz a consulta ao BD:
                var sql = "SELECT a.itId AS id, A.stNomeItem AS nome, A.dcPreco AS preco, "+
                            "A.stCidade AS cidade, A.stEstado AS estado, A.stFoto AS foto "+
                            "FROM tbAnuncios A INNER JOIN tbChat C "+
                            "ON C.itAnuncio = A.itId WHERE C.stUsuario='"+email+"'";
                pool.query(sql, function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500);
                        res.end();
                    }else{
                        var anuncios = [];
                        result.forEach(function(val, i){
                            var anuncio = {id: '', nome: '', foto: '', cidade: '', estado: '', preco: ''};
                            //Coleta os dados de result
                            anuncio.id = result[i].id;
                            anuncio.nome = result[i].nome;
                            anuncio.url = 'anuncio.html?id='+anuncio.id;
                            anuncio.foto = 'server/anuncios/_'+anuncio.id+'/'+result[i].foto;
                            anuncio.cidade = result[i].cidade;
                            anuncio.estado = result[i].estado;
                            anuncio.preco = result[i].preco;
                            anuncios.push(anuncio);     //Insere este anúncio no array de anúncios
                        })
                        res.send(anuncios);     //Envia o array com os anúncios na response
                    }
                });
                break;

            case 'pesquisa':    //Select resultado de pesquisa
                //TODO (a pesquisa pode ser só por nome ou incluir filtros de categoria, preço, lugar, etc)
                break;
    
            default:
                res.status(404);
                res.end();
        }
    })
    .post(function(req, res){       //------POST anuncio
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('Recebeu POST anuncio');
        var funcao = req.body.funcao;
        switch(funcao){
            case 'create':          //-----Anúncio Create
                //Coleta os dados da request:
                var anuncioId = Math.floor(Math.random()*999999999);   //Gera uma id aleatória para o anúncio
                var email = req.body.dono;
                var sessionId = req.body.sessionId;
                var nome = req.body.nome;
                var descri = req.body.descri;
                var categoria = req.body.categoria;
                var foto = req.body.foto;
                var cidade = req.body.cidade;
                var estado = req.body.estado;
                var preco = req.body.preco;
                var qtd = req.body.qtd;
                //Verifica se a sessão é válida:
                if(!sessionVerif(sessionId, email)){   //Se a session for inválida
                    res.status(401);    //Status 401 unauthorized
                    res.end();
                }else{      //Se a session for válida, procede
                    var sql = "INSERT INTO tbAnuncios"+
                        "(itId, stDono, stNomeItem, stDescricao, stCategoria, stFoto, stCidade, stEstado, dcPreco, itEstoque) "+
                        "VALUES("+anuncioId+",'"+email+"','"+nome+"','"+descri+"','"+categoria+"','"+
                                    foto+"','"+cidade+"','"+estado+"',"+preco+","+qtd+")";
                    //Tenta fazer a inserção no BD:
                    pool.query(sql, function(err, result, fields){
                        if(err){
                            console.log(err);
                            res.status(500);
                            res.end();
                        }else{      //Caso o insert seja bem-sucedido:
                            //Envia a id do anúncio criado, que será usada no upload da foto:
                            res.send({anuncioId: anuncioId});
                            res.end();   
                        }
                    });
                }
                break;
    
            case 'delete':      //-----Anúncio Delete
                //Coleta os dados da request:
                var anuncioId = req.body.anuncioId;
                var dono = req.body.dono;
                var sessionId = req.body.sessionId;
                var email = req.body.email;
                //Verifica se a session id é válida:
                if(!sessionVerif(sessionId, email)){   //Se a session for inválida
                    res.status(401);    //Status 401 unauthorized
                    res.end();
                }else{
                    //Deleta os chats do anúncio:
                    var sql = "DELETE FROM tbChat WHERE itAnuncio="+anuncioId;
                    pool.query(sql, function(err, result, fidels){
                        if(err){
                            console.log(err);
                            res.status(500);
                            res.end();
                        }else{
                            //Deleta o anúncio:
                            var sql2 = "DELETE FROM tbAnuncios WHERE stDono='"+dono+"' && itId="+anuncioId;
                            pool.query(sql2, function(err, result, fields){
                                if(err){
                                    console.log(err);
                                    res.status(500);
                                    res.end();
                                }else{
                                    //"Apaga" os arquivos do servidor (coloca marcação OFF):
                                    fs.renameSync('anuncios/_'+anuncioId, 'anuncios/OFF_'+anuncioId, function(err){
                                        if(err){
                                            console.log(err);
                                        }
                                        res.end();
                                    });
                                }
                            });
                        }
                    })
                }
                break;
    
            case 'update':      //-----Anúncio Update
                //Coleta os dados da request:
                var sessionId = req.body.sessionId;
                var email = req.body.email;
                var anuncioId = req.body.anuncio.id;
                var nome = req.body.anuncio.nome;
                var descri = req.body.anuncio.descri;
                var categ = req.body.anuncio.categ;
                var cidade = req.body.anuncio.cidade;
                var estado = req.body.anuncio.estado;
                var preco = req.body.anuncio.preco;
                var estoque = req.body.anuncio.estoque;
                //Verifica se a session id é válida:
                if(!sessionVerif(sessionId, email)){   //Se a session for inválida
                    res.status(401);    //Status 401 unauthorized
                    res.end();
                }else{
                    //Faz o update no BD:
                    var sql = "UPDATE tbAnuncios SET stNomeItem='"+nome+"', stDescricao='"+descri+"', "+
                                "stCategoria='"+categ+"', stCidade='"+cidade+"', stEstado='"+estado+"', "+
                                "dcPreco="+preco+", itEstoque="+estoque+" WHERE itId="+anuncioId+" && stDono='"+email+"'";
                    pool.query(sql, function(err, result, fields){
                        if(err){
                            console.log(err);
                            res.status(500);
                            res.end();
                        }else{
                            res.end();
                        }
                    })
                }
                break;
    
            default:
                res.status(404);    //Status 404 not found
                res.end();
        }
    })

}