var indexController = new Vue({
    el: "#exibe-anuncios",
    data: {
        anuncios: [],
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
        var self = this;    //Variável self para referenciar data
        //Faz a requsição de anúncios pro servidor:
        $.ajax({
            url: 'http://localhost:8888/anuncio?tipoConsulta=ultimos',
            method: 'get',
            statusCode:{
                500: function(){    //Em caso de problemas no servidor
                    anuncios = [];      //Esvazia o array de anúncios
                }
            },
            success: function(res){
                self.anuncios = res;    //Armazena os anúncios recebidos da response no array anuncios
            }
        })
    }
});