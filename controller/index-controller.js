var indexController = new Vue({
    el: "#app",
    data: {
        anuncios: [],
        pesquisaCustom: false
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

        enviarPesquisa: function(query){
            var self = this;    //Variável self para referenciar data
            //Faz a a requisição pro servidor:
            $.ajax({
                url: 'http://localhost:8888/anuncio'+query,
                method: 'get',
                statusCode: {
                    500: function(){
                        alert('Erro no servidor. Tente novamente mais tarde.');
                    }
                },
                success: function(res){
                    //Guarda os resultados no array de anuncios:
                    self.anuncios = res;
                }
            });
        }
    },

    created: function(){
        var self = this;    //Variável self para referenciar data
        var done = false;
        //Verifica se é pra fazer uma pesquisa personalizada:
        if(location.search.length > 20){
            var query = location.search;
            if(query.substr(1,12) == 'tipoConsulta' && query.substr(14,8) == 'pesquisa'){
                self.enviarPesquisa(query);
                done = true;
                self.pesquisaCustom = true;
            }
        }
        if(!done)   //Caso não haja pesquisa pra fazer, faz a requsição dos ultimos anúncios pro servidor:
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