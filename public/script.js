async function carregarStock() {
    try {
        // 1. Faz o pedido GET à API
        const resposta = await fetch('http://localhost:3000/stock');
        const pecas = await resposta.json();

        // 2. Seleciona a tabela no HTML
        const tabela = document.getElementById('tabela-stock');
        tabela.innerHTML = ''; // Limpa a tabela antes de preencher

        // 3. Cria uma linha (<tr>) para cada peça que vem da base de dados
       pecas.forEach(peca => {
    // Define a cor de fundo se o stock for baixo
    const corAlerta = peca.quantidade < 3 ? 'background-color: #f8d7da; color: #721c24; font-weight: bold;' : '';

    tabela.innerHTML += `
        <tr style="${corAlerta}">
            <td>${peca.id}</td>
            <td>${peca.nome}</td>
            <td>
            <button onclick="alterarQuantidade(${peca.id}, 'diminuir')" style="padding: 2px 8px; cursor: pointer;">-</button>
            <span style="margin: 0 10px;">${peca.quantidade}</span>
            <button onclick="alterarQuantidade(${peca.id}, 'aumentar')" style="padding: 2px 8px; cursor: pointer;">+</button>
            </td>
            
            <td>${peca.preco_venda} €</td>
            <td>
                <button onclick="eliminarPeca(${peca.id})" style="background: #dc3545; color: white; padding: 5px 10px; border: none; cursor: pointer; border-radius: 3px;">Eliminar</button>
            </td>
        </tr>
    `;
});
    } catch (erro) {
        console.error("Erro ao carregar o stock:", erro);
        alert("Erro ao ligar à base de dados!");
    }
}

// Executa a função automaticamente assim que a página abre
carregarStock();

async function adicionarPeca(event) {
    event.preventDefault(); // Evita que a página recarregue ao submeter o formulário

    const nome = document.getElementById('nome').value;
    const quantidade = document.getElementById('quantidade').value;
    const preco_venda = document.getElementById('preco').value;

    try {
        const resposta = await fetch('http://localhost:3000/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, quantidade, preco_venda })
        });

        if (resposta.ok) {
            document.getElementById('form-stock').reset(); // Limpa os campos
            carregarStock(); // Atualiza a tabela imediatamente
        } else {
            alert("Erro ao adicionar peça à base de dados.");
        }
    } catch (erro) {
        console.error("Erro no POST:", erro);
    }
}

async function eliminarPeca(id) {
    if (!confirm("Tens a certeza que queres eliminar esta peça?")) return;

    try {
        const resposta = await fetch(`http://localhost:3000/stock/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            carregarStock(); // Atualiza a tabela para fazer a peça desaparecer
        } else {
            alert("Erro ao eliminar a peça na base de dados.");
        }
    } catch (erro) {
        console.error("Erro no DELETE:", erro);
    }
}
function filtrarStock() {
    const filtro = document.getElementById('inputPesquisaStock').value.toLowerCase();
    const tabela = document.getElementById('tabela-stock');
    const linhas = tabela.getElementsByTagName('tr');

    for (let i = 0; i < linhas.length; i++) {
        // Obtém o texto da coluna "Nome da Peça" (índice 1)
        const nomePeca = linhas[i].getElementsByTagName('td')[1]?.textContent.toLowerCase() || "";

        if (nomePeca.includes(filtro)) {
            linhas[i].style.display = ""; // Mostra se houver correspondência
        } else {
            // Garante que não esconde o cabeçalho (thead) por acidente
            if (linhas[i].parentNode.tagName !== 'THEAD') {
                linhas[i].style.display = "none"; 
            }
        }
    }
}
async function alterarQuantidade(id, operacao) {
    try {
        const resposta = await fetch(`http://localhost:3000/stock/${id}/${operacao}`, {
            method: 'PUT'
        });
        if (resposta.ok) {
            carregarStock(); // Recarrega a tabela para mostrar o novo número
        }
    } catch (erro) {
        console.error("Erro ao alterar quantidade:", erro);
    }
}