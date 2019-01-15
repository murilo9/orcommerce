var anuncioController = new Vue({
    el: '#anuncioDetalhe',
    data: {
        chatRequest: {      //Objeto que será enviado na request ao requisitar o chat
            sessionId: Cookies.get('sessionId'), email: Cookies.get('email'), 
            anuncioId: '', funcao: 'select', ator: 'cliente', chatId: ''
        },
        anuncio: {      //Objeto que contém os dados do anúncio que está sendo exibido nesta página
            //(recebe a response do servidor)
        },
        chat: {
            id: '', ready: false, time: ''
        }
    },

    methods: {
        getData: function(data){    //Retorna uma string formatada de uma data
            var anuncioData = new Date(data);
            var dia = anuncioData.getDate();
            var mes = anuncioData.getMonth()+1;
            var ano = anuncioData.getFullYear();
            var hora = anuncioData.getHours();
            var minuto = anuncioData.getMinutes();
            return dia+'/'+mes+'/'+ano+' às '+hora+':'+minuto;
        },

        iniciarChat: function(){    //Pega os dados do chat do servidor
            var self = this;    //Variável self para referenciar data
            if(Cookies.get('logged') == 'true'){    //Verifica se o usuário está logado
                self.chatRequest.anuncioId = self.anuncio.id;   //Coloca a id do anuncio em chatRequest
                //Faz a requisição da id da conversa pro servidor:
                $.ajax({
                    url: 'http://localhost:8888/chat',
                    method: 'post',
                    data: self.chatRequest,
                    statusCode: {
                        500: function(){
                            alert('Erro no servidor, tente novamente mais tarde.');
                        },
                        401: function(){
                            alert('Sua sessão expirou, faça login novamente.');
                            Cookies.set('logged', 'false');
                        },
                        405: function(){
                            alert('Você não pode abrir o chat em um anuncio que é seu.');
                        }
                    },
                    success: function(res){
                        self.chat.id = res.chatId;      //Pega a chat id:
                        self.chat.ready = true;     //Ativa o chat
                        self.chat.time = setInterval(function(){self.atualizarChat()},2000) //Ativa o atualziador de chat
                    }
                });
            }else{      //Caso o usuário não esteja logado:
                alert('Faça login para inicar uma conversa com o venedor.');
            }
        },

        atualizarChat: function(){      //Atualiza o chat a cada 2s
            //Lê o arquivo _chatId no servidor:
            $.post("server/anuncios/_"+this.anuncio.id+"/chats/_"+this.chat.id+".html", '', function(res){
                $('#chat-conteudo').html(res);      //Coloca a response no innerHTML do chat-conteudo
                $('.mensagem-cliente').attr('style','float: right');    //Ajusta o estilo das mensagens
            })
        },

        desativarChat: function(){   //Desativa o chat
            this.chat.ready = false;        //Desativa o v-if da view
            clearInterval(this.chat.time);      //Desativa o atualizador
        },

        enviarMensagem: function(){
            var self = this;    //Variável self para referenciar data
            this.chatRequest.funcao = 'update';     //Coloca função como update
            this.chatRequest.chatId = this.chat.id;     //Coloca a chat id
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
        }
    },

    created: function(){
        var anuncioId = window.location.search.substring(4);    //Pega o id da query string
        var self = this;    //Variável self para referenciar data
        //Faz a requisição dos dados do anúncio pro servidor:
        $.ajax({
            url: 'http://localhost:8888/anuncio?tipoConsulta=full&id='+anuncioId,
            method: 'get',
            statusCode: {
                500: function(){
                    self.anuncio = {};
                }
            },
            success: function(res){
                self.anuncio = res;
            }
        });
    }
});

