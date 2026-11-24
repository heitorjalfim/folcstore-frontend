# ADR-002: Assegurar a não venda de produtos alem do seu estoque

- **Status:** Aceita
- **Data:** 2026-11-24
- **Autor:** PAULO NERY DA FONSECA (pnf@cesar.school)
- **Turma:** Regular (terças)
- **Projeto:** Origem · marketplace da economia criativa e do artesanato de Pernambuco

## Contexto

Com o MVP do frontend terminado e o backend encaminhado, a prioridade hoje é terminar a integração e validar o sistema de ponta a ponta

## Preocupações

Testabilidade, Autentificação, Integridade, Prazo

## Decisão

Adicionar um caso de teste para dois usuarios tentando comprar o mesmo produto com apenas 1 em estoque

## Justificativa

Pois evitar criacao de erro em regra de negocio constitui como Prevenção de Erros

## Consequências

Se ganha Prevenção de Erros e de confiabilidade.
Aumenta complexidade de testes, adicionando um caso de teste que nao pode ser feito facilmente pois precisa de duas contas autenticadas realizando um metodo simultaneamente

## Alternativas consideradas

Temporariamente reservar estoque baseado em oque esta dentro de carrinhos

## Rastreabilidade

**Atributo de qualidade:** Confiabilidade · Ausência de falhas

**Cenário que originou a decisão:**

> No servidor backend rodando, dois compradores Tentam realizar compra simultanea de um mesmo produto que so tem 1 em estoque Conexao entre o BD e a camada repository do backend. O sistema Deve evitar venda de produto alem do disponivel em estoque, Em menos de 2 segundos.

**Padrão arquitetural adotado:** Cliente-servidor

**Táticas empacotadas:** Centralizar regra e dado no servidor; Autenticar e autorizar na borda; Limitar a exposição da API

Caso de teste que sera criado

## Verificação

- **Teste do cenário:** Mandar pro servidor backend dois requisitos de compra de um mesmo produto com estoque 1.
Os requisitos devem esta autenticados para dois usuarios diferentes

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
