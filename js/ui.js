// ===== MEU CAIXA — GERENCIAMENTO DA INTERFACE (UI) =====

// ATUALIZA TODA A TELA (SALDOS, HISTÓRICO, BALANÇO MENSAL)
function atualizarUI() {
    if (typeof verificarTravaDiaria === 'function') verificarTravaDiaria();
    if (typeof verificarStatusPremium === 'function') verificarStatusPremium();

    let acumuladoFaturamento = 0;
    let acumuladoRendaExtra = 0;
    let acumuladoGasolina = 0;
    let acumuladoPessoal = 0;
    let acumuladoReserva = 0;
    let acumuladoInvestimento = 0;

    // Calcula acumulados do histórico do período
    dados.historico.forEach(item => {
        acumuladoFaturamento += (item.faturamento || 0);
        acumuladoRendaExtra += (item.rendaExtra || 0);
        acumuladoGasolina += (item.gasolina || 0);
        acumuladoPessoal += (item.pessoal || 0);
        acumuladoReserva += (item.reservaFinanceira || 0);
        acumuladoInvestimento += (item.investimento || 0);
    });

    // Saldos das Caixas
    const totalGanhos = acumuladoFaturamento + acumuladoRendaExtra;
    const totalGastos = acumuladoGasolina + acumuladoPessoal;
    const saldoReservaFinanceira = acumuladoReserva - (dados.transferenciasReserva || 0);
    const saldoPoupanca = acumuladoInvestimento - (dados.transferenciasPoupanca || 0);
    
    // Disponível é o saldo retido que sobrou do faturamento/gastos/reservas + os resgates efetuados
    const saldoDisponivel = (totalGanhos - totalGastos - acumuladoReserva - acumuladoInvestimento) + (dados.transferenciasReserva || 0) + (dados.transferenciasPoupanca || 0);
    const saldoTotalGeral = saldoDisponivel + saldoReservaFinanceira + saldoPoupanca;

    // Atualiza Caixas no Topo
    const elTotal = document.getElementById('saldo-total');
    const elEmergencia = document.getElementById('saldo-fundo-emergencia');
    const elPoupanca = document.getElementById('saldo-poupanca');
    const elDisponivel = document.getElementById('saldo-disponivel');

    if (elTotal) elTotal.innerText = formatarMoeda(saldoTotalGeral);
    if (elEmergencia) elEmergencia.innerText = formatarMoeda(saldoReservaFinanceira);
    if (elPoupanca) elPoupanca.innerText = formatarMoeda(saldoPoupanca);
    if (elDisponivel) elDisponivel.innerText = formatarMoeda(saldoDisponivel);

    // Atualiza Tabela de Balanço Mensal
    if (document.getElementById('total-faturamento')) document.getElementById('total-faturamento').innerText = formatarMoeda(acumuladoFaturamento);
    if (document.getElementById('total-renda-extra')) document.getElementById('total-renda-extra').innerText = formatarMoeda(acumuladoRendaExtra);
    if (document.getElementById('total-gasolina')) document.getElementById('total-gasolina').innerText = formatarMoeda(acumuladoGasolina);
    if (document.getElementById('total-pessoal')) document.getElementById('total-pessoal').innerText = formatarMoeda(acumuladoPessoal);
    if (document.getElementById('total-reserva-aba')) document.getElementById('total-reserva-aba').innerText = formatarMoeda(saldoReservaFinanceira);
    if (document.getElementById('total-investimento-aba')) document.getElementById('total-investimento-aba').innerText = formatarMoeda(saldoPoupanca);

    // Renderiza o Último Registro se existir
    const containerUltimo = document.getElementById('ultimo-resumo-container');
    if (containerUltimo) {
        if (dados.historico.length > 0) {
            const u = dados.historico[0];
            containerUltimo.classList.remove('hidden');
            if (document.getElementById('last-date')) document.getElementById('last-date').innerText = u.data;
            if (document.getElementById('last-ganho')) document.getElementById('last-ganho').innerText = formatarMoeda((u.faturamento || 0) + (u.rendaExtra || 0));
            if (document.getElementById('last-gastos')) document.getElementById('last-gastos').innerText = formatarMoeda((u.gasolina || 0) + (u.pessoal || 0));
            if (document.getElementById('last-reserva')) document.getElementById('last-reserva').innerText = formatarMoeda((u.faturamento || 0) + (u.rendaExtra || 0) - (u.gasolina || 0) - (u.pessoal || 0));
        } else {
            containerUltimo.classList.add('hidden');
        }
    }

    renderizarHistorico();
}

