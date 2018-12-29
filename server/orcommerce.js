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

/* Router de Session */
app.route('session')
.get(function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Recebeu GET session');
    //Coleta os dados da request
    var sessionId = req.body.sessionId;
    var email = req.body.email;
    var now = new Date();
    var found = 0;
    session.forEach(function(val, i){       //Percorre o array de session ids
        if(val.id == sessionId && val.email == email && val.expire < now){
            found = 1;
        }
    });
    if(!found)      //Caso a session não seja válida ou tenha expirado
        res.status(404);        //Status 404 not found
    res.end();
})
.post(function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Recebeu POST session');
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
                res.status(401);    //Status 400 unauthorized
            }
        }
        res.end();
    });
});