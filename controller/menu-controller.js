Vue.component('menu-navbar',{
    data: function(){ return {
        logged: false,
        usuario: {nome: '', cidade: '', estado: ''},
        login: {funcao: 'create', email: '', senha: ''} , 
        pesquisa: {categoria: 'Categorias', estado: 'Estado', cidade: 'Cidade', item: ''},
        categorias: [
            {nome: 'Animais de Estimação'}, {nome: 'Eletrodomésticos'}, {nome: 'Eletrônicos e Informática'},
            {nome: 'Esportes, Hobbies e Lazer'}, {nome: 'Imóveis'}, {nome: 'Móveis e Decoração'},
            {nome: 'Veículos'}, {nome: 'Vestuário e Moda'}
        ],
        estados: [
            {nome: 'Acre'}, {nome: 'Alagoas'}, {nome: 'Amapá'}, {nome: 'Amazonas'},
            {nome: 'Bahia'}, {nome: 'Ceará'}, {nome: 'Distrito Federal'}, {nome: 'Espírito Santo'},
            {nome: 'Goiás'}, {nome: 'Maranhão'}, {nome: 'Mato Grosso'}, {nome: 'Mato Grosso do Sul'},
            {nome: 'Minas Gerais'}, {nome: 'Pará'}, {nome: 'Paraíba'}, {nome: 'Paraná'},
            {nome: 'Pernambuco'}, {nome: 'Piauí'}, {nome: 'Rio de Janeiro'}, {nome: 'Rio Grande do Norte'},
            {nome: 'Rio Grande do Sul'}, {nome: 'Rondônia'}, {nome: 'Roraima'}, {nome: 'Santa Catarina'},
            {nome: 'São Paulo'}, {nome: 'Sergipe'}, {nome: 'Tocantins'},
        ]
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
        },

        selecionaCategoria: function(categoria){
            this.pesquisa.categoria = categoria;
        },

        selecionaEstado: function(estado){
            this.pesquisa.estado = estado;
        },
        
        cliquePesquisa: function(){
            location.href = 'index.html?tipoConsulta=pesquisa&item='+this.pesquisa.item+
            '&categoria='+this.pesquisa.categoria+'&cidade='+this.pesquisa.cidade+
            '&estado='+this.pesquisa.estado;
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
    '    <form class="navbar-form navbar-left">'+
    '        <div class="input-group">'+
    '            <input type="text" class="form-control" placeholder="Pesquisar" v-model="pesquisa.item">'+
    '           <div class="input-group-btn">'+
    '               <button type="button" class="btn btn-default" @click="cliquePesquisa">'+
    '                   <i class="glyphicon glyphicon-search"></i>'+
    '               </button>'+
    '           </div>'+
    '       </div>'+
    '   </form>'+
    '    <ul class="nav navbar-nav">'+
    '       <li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">'+
    '       {{pesquisa.categoria}}<span class="caret"></span></a>'+
    '       <ul class="dropdown-menu">'+
    '           <li v-for="categoria in categorias">'+
    '               <a href="#" style="color: black" @click="selecionaCategoria(categoria.nome)">'+
    '                   {{categoria.nome}}</a>'+
    '           </li>'+
    '       </ul></li>'+
    '    </ul>'+
    '    <ul class="nav navbar-nav">'+
    '       <li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">'+
    '       {{pesquisa.estado}}<span class="caret"></span></a>'+
    '       <ul class="dropdown-menu estilo-navbar-scrolllist">'+
    '           <li v-for="estado in estados">'+
    '               <a href="#" style="color: black" @click="selecionaEstado(estado.nome)">'+
    '               {{estado.nome}}</a>'+
    '           </li>'+
    '       </ul></li>'+
    '    </ul>'+
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
    '           <a href="#" class="dropdown-toggle" data-toggle="dropdown">'+
    '           <span class="glyphicon glyphicon-log-in"></span> Login</a>'+
    '           <ul class="dropdown-menu" role="menu">'+
    '               <li>'+
    '                   <form style="padding: 12px">'+
    '                      <div class="form-group">'+
    '                           <label for="inputEmail"> Login</label>'+
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
    '           <a href="criar-conta.html"><span class="glyphicon glyphicon-user"></span> Criar Conta</a>'+
    '       </li>'+
    '   </ul>'+
    '</div>'+
    '</nav>'
});