// RENDERIZA LISTA DO HISTÓRICO
function renderizarHistorico() {
    const tbody = document.getElementById('historico-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (dados.historico.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-500 text-xs italic">Nenhum lançamento recente</td></tr>`;
        return;
    }

    dados.historico.forEach((item, index) => {
        const saldoDia = (item.faturamento || 0) + (item.rendaExtra || 0) - (item.gasolina || 0) - (item.pessoal || 0);
        const tr = document.createElement('tr');
        tr.className = "border-b border-gray-800 hover:bg-gray-800/50";
        tr.innerHTML = `
            <td class="p-3 font-bold text-gray-300 text-xs">${item.data}</td>
            <td class="p-3 font-bold text-xs ${saldoDia >= 0 ? 'text-green-400' : 'text-red-400'}">${formatarMoeda(saldoDia)}</td>
            <td class="p-3 text-right">
                <button type="button" onclick="abrirModalEdicao(${index})" class="text-blue-400 hover:text-blue-300 font-bold text-xs bg-gray-800 px-2 py-1 rounded-md border border-gray-700">Ajustar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// RENDERIZA A LISTA NA PLANILHA DE GASTOS
function renderizarListaGastos() {
    const tbody = document.getElementById('lista-gastos-correntes-body');
    const totalEl = document.getElementById('subjanela-total-acumulado');
    if (!tbody) return;

    tbody.innerHTML = '';
    let total = 0;

    itensGastosTemporarios.forEach((item, idx) => {
        total += item.val;
        const tr = document.createElement('tr');
        tr.className = "border-b border-gray-800";
        tr.innerHTML = `
            <td class="p-2 text-gray-300">${item.desc}</td>
            <td class="p-2 font-bold text-red-400">${formatarMoeda(item.val)}</td>
            <td class="p-2 text-right">
                <button type="button" onclick="removerItemGasto(${idx})" class="text-red-500 font-bold">✕</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (totalEl) totalEl.innerText = formatarMoeda(total);
}

// EDIÇÃO DE LANÇAMENTO
function abrirModalEdicao(index) {
    lancamentoEmEdicao = index;
    const item = dados.historico[index];
    const modal = document.getElementById('modal-edicao');
    if (!modal || !item) return;

    if (document.getElementById('edit-data')) document.getElementById('edit-data').value = item.data;
    if (document.getElementById('edit-faturamento')) document.getElementById('edit-faturamento').value = item.faturamento || 0;
    if (document.getElementById('edit-renda-extra')) document.getElementById('edit-renda-extra').value = item.rendaExtra || 0;
    if (document.getElementById('edit-gasolina')) document.getElementById('edit-gasolina').value = item.gasolina || 0;
    if (document.getElementById('edit-pessoal')) document.getElementById('edit-pessoal').value = item.pessoal || 0;
    if (document.getElementById('edit-reserva-financeira')) document.getElementById('edit-reserva-financeira').value = item.reservaFinanceira || 0;
    if (document.getElementById('edit-investimento')) document.getElementById('edit-investimento').value = item.investimento || 0;

    itensGastosTemporarios = item.detalhesGastos ? [...item.detalhesGastos] : [];
    modal.classList.add('active');
}

function fecharModal() {
    const modal = document.getElementById('modal-edicao');
    if (modal) modal.classList.remove('active');
    lancamentoEmEdicao = null;
    itensGastosTemporarios = [];
}

function salvarEdicao() {
    if (lancamentoEmEdicao === null) return;

    const item = dados.historico[lancamentoEmEdicao];
    item.faturamento = parseFloat(document.getElementById('edit-faturamento').value) || 0;
    item.rendaExtra = parseFloat(document.getElementById('edit-renda-extra').value) || 0;
    item.gasolina = parseFloat(document.getElementById('edit-gasolina').value) || 0;
    item.pessoal = parseFloat(document.getElementById('edit-pessoal').value) || 0;
    item.reservaFinanceira = parseFloat(document.getElementById('edit-reserva-financeira').value) || 0;
    item.investimento = parseFloat(document.getElementById('edit-investimento').value) || 0;
    item.detalhesGastos = [...itensGastosTemporarios];

    salvarDados();
    atualizarUI();
    fecharModal();
}

function deletarLancamento() {
    if (lancamentoEmEdicao === null) return;
    if (confirm('Deseja realmente apagar este lançamento do histórico?')) {
        dados.historico.splice(lancamentoEmEdicao, 1);
        salvarDados();
        atualizarUI();
        fecharModal();
    }
}

// EXPOSITORES PARA O ESCOPO GLOBAL
window.atualizarUI = atualizarUI;
window.renderizarHistorico = renderizarHistorico;
window.renderizarListaGastos = renderizarListaGastos;
window.abrirModalEdicao = abrirModalEdicao;
window.fecharModal = fecharModal;
window.salvarEdicao = salvarEdicao;
window.deletarLancamento = deletarLancamento;
