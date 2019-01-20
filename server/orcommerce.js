//Declaração dos módulos utilizados:
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var url = require('url');

//Variáveis globais:
var session = [];   //Array de sessions
var app = express();        //Express app

//Utilização dos recursos dos módulos:
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    extended: true
}));

//Inicializa o servidor na porta 8888:
app.listen(8888, function () {
    console.log('Servidor rodando na porta 8888');
});


/* Função que verifica a validade das sessões */

var sessionVerif = function (sessionId, email){
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

//Router de Usuario:
var rotaUsuario = require('./routes/usuario')(app, sessionVerif);

//Router de Session:
var rotaSession = require('./routes/session')(app, session);

//Router de anúncio:
var rotaAnuncio = require('./routes/anuncio')(app, sessionVerif);

//Router de anúncio-foto:
var rotaAnuncioFoto = require('./routes/anuncio-foto')(app, sessionVerif);

//Router de anúncio-chat:
var rotaAnuncioChat = require('./routes/anuncio-chat')(app, sessionVerif);

//Router de chat:
var rotaChat = require('./routes/chat')(app, sessionVerif);

