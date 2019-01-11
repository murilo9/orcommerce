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
        usuario: { funcao: 'update', username: '', senhaAtual: '', senhaNova: '', senhaNovac: '', cidade: '', 
                    estado: '', email: Cookies.get('email'), sessionId: Cookies.get('sessionId') },
        anuncios: []
    },
    methods: {
        atualizar: function(){
            var self = this;    //Variável self para referneciar data
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
        getData: function(data){    //Retorna uma string formatada de uma data
            var anuncioData = new Date(data);
            var dia = anuncioData.getDate();
            var mes = anuncioData.getMonth()+1;
            var ano = anuncioData.getFullYear();
            var hora = anuncioData.getHours();
            var minuto = anuncioData.getMinutes();
            return dia+'/'+mes+'/'+ano+' às '+hora+':'+minuto;
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
                    self.anuncios = res;   //Passa os anúncios para data.anuncios
                }
            }
        });
    }
});