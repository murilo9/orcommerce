//Declaração dos módulos utilizados:
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var formidable = require('formidable');
var fs = require('fs');
var url = require('url');

//Variáveis globais:
var session = [];   //Array de sessions
var pool;       //Mysql connection pool
var app = express();        //Express app

//Utilização dos recursos dos módulos:
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    extended: true
}));

//Inicializa o servidor na porta 8888 e declara o mysql connections pool:
app.listen(8888, function () {
    console.log('Servidor rodando na porta 8888');
    pool  = mysql.createPool({
        connectionLimit : 10,
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: '',
        database: 'orcommerce'
    });
});

/* Router de Usuario */

app.route('/usuario')
.get(function(req, res){                                //------Usuario GET------
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Recebeu GET ususario');
    //Coleta os dados da request:
    var sessionId = req.query.sessionId;
    var email = req.query.email;
    //Verifica se a session existe e se ela não expirou:
    var sessionValid = sessionVerif(sessionId, email);
    if(!sessionValid){     //Se a sessão não for válida
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
    console.log('Recebeu POST ususario');
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
            //TODO
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
})

/* Router de Session */

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

/* Router de anúncio */

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
                var sql = "SELECT * FROM tbAnuncios WHERE stDono='"+email+"'";
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

/* Router de anúncio-foto */

app.route('/anuncio/foto')
.post(function(req, res){
    console.log('Recebeu POST anuncio/foto');
    //Coleta os dados da request:
    var sessionId = req.cookies.sessionId;
    var email = req.cookies.email;
    var anuncioId = req.cookies.anuncioCriado;
    if(!sessionVerif(sessionId, email)){
        res.status(401);    //Status 401 unauthorized
        res.end();
        return 0;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){       //Faz o parse da input file
        if(err){
            console.log('erro ao fazer upload de arquivo');
            res.status(500);
            res.end();
            return 0;
        }
        var arquivoNome = files.iFoto.name;     //Pega o nome do arquivo
        var serverPath = 'anuncios/_'+anuncioId+'/';     //define a pasta do anuncio no servidor
        fs.mkdirSync(serverPath);    //Cria a pasta do anuncio no servidor
        var serverChatPath = serverPath+'chats/';   //Define a pasta onde ficarão os arquivos de chat
        fs.mkdirSync(serverChatPath);    //Cria a pasta de chats do anuncio no servidor
        var oldPath = files.iFoto.path;     //Caminho de origem do arquivo
        var newPath = serverPath + arquivoNome;     //Caminho de destino do arquivo = pasta no servidor + nome do arquivo
        fs.rename(oldPath, newPath, function(err){      //Tenta mover o arquivo da origem pro destino
            if(err){
                console.log('Erro ao renomear o arquivo transferido');
                res.status(500);
                res.end();
            }else{      //Caso o arquivo tenha sido transferido com sucesso
                //Faz o update do anuncio no BD:
                sql = "UPDATE tbAnuncios SET stFoto='"+arquivoNome+"' WHERE itId="+anuncioId;
                pool.query(sql, function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500);
                        res.end();
                    }else{
                        res.redirect('http://localhost/orcommerce/conta.html');
                        res.end();
                    }
                });
            }
        })
    });
});

/* Router de anúncio-chat */
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

/* Router de chat */

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

function sessionVerif(sessionId, email){
    var agora = new Date();
    var i = 0;
    found = false;
    while(i<session.length && !found){       //Percorre o array de session
        if(session[i].id == sessionId && session[i].email == email){      //Se achar a session
            found = true;
            if(session[i].expire < agora){     //Se a session tiver expirado
                session.splice(i,i);    //Destrói a session
                return false;       //Retorna false (sessão inválida)
            }else
                return true;    //Retorna true (sessão válida)
        }
        i+=1;
    };
    //Se percorreu todo o array sem achar a session
    return 0;       //Retorna false (sessão não encontrada)
}