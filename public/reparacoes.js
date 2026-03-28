async function carregarReparacoes() {
    try {
        const resposta = await fetch('http://localhost:3000/reparacoes');
        const reparacoes = await resposta.json();
        const tabela = document.getElementById('tabela-reparacoes');
        tabela.innerHTML = '';

        reparacoes.forEach(rep => {
    // Cálculos com IVA (1.23)
    const precoPecaComIVA = (rep.preco_venda * 1.23).toFixed(2);
    const maoObraComIVA = (rep.preco_mao_de_obra * 1.23).toFixed(2);
    const totalFinal = (parseFloat(precoPecaComIVA) + parseFloat(maoObraComIVA)).toFixed(2);

    tabela.innerHTML += `
        <tr>
            <td>${rep.id}</td>
            <td>${rep.equipamento}</td>
            <td>${rep.nome_cliente}</td>
            <td>${rep.nome_peca}</td>
            <td>${precoPecaComIVA} €</td>
            <td>${maoObraComIVA} €</td>
            <td style="font-weight: bold; color: #28a745;">${totalFinal} €</td>
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
           
<td>
    <button onclick="gerarPDF(${JSON.stringify(rep).replace(/"/g, '&quot;')})" style="background: #007bff; color: white; padding: 5px; border: none; cursor: pointer; margin-right: 5px;">PDF</button>
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

function gerarPDF(rep) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuração de Estilo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("GUIA DE REPARAÇÃO", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.line(10, 35, 200, 35); // Linha divisória

    // Dados do Cliente
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CLIENTE:", 10, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome: ${rep.nome_cliente}`, 10, 52);
    doc.text(`ID Cliente: ${rep.cliente_id}`, 10, 59);

    // Dados do Equipamento
    doc.setFont("helvetica", "bold");
    doc.text("DETALHES DO SERVIÇO:", 10, 75);
    doc.setFont("helvetica", "normal");
    doc.text(`Equipamento: ${rep.equipamento}`, 10, 82);
    doc.text(`Avaria: ${rep.descricao_avaria}`, 10, 89);
    doc.text(`Peça a usar: ${rep.nome_peca}`, 10, 96);
    doc.text(`Status Atual: ${rep.status}`, 10, 103);

    // Valores
    doc.line(10, 110, 200, 110);
    doc.setFont("helvetica", "bold");
    const totalIVA = ((parseFloat(rep.preco_venda) + parseFloat(rep.preco_mao_de_obra)) * 1.23).toFixed(2);
    doc.text(`TOTAL ESTIMADO (C/ IVA): ${totalIVA} EUR`, 10, 120);

    // Rodapé
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Obrigado pela preferência.", 105, 150, { align: "center" });

    // Abre o PDF ou faz download
    doc.save(`Reparacao_${rep.id}_${rep.equipamento.replace(/\s+/g, '_')}.pdf`);
}