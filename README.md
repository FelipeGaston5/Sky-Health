# SKY Health

## Sistema de Gestão de Registros Clínicos Integrados

### 👥 Autores

- Camylle Mayara Torres de Almeida
- Felipe Tadeu Paiva Gaston
- Giovanna Lethicia Caxias Pereira da Silva
- Júlia Vitória da Silva Fonseca
- Mateus Gomes Mendes

### 👩‍🏫 Orientadoras

- Ana Claudia Monteiro de Andrade
- Jennefer Cristine Ferreira

---

## 📖 Sumário

1. [Temas](#-temas)
2. [Problematização](#-problematização)
3. [Proposta de Resolução](#-proposta-de-resolução)
4. [Requisitos do Sistema](#-requisitos-do-sistema)
5. [Ideias e Implementação](#-ideias-e-implementação)
6. [Resultados Esperados](#-resultados-esperados)
7. [Considerações Finais](#-considerações-finais)

---

## 🎯 Temas

O projeto **SKY Health** aborda dois grandes desafios da saúde pública no Recife:

- **Fragmentação do registro clínico do cidadão**
- **Limitação de acesso a dados estratégicos do território**

Esses problemas impactam diretamente a eficiência dos serviços de saúde e a qualidade do atendimento à população.

---

## ❓ Problematização

### Fragmentação do Registro Clínico

Atualmente, cada unidade de saúde mantém registros isolados, obrigando o paciente a carregar consigo exames, receitas e históricos em papel. Isso gera:

- Retrabalho
- Custos adicionais
- Riscos de falhas no atendimento
- Dificuldade no acompanhamento de condições crônicas

### Limitação de Acesso a Dados Estratégicos

Gestores públicos têm dificuldade em acessar informações consolidadas sobre:

- Incidência de doenças por bairro
- Níveis de vacinação
- Evolução de surtos
- Indicadores de saúde da população

Isso compromete a agilidade e a precisão na tomada de decisões.

---

## 💡 Proposta de Resolução

### Integração do Registro Clínico

- Criação de um **Sistema Único de Gestão de Registros de Saúde**
- Banco de dados centralizado e atualizado em tempo real
- Controle de acesso por perfis (médicos, enfermeiros, gestores, pacientes)
- Acesso via aplicativo ou portal web

### Integração de Dados Estratégicos

- Módulo de gestão estratégica com **georreferenciamento**
- Relatórios dinâmicos e exportáveis
- **Prescrição digital** integrada entre médicos, pacientes e farmácias
- Suporte a políticas públicas baseadas em evidências

---

## ⚙️ Requisitos do Sistema

### Funcionais

- Cadastro único de paciente
- Acesso por perfil de usuário
- Atualização em tempo real
- Relatórios dinâmicos e exportáveis
- Georreferenciamento de dados
- Histórico médico consolidado
- Controle de permissão de dados

### Não Funcionais

- Segurança da informação (criptografia, LGPD)
- Alta disponibilidade (99,5%)
- Escalabilidade para inclusão de novas unidades

---

## 🛠️ Ideias e Implementação

### 1. Estrutura Tecnológica

- Banco de dados centralizado
- Plataforma em nuvem
- Aplicativos móveis e portal web
- API de integração com sistemas existentes

### 2. Segurança e Confiabilidade

- Autenticação multifatorial
- Controle de acesso por perfil
- Criptografia ponta a ponta
- Registro de auditoria

### 3. Funcionalidades Principais

- Histórico clínico unificado
- Prescrição digital integrada
- Relatórios dinâmicos
- Georreferenciamento

### 4. Etapas de Implementação

- Diagnóstico inicial
- Desenvolvimento da plataforma piloto
- Expansão gradual
- Capacitação dos usuários
- Monitoramento e avaliação

---

## 📈 Resultados Esperados

- Redução da burocracia e do uso de papel
- Melhoria na segurança do paciente
- Suporte à gestão pública com dados estratégicos
- Maior transparência e participação do paciente
- Economia de recursos públicos

---

## ✅ Considerações Finais

O **SKY Health** é uma proposta inovadora para modernizar a saúde pública do Recife, integrando hospitais, clínicas, gestores, farmácias e pacientes em uma única plataforma. Com foco na humanização do cuidado e na eficiência operacional, o projeto visa transformar a realidade da saúde na cidade, tornando-a referência para outras regiões do Brasil.

---

> 📌 *Projeto acadêmico desenvolvido com o objetivo de solucionar problemas reais na gestão de saúde pública.*

---

## 🚀 Atualizações Recentes

Registro rápido das últimas melhorias implementadas no backend (API Node.js + MongoDB):

- Conexão resiliente com MongoDB Atlas via Mongoose com variáveis de ambiente (`MONGODB_URI`, `MONGODB_FAMILY`).
- Middleware `requireDbConnected` garantindo resposta 503 quando o banco estiver indisponível.
- Healthcheck em `/health` retornando estado da conexão Mongoose (`mongooseState`).
- Padronização das rotas de recursos principais: pacientes, médicos, prescrições, administradores, farmácias, agendamentos e exames.
- Modelo de Paciente expandido com dados clínicos completos (alergias, doenças crônicas, histórico cirúrgico, etc.).
- Endpoint de login básico para pacientes (`POST /pacientes/login`).

Próximos passos sugeridos:

- Hash de senha (ex: bcrypt) e tokens JWT.
- Paginação e filtros nas listagens.
- Validação avançada (Joi/Zod) e testes automatizados.
- Auditoria e logs estruturados.

---

## 🧩 Arquitetura Técnica (Visão Resumida)

Componentes atuais:

1. Backend Node.js/Express (pasta `WEB/server`)
2. Banco de Dados: MongoDB Atlas (`SkyHealth`)
3. Modelos Mongoose por domínio (ex: `userModel.js`, `medicoModel.js`, etc.)
4. Rotas REST agrupadas em `WEB/server/routes/`

---

## 📦 Dependências Principais

Backend (`WEB/server`):

- express 5.x
- mongoose 8.x
- cors

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` dentro de `WEB/server/` (ou configure no ambiente) para evitar expor credenciais:

```bash
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>/<db>?retryWrites=true&w=majority&appName=SkyHealth
PORT=3000
# Força família de IP (4 ou 6) – opcional
MONGODB_FAMILY=4
```

O código já faz fallback para a URI hardcoded caso a variável não exista, mas recomenda-se removê-la depois de configurar `.env`.

Sugestão de melhoria futura: usar `dotenv` para carregar as variáveis.

---

## ▶️ Passo a Passo para Rodar o Sistema (Backend + Frontend)

### 1. Pré-requisitos

- Node.js (versão 18+ recomendada) e npm instalados.
- Conta e cluster no MongoDB Atlas (ou instância local).
- String de conexão válida (URI) com usuário e senha.
- (Opcional) Extensão Live Server no VS Code ou um servidor estático simples.

Verifique versão do Node:

```powershell
node -v
```

### 2. Clonar o repositório (se ainda não fez)

```powershell
git clone https://github.com/FelipeGaston5/Sky-Health.git
cd Sky-Health
```

### 3. Configurar variáveis de ambiente do backend

Crie o arquivo `WEB/server/.env` (recomendado) ou exporte na sessão.

Conteúdo sugerido de `.env`:

```bash
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>/<db>?retryWrites=true&w=majority&appName=SkyHealth
PORT=3000
MONGODB_FAMILY=4
```

Se quiser definir apenas para a sessão do PowerShell (não persiste):

```powershell
$env:MONGODB_URI="mongodb+srv://<usuario>:<senha>@<cluster>/<db>?retryWrites=true&w=majority&appName=SkyHealth"
$env:PORT=3000
```

> Dica: considere instalar `dotenv` futuramente e remover a URI hardcoded do código.

### 4. Instalar dependências do backend

```powershell
cd WEB/server
npm install
```

### 5. Iniciar o servidor API

```powershell
npm start
```

Saída esperada (exemplo):

```text
✅ Conectado ao MongoDB Atlas via Mongoose!
🌐 Servidor em http://localhost:3000
```

### 6. Testar a API

- Healthcheck: <http://localhost:3000/health>
- Raiz: <http://localhost:3000/>
- Listar pacientes (se houver): <http://localhost:3000/pacientes>

### 7. Executar o Frontend (estático)

O frontend atual está em arquivos HTML/CSS/JS simples na pasta `WEB/HTML/`.

Opções:

1. Abrir diretamente o arquivo `WEB/HTML/index.html` no navegador (duplo clique).  
2. Usar Live Server (VS Code) → botão "Go Live" dentro da pasta `WEB/HTML`.  
3. Servir com um servidor estático rápido:

  ```powershell
  npx serve WEB/HTML
  ```

Se quiser integrar com a API via fetch, garanta que as chamadas apontem para `http://localhost:3000` (ou ajuste CORS se mudar a porta).

### 8. Fluxo rápido de teste

1. Criar paciente via `POST /pacientes` (ex: usando Insomnia, Postman ou VS Code REST Client).  
2. Consultar lista: `GET /pacientes`.  
3. Login: `POST /pacientes/login` com `{ "username": "...", "password": "..." }`.  
4. Validar atualização: `PUT /pacientes/:id`.  

### 9. Estrutura relevante

```text
WEB/
  server/          -> API (Express + Mongoose)
    routes/        -> Agrupamento de endpoints por domínio
    models/        -> Schemas Mongoose
    server.js      -> Bootstrap da aplicação
  HTML/            -> Páginas estáticas (frontend inicial)
  CSS/ / JS/       -> Assets de estilo e scripts
```

### 10. Problemas comuns (Troubleshooting)

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| Timeout ao conectar Mongo | IP não liberado no Atlas | Adicionar IP atual ou 0.0.0.0/0 (apenas para testes) |
| Erro de autenticação | Usuário/senha incorretos ou DB errado | Revisar URI e usuário com permissões no cluster |
| Resposta 503 nas rotas | Conexão ainda não estabelecida | Aguardar alguns segundos / verificar URI |
| CORS bloqueando requisição | Origem diferente sem permissão | Ajustar `cors()` para origem específica em produção |
| Senhas em texto plano | Implementação inicial | Adicionar bcrypt e JWT conforme roadmap |

### 11. Próximas melhorias sugeridas

- Script `dev` com nodemon.
- Documentação Swagger (arquivo `openapi.yaml`).
- Pipeline de testes CI.
- Servir frontend pelo próprio Express (ex: `app.use(express.static(...))`).

---

---

## 🛣️ Endpoints Principais (Resumo Inicial)

Base URL padrão local: `http://localhost:3000`

Pacientes (`/pacientes`):

- `POST /pacientes` – cria paciente
- `GET /pacientes` – lista todos
- `GET /pacientes/:id` – busca por ID
- `PUT /pacientes/:id` – atualiza
- `DELETE /pacientes/:id` – remove
- `POST /pacientes/login` – login simples (plaintext – precisa evoluir)

Outros grupos (estruturas similares de CRUD onde aplicável):

- `/medicos`
- `/prescricao`
- `/administradores`
- `/farmacias`
- `/agendamentos`
- `/exames`

Healthcheck:

- `GET /health` – retorna `{ status: 'ok' | 'not_ok', mongooseState }`

Qualquer rota inexistente retorna 404 JSON.

---

## 🧪 Recomendações de Teste Futuro

Adicionar suíte de testes (ex: Jest + Supertest) para:

- Criar paciente válido / inválido
- Login com credenciais corretas e incorretas
- Resposta 503 simulando desconexão do DB
- Validação de campos obrigatórios

---

## 🛡️ Segurança (Backlog)

- Remover senha em texto plano (hash + salt)
- Implementar JWT para autenticação stateless
- Rate limiting e Helmet
- Sanitização de entrada contra NoSQL injection
- Logs de auditoria e trilha de acesso

---

## 🗂️ Modelo Paciente (Resumo dos Campos)

Campos principais presentes em `userModel.js`:

- nome, cpf, email, telefone, dataNascimento, endereco{ rua, numero, bairro, cidade, estado, cep }
- genero, tipoSanguineo, pesoKg, alturaCm
- alergias[], doencasCronicas[], alergiamedicamentos[], medicamentosUso[], historicoCirurgico[]
- observacoesMedicas, username, password (plaintext – a ser ajustado)
- criadoEm, atualizadoEm

---

## 📌 Roadmap (Sugestão)

Curto prazo:

- Refatorar autenticação (hash, JWT)
- Paginação e filtros em listagens
- Documentação Swagger/OpenAPI

Médio prazo:

- Módulo de georreferenciamento
- Prescrição digital completa + integração farmácias
- Dashboard analítico inicial

Longo prazo:

- Notificações e alertas preventivos
- Integração com sistemas legados (ESUS / SIH)
- Auditoria avançada e relatórios gerenciais
- Auditoria avançada e relatórios gerenciais
