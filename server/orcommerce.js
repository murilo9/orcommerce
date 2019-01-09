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
    console.log('session recebida = '+sessionId+':'+email);   //--DEBUG
    //Verifica se a session existe e se ela não expirou:
    var sessionValid = sessionVerif(sessionId, email);
    console.log(sessionValid);
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

})
.post(function(req, res){       //------POST anuncio
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Recebeu POST anuncio');
    var funcao = req.body.funcao;
    switch(funcao){
        case 'create':
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
                    "VALUES("+anuncioId+",'"+email+"','"+nome+"','"+descri+"','"+categoria+"','"+foto+
                            "','"+cidade+"','"+estado+"',"+preco+","+qtd+")";
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
        var serverPath = 'anuncios/_'+anuncioId+'/';     //define a pasta temporária no servidor
        fs.mkdirSync(serverPath);    //Cria a pasta temporária no servidor
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