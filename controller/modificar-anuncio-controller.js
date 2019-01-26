var modificaController = new Vue({
    el: '#app',
    data: {
        request: {
            funcao: 'update',
            sessionId: Cookies.get('sessionId'),
            email: Cookies.get('email'),
            anuncio: {id: '', nome: '', descri: '', categ: '', cidade: '', estado: '', preco: '', estoque: ''}
        },
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
    },
    methods: {
        validarAnuncio: function(){
            //Valida o nome do item:
            if(this.request.anuncio.nome.length < 2 || this.request.anuncio.nome.length > 60){
                alert('O nome de item deve ter entre 2 e 60 caracteres');
                return 0;
            }
            //Valida a descrição:
            if(this.request.anuncio.descri.length > 255){
                alert('A descrição não pode conter mais que 255 caracteres.');
                return 0;
            }
            //Valida o preço:
            if(isNaN(parseFloat(this.request.anuncio.preco))){
                alert('Insira um valor válido para o preço.');
                return 0;
            }else if(this.request.anuncio.preco < 0){
                alert('Insira um valor válido para o preço.');
                return 0;
            }else if (this.request.anuncio.preco.length > 11){
                alert('O preço não pode conter mais que 11 dígitos de real e 2 de centavos.')
            }
            //Valida a quantidade:
            if(isNaN(this.request.anuncio.estoque)){
                alert('Insira um valor válido para a quantidade.');
                return 0;
            }else if(this.request.anuncio.estoque < 1){
                alert('A quantidade deve ser maior que 0.');
                return 0;
            }
            //Valida a cidade:
            if(this.request.anuncio.cidade.length < 2 || this.request.anuncio.cidade.length > 40){
                alert('Insira um nome válido de cidade.');
                return 0;
            }
            //Se chegou até aqui, envia a request para o servidor:
            var self = this;    //Variável self para referenciar data
            $.ajax({
                url: 'http://localhost:8888/anuncio',
                method: 'post',
                data: self.request,
                statusCode: {
                    500: function(){
                        alert('Erro no servidor, tente novamente mais tarde.');
                    }
                },
                success: function(res){
                    alert('Anúncio alterado com sucesso');
                    location.href='conta.html';     //Redireciona para a página da conta
                }
            })
        }
    },
    created: function(){
        var self = this;    //Variável self para referenciar data
        var anuncioId = window.location.search.substring(4);    //Pega o id da query string
        //Faz a requisição dos dados do anúncio para o servidor:
        $.ajax({
            url: 'http://localhost:8888/anuncio?tipoConsulta=full&id='+anuncioId,
            method: 'get',
            statusCode: {
                500: function(){
                    alert('Erro no servidor, tente novamente mais tarde.');
                }
            },
            success: function(res){
                self.request.anuncio = res;     //Guarda o anúncio recebido da response em request.anuncio
            }
        })
    }
});