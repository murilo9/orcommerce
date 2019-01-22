var contaController = new Vue({
    el: '#conta',
    data: {
        estados: [
            {nome: 'Acre'},
            {nome: 'Alagoas'},
            {nome: 'Amapá'},
            {nome: 'Amazonas'},
            {nome: 'Bahia'},
            {nome: 'Ceará'},
            {nome: 'Distrito Federal'},
            {nome: 'Espírito Santo'},
            {nome: 'Goiás'},
            {nome: 'Maranhão'},
            {nome: 'Mato Grosso'},
            {nome: 'Mato Grosso do Sul'},
            {nome: 'Minas Gerais'},
            {nome: 'Pará'},
            {nome: 'Paraíba'},
            {nome: 'Paraná'},
            {nome: 'Pernambuco'},
            {nome: 'Piauí'},
            {nome: 'Rio de Janeiro'},
            {nome: 'Rio Grande do Norte'},
            {nome: 'Rio Grande do Sul'},
            {nome: 'Rondônia'},
            {nome: 'Roraima'},
            {nome: 'Santa Catarina'},
            {nome: 'São Paulo'},
            {nome: 'Sergipe'},
            {nome: 'Tocantins'},
        ],
        chat: {ready: false, time: 0, anuncioId: '', clienteEmail: '', clienteNome: ''},
        chatRequest: {funcao: '', chatId: '', mensagem: '', ator: 'vendedor', anuncioId: '',
                         sessionId: Cookies.get('sessionId'), email: Cookies.get('email')},
        usuario: { funcao: 'update', username: '', senhaAtual: '', senhaNova: '', senhaNovac: '', cidade: '', 
                    estado: '', email: Cookies.get('email'), sessionId: Cookies.get('sessionId') },
        anunciosCriados: [],
        anunciosIniciados: []
    },
    methods: {
        atualizarConta: function(){
            var self = this;    //Variável self para referneciar data
            this.usuario.funcao = 'update';     //Seleciona a função CRUD update
            //Valida o campo de nome:
            if(this.usuario.username.length < 3 || this.usuario.username.length > 40){
                alert('O nome de usuario deve conter entre 3 e 40 caracteres.');
                return 0;
            }
            //Valida o campo de email:
            if(this.usuario.username.novaSenha != this.usuario.username.novaSenhac){
                alert('As senhas novas não coincidem');
                return 0;
            }
            //Pede confirmação:
            if(confirm('Deseja mesmo atualizar estas informações?')){
                //Envia a requisição pro servidor:
                $.ajax({
                    url: 'http://localhost:8888/usuario',
                    method: 'post',
                    data: self.usuario,
                    statusCode: {
                        401: function(){     //Caso a sessão não seja válida ou tenha expirado
                            alert('Sua sessão expirou, faça login novamente.');
                            self.fazerLogout();     //Faz logout
                        },
                        400: function(){
                            alert('Erro interno, tente relogar.');
                        },
                        403: function(){
                            alert('A senha atual está incorreta.');
                        },
                        500: function(){
                            alert('Erro no servidor, tente novamente');
                        }
                    },
                    success: function(res){
                        alert('Dados alterados com sucesso.');
                        location.reload();
                    }
                })
            }
        },

        deletarConta: function(){
            var self = this;    //Variável self para referenciar data
            this.usuario.funcao = 'delete';     //Seleciona a função CRUD delete
            if(confirm('Deseja mesmo deletar sua conta? Esta ação não poderá ser desfeita.')){
                this.usuario.senhaAtual = prompt('Digite sua senha para prosseguir');
                //Faz a requisição ao servidor:
                $.ajax({
                    url: 'http://localhost:8888/usuario',
                    method: 'post',
                    data: self.usuario,
                    statusCode: {
                        500: function(){
                            alert('Erro no servidor, tente novamente mais tarde.');
                        },
                        401: function(){
                            alert('Senha incorreta.');
                            self.usuario.senhaAtual = '';
                        }
                    },
                    success: function(res){
                        alert('Conta deleta com sucesso. Esperamos que tenha aproveitado nossos serviços ;)');
                        Cookies.set('logged', 'false');     //Desloga
                        location.href='index.html';     //Redireciona
                    }
                })
            }
        },

        getData: function(data){    //Retorna uma string formatada de uma data
            var anuncioData = new Date(data);
            var dia = anuncioData.getDate();
            var mes = anuncioData.getMonth()+1;
            var ano = anuncioData.getFullYear();
            var hora = anuncioData.getHours();
            var minuto = anuncioData.getMinutes();
            return dia+'/'+mes+'/'+ano+' às '+hora+':'+minuto;
        },

        ativarChat: function(anuncioIndex, chatIndex){
            var self = this;    //Variável self para referenciar data
            this.chat.ready = true;     //Abre a janela do chat na view
            this.chat.time = setInterval(function(){self.atualizarChat()},2000) //Ativa o atualziador de chat
            //Passa os dados do chat deste anúncio para o objeto data.chat:
            this.chat.id = this.anunciosCriados[anuncioIndex].chats[chatIndex].id;
            this.chat.clienteEmail = this.anunciosCriados[anuncioIndex].chats[chatIndex].usuarioEmail;
            this.chat.clienteNome = this.anunciosCriados[anuncioIndex].chats[chatIndex].usuarioNome;
            this.chat.anuncioId = this.anunciosCriados[anuncioIndex].id;
        },

        desativarChat: function(){
            this.chat.ready = false;
        },

        enviarMensagem: function(){
            var self = this;    //Variável self para referenciar data
            //Coloca os dados do chat no objeto de request:
            this.chatRequest.funcao = 'update';     //Coloca função como update
            this.chatRequest.chatId = this.chat.id;     //Coloca a chat id
            this.chatRequest.anuncioId = this.chat.anuncioId;   //Coloca a id do anúncio
            this.chatRequest.mensagem = $('#chat-box').val();   //Coloca a mensagem digitada em chatRequest
            $('#chat-box').val('');     //Limpa o chat box
            //Envia a request para o servidor:
            $.ajax({
                url: 'http://localhost:8888/chat',
                method: 'post',
                data: self.chatRequest,
                statusCode: {
                    500: function(){
                        alert('Erro no servidor. Tente novamente mais tarde.');
                    },
                    400: function(){
                        alert('Erro interno. Tente novamente mais tarde.');
                    },
                    401: function(res){
                        alert('Sua sessão expirou, faça login novamente.');
                        Cookies.set('logged', 'false');
                    }
                },
                success: function(res){
                    self.atualizarChat();   //Atualiza o chat
                }
            });
        },

        atualizarChat: function(){      //Atualiza o chat a cada 2s
            //Lê o arquivo _chatId no servidor:
            $.post("server/anuncios/_"+this.chat.anuncioId+"/chats/_"+this.chat.id+".html", '', function(res){
                $('#chat-conteudo').html(res);      //Coloca a response no innerHTML do chat-conteudo
                //Ajusta o estilo das mensagens
                $('.mensagem-vendedor').attr('style','text-align: right; padding-left: 24px;');    
                $('.mensagem-cliente').attr('style','padding-right: 24px; color: green;');
            })
        },

        excluirAnuncio: function(id){
            if(confirm('Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.')){
                //Faz a requisição de delete pro servidor:
                $.ajax({
                    url: 'http://localhost:8888/anuncio',
                    method: 'post',
                    data: {email: Cookies.get('email'), sessionId: Cookies.get('sessionId'),
                            dono: Cookies.get('email'), anuncioId: id, funcao: 'delete'},
                    statusCode: {
                        401: function(){
                            alert('Erro interno, tente novamente mais tarde.');
                        },
                        500: function(){
                            alert('Erro no servidor, tente novamente mais tarde.');
                        }
                    },
                    success: function(res){     //Em caso de sucesso
                        alert('Anúncio excluído com sucesso.');
                        location.reload();      //Atualiza a página
                    }
                });
            }
        },

        encerrarChat: function(anuncioId){
            var msg = 'Isso irá apagar toda a conversa com o vendedor desde item e removerá '+
                        'o anúncio desta lista. Deseja mesmo encerrar o chat?';
            var self = this;    //Variável self para referenciar data
            this.chatRequest.funcao = 'delete';     //Seleciona a função CRUD delete
            this.chatRequest.anuncioId = anuncioId;
            if(confirm(msg)){
                //Faz a reequisição pro servidor:
                $.ajax({
                    url: 'http://localhost:8888/chat',
                    method: 'post',
                    data: self.chatRequest,
                    statusCode: {
                        500: function(){
                            alert('Erro no servidor. Tente novamente mais tarde.');
                        },
                        401: function(){
                            alert('Sua sessão expirou, faça login novamente.');
                            Cookies.set('logged', 'false');     //Desloga
                        }
                    },
                    success: function(res){
                        location.reload();      //Atualiza a página
                    }
                })
            }
        }
    },

    created: function(){     
        var self = this;    //Variável self para referenciar data
        //Coleta as informações sobre o usuário no servidor:
        $.ajax({
            url: 'http://localhost:8888/usuario?sessionId='+Cookies.get('sessionId')+
                    '&email='+Cookies.get('email'),     //Coloca os parâmetros na GET URL
            method: 'get',
            statusCode: {
                401: function(res){     //Caso a sessão não seja válida ou tenha expirado
                    alert('Sua sessão expirou, faça login novamente.');
                    self.fazerLogout();     //Faz logout
                },
                400: function(res){
                    alert('Erro interno, tente relogar.');
                    self.fazerLogout();     //Faz logout
                }
            },
            success: function(res){
                //Colhe os dados da request:
                self.usuario.username = res.nome;
                self.usuario.cidade = res.cidade;
                self.usuario.estado = res.estado;
            }
        });
        //Colhe do servidor todos os anúncios que este usuário criou:
        $.ajax({    
            url: 'http://localhost:8888/anuncio?tipoConsulta=usuario&email='+Cookies.get('email')+
                    '&sessionId='+Cookies.get('sessionId'),
            method: 'get',
            statusCode: {
                401: function(){
                    alert('Sua sessão expirou. Faça login novamente.');
                    Cookies.set('logged', 'false');
                    location.location='index.html';
                },
                500: function(){
                    alert('Erro no servidor, tente novamente.');
                }
            },
            success: function(res){
                if(res.length > 0){    //Se houver resultados
                    self.anunciosCriados = res;   //Passa os anúncios para data.anunciosCriados
                    //Pega os dados de chats de cada anúncio:
                    self.anunciosCriados.forEach(function(anuncio, i){
                        $.ajax({
                            url: 'http://localhost:8888/anuncio/chat?sessionId='+Cookies.get('sessionId')+
                                    '&email='+Cookies.get('email')+'&anuncioId='+anuncio.id,
                            method: 'get',
                            statusCode: {
                                500: function(){
                                    alert('Erro no servidor. Tente novamente mais tarde.');
                                }
                            },
                            success: function(res){
                                anuncio.chatQtd = res.qtd;      //Guarda a qtd de chats que este anuncio tem
                                anuncio.chats = res.chats;      //Guarda as informações de cada chat deste anúncio
                            }
                        })
                    });
                }
            }
        });
        //Colhe do servidor os anúncios que este usuário começou um chat
        $.ajax({
            url: 'http://localhost:8888/anuncio?tipoConsulta=iniciados&email='+Cookies.get('email'),
            method: 'get',
            statusCode: {
                500: function(){
                    alert('Erro no servidor. Tente novamente mais tarde.');
                }
            },
            success: function(res){     //Em caso de sucesso
                self.anunciosIniciados = res;   //Coloca a response no array anunciosIniciados
            }
        })
    }
});