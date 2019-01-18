$('#confirmTable').hide();   //Esconde a tabela de confirmação

var criarAnuncioController = new Vue({
    el: '#criar-anuncio',
    data: {
        caminhoFoto: '',
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
        ],
        anuncio: {funcao: 'create', sessionId: Cookies.get('sessionId'), dono: Cookies.get('email'), nome: '',
                    descri: '', categoria: '', cidade: '', estado: '', preco: '0000.00', qtd: '1', foto: ''}
    },
    methods: {
        validarAnuncio: function(){
            var self = this;        //Variável self para referenciar data
            //Valida o nome do item:
            if(this.anuncio.nome.length < 2 || this.anuncio.nome.length > 60){
                alert('O nome de item deve ter entre 2 e 60 caracteres');
                return 0;
            }
            //Valida a descrição:
            if(this.anuncio.descri.length > 255){
                alert('A descrição não pode conter mais que 255 caracteres.');
                return 0;
            }
            //Valida o preço:
            if(isNaN(parseFloat(this.anuncio.preco))){
                alert('Insira um valor válido para o preço.');
                return 0;
            }else if(this.anuncio.preco < 0){
                alert('Insira um valor válido para o preço.');
                return 0;
            }else if (this.anuncio.preco.length > 11){
                alert('O preço não pode conter mais que 11 dígitos de real e 2 de centavos.')
            }
            //Valida a quantidade:
            if(isNaN(this.anuncio.qtd)){
                alert('Insira um valor válido para a quantidade.');
                return 0;
            }else if(this.anuncio.qtd < 1){
                alert('A quantidade deve ser maior que 0.');
                return 0;
            }
            //Valida a cidade:
            if(this.anuncio.cidade.length < 2 || this.anuncio.cidade.length > 40){
                alert('Insira um nome válido de cidade.');
                return 0;
            }
            //Aplica a categoria e o estado
            this.anuncio.categoria = $("#iCategoria").val();
            this.anuncio.estado = $('#iEstado').val();
            //Muda para a view de confirmação:
            $('#anuncioCreate').hide();
            $('#confirmTable').show();
        },
        reeditarAnuncio: function(){
            $('#anuncioCreate').show();
            $('#confirmTable').hide();
        },
        criarAnuncio: function(){
            var self = this;    //Variável self parar referenciar data
            //Envia a requisição para o servidor:
            $.ajax({
                url: 'http://localhost:8888/anuncio',
                method: 'post',
                data: self.anuncio,
                statusCode: {
                    401: function(res){     //Em caso de sessão inválida ou expirada
                        alert('Sua sessão expirou, faça o login novamente.');
                        //Desloga:
                        Cookies.set('sessionId', '');
                        Cookies.set('email', '');
                        Cookies.set('logged', '');
                        window.location.href="index.html";     //Volta para a página inicial
                    },
                    500: function(res){
                        alert('Erro no servidor');
                    }
                },
                success: function(res){
                    Cookies.set('anuncioCriado', res.anuncioId);    //Guarda a id no anuncio criado num cookie
                    //Faz o submit da form de upload de foto:
                    var anuncioForm = document.getElementById('anuncioForm');
                    anuncioForm.submit();
                }
            })
        }
    }
});