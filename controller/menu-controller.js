Vue.component('menu-navbar',{
    data: function(){ return {
        logged: false,
        usuario: {nome: '', cidade: '', estado: ''},
        login: {funcao: 'create', email: '', senha: ''} , 
    }},
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
                    alert('Login bem-sucedido');
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
                    404: function(res){ 
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
        var self = this;    //Variável self para referenciar data
        if(Cookies.get('logged') == 'true'){    //Caso o usuário esteja logado
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
                    self.usuario.nome = res.nome;
                    self.usuario.cidade = res.cidade;
                    self.usuario.estado = res.estado;
                }
            })
            this.logged = true;     //data.logged = true
        }
    },
    template: 
    '<nav class="navbar navbar-default estilo-nav" id="menu">    <!--MENU-->'+
    '<div class="container-fluid">'+
    '    <div class="navbar-header">'+
    '        <a class="navbar-brand" href="index.html" style="padding: 0px">'+
    '            <img src="img/orc-logo.png" style="width: 210px; vertical-align: top;">'+
    '        </a>'+
    '    </div>'+
    '    <ul class="nav navbar-nav">'+
    '        <li>'+
    '           <a href="#">Categorias</a>'+
    '       </li>'+
    '    </ul>'+
    '    <form class="navbar-form navbar-left">'+
    '        <div class="input-group">'+
    '            <input type="text" class="form-control" placeholder="Pesquisar">'+
    '           <div class="input-group-btn">'+
    '               <button type="submit" class="btn btn-default">'+
    '                   <i class="glyphicon glyphicon-search"></i>'+
    '               </button>'+
    '           </div>'+
    '       </div>'+
    '   </form>'+
    '   <ul class="nav navbar-nav">'+
    '       <li v-if="logged">  <!--Criar Anúncio (v-if)-->'+
    '           <a href="criar-anuncio.html">Criar Anúncio</a>'+
    '       </li>'+
    '   </ul>'+
    '   <ul class="nav navbar-nav navbar-right" v-if="logged">      <!--CONTA/LOGOUT-->'+
    '       <li>'+
    '           <a href="conta.html">{{usuario.nome}} de {{usuario.cidade}}, {{usuario.estado}}</a>'+
    '       </li>'+
    '       <li>'+
    '           <a href="#" type="button" @click="fazerLogout">Logout</a>'+
    '       </li>'+
    '   </ul>'+
    '   <ul class="nav navbar-nav navbar-right" v-else>    <!--LOGIN/CADASTRO (v-else)-->'+
    '       <li class="dropdown">'+
    '           <a href="#" class="dropdown-toggle" data-toggle="dropdown">Login</a>'+
    '           <ul class="dropdown-menu" role="menu">'+
    '               <li>'+
    '                   <form style="padding: 12px">'+
    '                      <div class="form-group">'+
    '                           <label for="inputEmail">Login</label>'+
    '                           <input type="text" class="form-control" id="inputEmail" v-model="login.email">'+
    '                       </div>'+
    '                       <div class="form-group">'+
    '                           <label for="inputSenha">Senha</label>'+
    '                           <input type="password" class="form-control" id="inputSenha" v-model="login.senha">'+
    '                       </div>'+
    '                       <button class="btn btn-default" type="button" @click="fazerLogin">Login</button>'+
    '                   </form>'+
    '               </li>'+
    '           </ul>'+
    '       </li>'+
    '       <li>'+
    '           <a href="criar-conta.html">Criar Conta</a>'+
    '       </li>'+
    '   </ul>'+
    '</div>'+
    '</nav>'
});

new Vue({
    el: '#menu-app'
})