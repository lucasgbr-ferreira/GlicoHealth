✔️ Terminado
# Especificações Do Projeto

<span style="color:red">Pré-requisitos: <a href="1-Contexto.md"> Documentação de Contexto</a></span>

> Essa parte do documento, consiste em mostrar personas fictícias que foram criadas pelos integrantes do grupo, elas foram usadas para entender melhor o que cada diferente tipo de usuário precisa.

## Personas

> 1. Carlos Eduardo da Silva tem 32 anos. Ele é uma pessoa muito objetiva, extrovertida e caridosa. Dentista, seu sonho é abrir uma clínica odontológica, ver seus filhos crescerem e aproveitar a vida, viajando pelo mundo e desfrutando de todas as belezas que ele tem para oferecer.

> 2. Laura Martins tem 42 anos. Ela é fotógrafa e é uma pessoa muito criativa, reservada e organizada. Seu sonho é viajar pelo mundo fotografando diferentes povos e conhecendo diferentes culturas. 

> 3. Paulo Izidoro Menezes tem 44 anos. Ele é médico e é um homem reservado, gentil e paciente, escuta seus pacientes e busca novas formas de atendê-los melhor. Seu sonho é se tornar referência brasileira no tratamento de diabetes, comprar uma casa de campo para receber sua família e ver sua filha ingressando em uma faculdade.


## Histórias de Usuários

Com base na análise das personas forma identificadas as seguintes histórias de usuários:

|EU COMO... Carlos   | QUERO/PRECISO ... FUNCIONALIDADE   | PARA ... MOTIVO/VALOR                   |
|--------------------|------------------------------------|-----------------------------------------|
| Usuário do sistema | Manter a minha glicose controlada  | Evitar hiperglicemias e hipoglimecias   |
| Diabético TIPO 1   | evitando alterações bruscas        | trazer tranquilidade para minha família |

|EU COMO... Laura    | QUERO/PRECISO ... FUNCIONALIDADE   | PARA ... MOTIVO/VALOR                   |
|--------------------|------------------------------------|---------------------------------------- |
| Usuário do sistema | Manter minha alimentação controada | Ter uma boa qualidade de vida           |
| Diabética TIPO 2   | enchaminhar atividades aos médicos | ser uma pessoa com a glicose controlaa  |

|EU COMO... Paulo    | QUERO/PRECISO ... FUNCIONALIDADE   | PARA ... MOTIVO/VALOR                   |
|--------------------|------------------------------------|---------------------------------------- |
| Usuário do sistema | Receber informações dos pacientes  | Conseguir atender todos os pacientes    |
| Médico             | de uma forma simples e direta      | otimizar tempo                          |



## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto.

### Requisitos Funcionais

|ID    |                                Descrição do Requisito                              | Prioridade |
|------|------------------------------------------------------------------------------------|------------|
|RF-001| O sistema deve mostrar as últimas consultas dos pacientes                          | ALTA       | 
|RF-002| Os médicos devem poder se comunicar com os paciente por meio avisos/notificações   | ALTA       |
|RF-003| O paciente deve ser lembrado de próximas consultas                                 | ALTA       | 
|RF-004| O paciente deve poder ver uma lista de alimentos sugeridos                         | MÉDIA      |
|RF-005| O paciente deve poder fazer anotações sobre seu estado de saúde e rotina (dieta,
frequência de atividade física, etc).                                                       | ALTA       | 
|RF-006| O paciente deve receber notificações das próximas aplicações de insulina           | ALTA       |
|RF-007| Os médicos devem ter acesso à rotina de alimentação do cliente                     | ALTA       | 
|RF-008| Os médicos devem ter acesso aos registros de glicose do cliente                    | ALTA       |


### Requisitos não Funcionais

|ID     | Descrição do Requisito                                                                    |Prioridade |
|-------|-------------------------------------------------------------------------------------------|-----------|
|RNF-001| O banco de dados deve suportar pelo menos 6 meses                                         | ALTA      | 
|RNF-002| A interface do sistema deve ser intuitiva e acessível para diferentes perfis de usuários,
incluindo idosos e pessoas com pouca experiência em tecnologia.                                     | ALTA      | 
|RNF-003| O tempo de resposta do sistema para agendamentos deve ser inferior a 3 segundos.          | ALTA      |
|RNF-004| O sistema deve ter métodos de calcular os níveis de glicose do paciente por meio da
sua alimentação caso o mesmo não tenha dispositivos de medições automáticas.                        | ALTA      |
|RNF-005| O sistema deve ter dois tipos de interfaces distintas, uma para pacientes e outra para        
médicos e gestores da clínica referente ao site.                                                    | ALTA      |

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                                                    |
|--|------------------------------------------------------------------------------|
|01| Usuários do tipo paciente não devem ter acesso a ficha de outros pacientes   |
|02| - Alterações na ficha do paciente devem ser realizadas apenas pelos médicos. |