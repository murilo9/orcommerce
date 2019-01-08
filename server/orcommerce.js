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
    var sessionExists = false;
    session.forEach(function(val, i){
        var agora = new Date();
        if(val.id == sessionId && val.email == email){    //Se a session id for encontrada e bater com o email
            if(val.expire < agora){     //Se a sessão ainda não tiver expirado
                sessionExists = true;   //Então a session existe
                console.log('A session existe');
            }else{        //Se a session tiver expirado
                session.splice(i,i);    //Deleta esta session
                console.log('A session não existe');
            }
        }
    });
    if(!sessionExists){     //Se a sessão não for válida
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
                        expireDate.setMinutes = expireDate.getDate + 20;    //Adiciona 20 min ao session expire time
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