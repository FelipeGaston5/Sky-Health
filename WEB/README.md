# Como Criar Páginas HTML Ligadas à API SkyHealth

Este guia é para completos iniciantes que querem **criar páginas HTML, CSS e JS** que consumam a API do backend já pronto, **sem mexer no código do servidor (`server/`)**.

---

## Estrutura de Pastas

```text
WEB/
│
├── html/
│   ├── index.html
│   ├── agnd/
│   │   ├── medico.html
│   │   ├── paciente.html
│   │   └── adm.html
│   │
│   ├── pres/
│   │   ├── medico.html
│   │   ├── paciente.html
│   │   └── adm.html
│   │
│   ├── users/
│   │   ├── medico.html
│   │   ├── paciente.html
│   │   └── adm.html
│   │
│   └── main/
│       ├── login.html
│       └── criar_login.html
│
├── css/
│   ├── style.css
│   ├── agnd/agnd.css
│   ├── pres/pres.css
│   ├── users/users.css
│   └── main/main.css
│
├── js/
│   ├── script.js
│   ├── agnd/agnd.js
│   ├── pres/pres.js
│   ├── users/users.js
│   └── main/main.js
│
└── server/  <-- NÃO MEXER NESTA PASTA
```

## 1️⃣ Criando uma Página HTML Básica

> Exemplo: `html/index.html`
```
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Página Inicial - SkyHealth</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <h1>Bem-vindo ao SkyHealth</h1>
        <nav>
            <a href="main/login.html">Login</a>
            <a href="main/criar_login.html">Criar Conta</a>
        </nav>
    </header>

    <main>
        <p>Escolha uma área para acessar:</p>
        <ul>
            <li><a href="users/paciente.html">Pacientes</a></li>
            <li><a href="users/medico.html">Médicos</a></li>
            <li><a href="users/adm.html">Administradores</a></li>
        </ul>
    </main>

    <script src="../js/script.js"></script>
</body>
</html>
```
## 2️⃣ Ligando CSS

Cada página pode ter seu próprio `CSS`.

> Exemplo em `css/main/main.css`:
```
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
}

header {
    background-color: #007BFF;
    color: white;
    padding: 20px;
    text-align: center;
}

nav a {
    color: white;
    margin: 0 10px;
    text-decoration: none;
}

nav a:hover {
    text-decoration: underline;
}
```

- E no HTML, linkar com

```
<link rel="stylesheet" href="../css/main/main.css">
```

## 3️⃣ Ligando JavaScript

- Cada página pode ter seu próprio JS ou/e compartilhar script.js.

> Exemplo em `js/main/main.js`:
```
document.addEventListener('DOMContentLoaded', () => {
    console.log("Página carregada!");

    // Exemplo de chamada à API
    fetch('http://localhost:3000/pacientes')
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error('Erro ao buscar pacientes:', err));
});
```

- No HTML:
```
<script src="../js/main/main.js"></script>
```

## 4️⃣ Chamando a API

- Use sempre o endereço do servidor : `<http://localhost:3000/>`
- Endpoints já criados:

| Recurso         | Endpoint           |
| --------------- | ------------------ |
| Pacientes       | `/pacientes`       |
| Médicos         | `/medicos`         |
| Prescrições     | `/prescricoes`     |
| Administradores | `/administradores` |
| Farmácias       | `/farmacias`       |
| Agendamentos    | `/agendamentos`    |

- Exemplo de GET pacientes:

```
fetch('http://localhost:3000/pacientes')
  .then(res => res.json())
  .then(data => {
    data.forEach(paciente => {
      console.log(paciente.nome, paciente.cpf);
    });
  });
```

- Exemplo de POST novo paciente:

```
fetch('http://localhost:3000/pacientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nome: 'João Silva',
        cpf: '12345678900',
        email: 'joao@email.com',
        dataNascimento: '1990-01-01'
    })
})
.then(res => res.json())
.then(data => console.log('Paciente criado:', data));
```

## 5️⃣ Organização de Páginas por Área

- HTML → páginas por área (html/agnd/, html/pres/, html/users/, html/main/)

- CSS → cada área tem CSS próprio (css/agnd/, css/pres/, etc.)

- JS → cada área tem JS próprio (js/agnd/, js/pres/, etc.)

## 6️⃣ Regras Importantes

1. NUNCA mexa na pasta server/. É o backend que já está rodando.

2. HTML, CSS e JS podem consumir os endpoints via fetch().

3. Mantenha caminhos relativos corretos para CSS e JS.

4. Teste cada página abrindo o HTML no navegador.

5. Para chamadas API, o backend precisa estar rodando (node server.js).

## 7️⃣ Exemplo de Fluxo Completo

1. Usuário abre `html/main/login.html`.

2. JS captura login e faz `POST` para `/pacientes` ou `/medicos`.

3. Usuário logado é redirecionado para a página certa:

    - `html/users/paciente.html`

    - `html/users/medico.html`

    - `html/users/adm.html`

4. Página usa JS próprio para buscar informações da API:

    - `fetch('<http://localhost:3000/prescricoes>')`

    - popula tabelas ou campos com os dados retornados.

5. CSS da área deixa tudo organizado visualmente.

## Pasta `assets` – Explicação

A pasta `assets/` é **onde você coloca todos os arquivos estáticos** do seu projeto web, como:

- **Imagens** (`.png`, `.jpg`, `.svg`, etc.)  
- **Fontes** (`.ttf`, `.woff`, `.woff2`)  
- **Ícones**  
- **Arquivos adicionais** usados no frontend (ex.: PDFs, logos, backgrounds)

```text
WEB/
└── assets/
    ├── images/
    │   ├── logo.png
    │   ├── banner.jpg
    │   └── icones/
    │       ├── edit.svg
    │       └── delete.svg
    │
    ├── fonts/
    │   ├── Roboto-Regular.ttf
    │   └── OpenSans-Bold.woff2
    │
    └── docs/
        └── manual.pdf
```

### Como Usar nos HTML/CSS/JS

- HTML – Referenciando imagens:

```
<img src="../assets/images/logo.png" alt="Logo SkyHealth">
```

- CSS – Usando imagens de background:

```
header {
    background: url('../assets/images/banner.jpg') no-repeat center center;
    background-size: cover;
}
```

- JS – Manipulando assets dinamicamente:

```
const logo = document.createElement('img');
logo.src = '../assets/images/logo.png';
document.body.appendChild(logo);
```

### Regras

1. Sempre use caminhos relativos corretos dependendo da posição do HTML que está chamando o arquivo.

2. Mantenha os arquivos organizados em subpastas (images, fonts, docs) para facilitar manutenção.

3. A pasta assets/ é somente para arquivos estáticos, não coloque arquivos do backend aqui.


## 🔹Dicas Finais

- Sempre use fetch ou bibliotecas JS como Axios para chamar a API.

- Separar CSS/JS por área ajuda na manutenção.

- Console.log é seu amigo para debugar.

- Comece com HTML simples e vá incrementando com JS.

- Não é necessário mexer em `server/` para criar páginas web.
