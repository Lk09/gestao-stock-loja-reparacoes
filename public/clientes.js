// Ler todos os clientes
async function carregarClientes() {
    try {
        const resposta = await fetch('http://localhost:3000/clientes');
        const clientes = await resposta.json();

        const tabela = document.getElementById('tabela-clientes');
        tabela.innerHTML = ''; 

        clientes.forEach(cliente => {
            tabela.innerHTML += `
                <tr>
                    <td>${cliente.id}</td>
                    <td>${cliente.nome}</td>
                    <td>${cliente.telemovel}</td>
                    <td>${cliente.nif}</td>
                    <td>${cliente.email || '-'}</td>
                    <td>
                        <button onclick="eliminarCliente(${cliente.id})" style="background: #dc3545; color: white; padding: 5px 10px; border: none; cursor: pointer; border-radius: 3px;">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) {
        console.error("Erro ao carregar clientes:", erro);
    }
}

// Criar novo cliente
async function adicionarCliente(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const telemovel = document.getElementById('telemovel').value;
    const nif = document.getElementById('nif').value;
    const email = document.getElementById('email').value;

    try {
        const resposta = await fetch('http://localhost:3000/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telemovel, nif, email })
        });

        if (resposta.ok) {
            document.getElementById('form-clientes').reset();
            carregarClientes(); 
        } else {
            alert("Erro ao adicionar cliente. Verifica se o NIF já existe (é único).");
        }
    } catch (erro) {
        console.error("Erro no POST:", erro);
    }
}

// Eliminar cliente
async function eliminarCliente(id) {
    if (!confirm("Tens a certeza que queres eliminar este cliente?")) return;

    try {
        const resposta = await fetch(`http://localhost:3000/clientes/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            carregarClientes();
        } else {
            alert("Erro ao eliminar cliente.");
        }
    } catch (erro) {
        console.error("Erro no DELETE:", erro);
    }
}

// Arranca automaticamente
carregarClientes();

function filtrarClientes() {
    const filtro = document.getElementById('inputPesquisa').value.toLowerCase();
    const tabela = document.getElementById('tabela-clientes');
    const linhas = tabela.getElementsByTagName('tr');

    for (let i = 0; i < linhas.length; i++) {
        // Obtém o texto do Nome (coluna 1) e NIF (coluna 3)
        const nome = linhas[i].getElementsByTagName('td')[1]?.textContent.toLowerCase() || "";
        const nif = linhas[i].getElementsByTagName('td')[3]?.textContent.toLowerCase() || "";

        if (nome.includes(filtro) || nif.includes(filtro)) {
            linhas[i].style.display = ""; // Mostra a linha
        } else {
            linhas[i].style.display = "none"; // Esconde a linha
        }
    }
}