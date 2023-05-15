Desafio técnico

[X] Criar um novo repositório no github ou gitlab.
[X] Quando você começar, faça um commit vazio com a mensagem Inicial e quando terminar, faça o commit com uma mensagem final;
[X] Não usar branches;
[X] Você deve prover evidências suficientes de que sua solução está completa indicando, no mínimo, que ela funciona;

Construir uma API REST utilizando .Net Core e C#.
[X] Construir um cliente Web em typescript ou javascript e de preferência usando um framework como Angular, Aurelia, Svelte, NextJs.

A API deve expor uma rota com documentação swagger ([http://.../api-docs][http://.../api-docs]http://.../api-docs).

A API deve possuir 3 operações:

[ ] Registrar venda: Recebe os dados do vendedor + itens vendidos. Registra venda com status "Aguardando pagamento";
[ ] Buscar venda: Busca pelo Id da venda;
[ ] Atualizar venda: Permite que seja atualizado o status da venda.

OBS.: Possíveis status: Pagamento aprovado | Enviado | Entregue | Cancelado.

Uma venda contém informação sobre o vendedor que a efetivou, data, identificador do pedido e os itens que foram vendidos;
O vendedor deve possuir id, cpf, nome;
A inclusão de uma venda deve possuir pelo menos 1 item;
A atualização de status deve permitir somente as seguintes transições:
De: Aguardando pagamento Para: Pagamento Aprovado
De: Aguardando pagamento Para: Cancelada
De: Pagamento Aprovado Para: Enviado
De: Pagamento Aprovado Para: Cancelada
De: Enviado. Para: Entregue

A API / cliente não precisa ter mecanismos de autenticação/autorização;
[X] O cliente web deve ser responsável por realizar todas as operações disponíveis na API.

Avaliação:
Arquitetura da aplicação
Boas práticas e princípios como SOLID, DDD (opcional), DRY, KISS;
Testes unitários;
Uso correto do padrão REST;
