var menuController = new Vue({
    el: "#menu",
    data: {
        logged: false,
        login: {funcao: 'create', email: '', senha: ''}   
    },
    methods: {
        fazerLogin: function(){       //Função de fazer login
            var self = this;        //Variável self para referenciar data
            $.ajax({
                url: 'http://localhost:8888/session',
                method: 'post',
                data: self.login,
                statusCode: {
                    401: function(){
                        alert('Login inválido');
                    }
                },
                success: function(res){
                    alert('sucesso');
                    var sessionId = res.sessionId;      //Pega a session id da response
                    Cookies.set('sessionId', sessionId);    //Armazena a session id no cookie
                    Cookies.set('email', self.login.email);       //Armazena o email no cookie
                    Cookies.set('logged', true);        //Guarda logged=true no cookie
                    window.location.href="index.html";     //Dá refresh na página
                }
            });
        },
        fazerLogout: function(){        //Função de fazer logout
            var self = this;        //Variável self para referenciar data
            $.ajax({
                url: 'http://localhost:8888/session',
                method:'post',
                data: {funcao: 'delete', sessionId: Cookies.get('sessionId'), email: Cookies.get('email')},
                statusCode: {
                    404: function(){ 
                        alert('session id não encontrada...');      //DEBUG
                        //Reseta todos os cookies:
                        Cookies.set('sessionId', '');
                        Cookies.set('email', '');
                        Cookies.set('logged', '');
                        window.location.href="index.html";     //Dá refresh na página
                    }
                },
                success: function(){
                    //Reseta todos os cookies:
                    Cookies.set('sessionId', '');
                    Cookies.set('email', '');
                    Cookies.set('logged', '');
                    window.location.href="index.html";     //Dá refresh na página
                }
            });
        }
    },
    created: function(){    //Verifica se o usuário está logado
        if(Cookies.get('logged') == 'true'){    //Caso o usuário esteja logado
            this.logged = true;     //data.logged = true
        }
    }
});