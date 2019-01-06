var criarContaController = new Vue({
    el: "#criarConta",
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
        create: { funcao: 'create', email: '', cEmail: '', nome: '', senha: '', 
                    cSenha: '', estado: '', cidade: '' }
    },
    methods: {
        validarFormulario: function(){
            var self = this;    //Variável self para referenciar data
            //Validação do email:
            if(this.create.email != this.create.cEmail){
                alert('Os emails inseridos não coincidem.');
                return 0;
            }
            if(this.create.email.length < 7){
                alert('Insira um email válido.');
                return 0;
            }
            //Validação de nome de usuário:
            if(this.create.nome.length < 3 || this.create.nome.length > 40){
                alert('O nome de usuário deve ter entre 3 e 40 caracteres.');
                return 0;
            }
            //Validação da senha:
            if(this.create.senha != this.create.cSenha){
                alert('As senhas inseridas não coincidem.');
                return 0;
            }
            if(this.create.senha.length < 6 || this.create.senha.length > 20){
                alert('A senha deve conter entre 6 e 20 caracteres.');
                return 0;
            }
            //Validação do nome da cidade:
            if(this.create.cidade.length < 3 || this.create.cidade.length > 40){
                alert('Insira um nome de cidade válido');
                return 0;
            }
            //Envia a request para o servidor:
            $.ajax({
                url: 'http://localhost:8888/usuario',
                method: 'post',
                data: self.create,
                statusCode: {
                    400: function(){ alert('Este endereço de email já está cadastrado.') },
                    500: function(){ alert('Erro no servidor. Tente novamente mais tarde.') }
                },
                success: function(res){     //Em caso de sucesso
                    alert('Conta cadastrada com sucesso.');
                    location.href = 'index.html';   //Redireciona à página inicial
                }
            })
        }
    }
});