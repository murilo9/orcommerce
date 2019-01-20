var mysql = require('mysql');   //Faz o require do módulo mysql
var formidable = require('formidable');     //Faz o require do módulo formidable
var fs = require('fs');     //Faz o require do módulo

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

}