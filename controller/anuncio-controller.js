var anuncioController = new Vue({
    el: '#anuncioDetalhe',
    data: {
        anuncio: {}
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