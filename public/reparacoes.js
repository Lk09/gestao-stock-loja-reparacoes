async function carregarReparacoes() {
    try {
        const resposta = await fetch('http://localhost:3000/reparacoes');
        const reparacoes = await resposta.json();
        const tabela = document.getElementById('tabela-reparacoes');
        tabela.innerHTML = '';

        reparacoes.forEach(rep => {
            tabela.innerHTML += `
                <tr>
                    <td>${rep.id}</td>
                    <td>${rep.equipamento}</td>
                    <td>${rep.descricao_avaria}</td>
                    <td>${rep.nome_cliente} (${rep.cliente_id})</td>
                    <td>${rep.nome_peca} (${rep.peca_id})</td>
                    <td>${rep.preco_mao_de_obra} €</td>
                    <td>
                        <select onchange="atualizarStatus(${rep.id}, this.value, '${rep.descricao_avaria}', '${rep.equipamento}', ${rep.preco_mao_de_obra})">
                            <option value="Pendente" ${rep.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="Orçamento" ${rep.status === 'Orçamento' ? 'selected' : ''}>Orçamento</option>
                            <option value="Em reparação" ${rep.status === 'Em reparação' ? 'selected' : ''}>Em reparação</option>
                            <option value="Concluído" ${rep.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="eliminarReparacao(${rep.id})" style="background: #dc3545; color: white; padding: 5px; border: none; cursor: pointer;">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) { console.error(erro); }
}

async function adicionarReparacao(event) {
    event.preventDefault();
    const equipamento = document.getElementById('equipamento').value;
    const descricao_avaria = document.getElementById('descricao_avaria').value;
    const cliente_id = document.getElementById('cliente_id').value;
    const peca_id = document.getElementById('peca_id').value;
    const preco_mao_de_obra = document.getElementById('preco_mao_de_obra').value;

    try {
        const resposta = await fetch('http://localhost:3000/reparacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipamento, descricao_avaria, cliente_id, peca_id, preco_mao_de_obra })
        });
        if (resposta.ok) {
            document.getElementById('form-reparacoes').reset();
            carregarReparacoes();
        } else alert("Erro: Verifica se os IDs existem.");
    } catch (erro) { console.error(erro); }
}

async function atualizarStatus(id, status, descricao_avaria, equipamento, preco_mao_de_obra) {
    try {
        const resposta = await fetch(`http://localhost:3000/reparacoes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, descricao_avaria, equipamento, preco_mao_de_obra })
        });
        if (resposta.ok) {
            if (status === 'Concluído') alert("Reparação Concluída! Stock abatido automaticamente.");
            carregarReparacoes();
        }
    } catch (erro) { console.error(erro); }
}

async function eliminarReparacao(id) {
    if (!confirm("Eliminar reparação?")) return;
    try {
        const resposta = await fetch(`http://localhost:3000/reparacoes/${id}`, { method: 'DELETE' });
        if (resposta.ok) carregarReparacoes();
    } catch (erro) { console.error(erro); }
}

carregarReparacoes();

async function carregarListasReferencia() {
    try {
        // Carregar Stock
        const resStock = await fetch('http://localhost:3000/stock');
        const stock = await resStock.json();
        const tabStock = document.getElementById('tabela-mini-stock');
        tabStock.innerHTML = '';
        stock.forEach(p => {
            tabStock.innerHTML += `<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.quantidade}</td></tr>`;
        });

        // Carregar Clientes
        const resClientes = await fetch('http://localhost:3000/clientes');
        const clientes = await resClientes.json();
        const tabClientes = document.getElementById('tabela-mini-clientes');
        tabClientes.innerHTML = '';
        clientes.forEach(c => {
            tabClientes.innerHTML += `<tr><td>${c.id}</td><td>${c.nome}</td><td>${c.nif}</td></tr>`;
        });
    } catch (erro) {
        console.error("Erro ao carregar referências:", erro);
    }
}

// Executa a função ao abrir a página
carregarListasReferencia();