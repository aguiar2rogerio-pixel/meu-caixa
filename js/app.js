// ===== MEU CAIXA — LÓGICA PRINCIPAL =====

let dados = JSON.parse(localStorage.getItem('meu_caixa_data')) || JSON.parse(localStorage.getItem('financeiro_pro')) || {
    saldoAcumulado: 0,
    historico: [],
    mesesAnteriores: [],
    transferenciasReserva: 0,
    transferenciasPoupanca: 0
};

let itensGastosTemporarios = JSON.parse(localStorage.getItem('rascunho_gastos_dia')) || [];
let lancamentoEmEdicao = null;
let origemTransferenciaAtual = null;

// FORMATAÇÃO DE MOEDA
function formatarMoeda(valor) {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// DATA DE HOJE — HORÁRIO BRASÍLIA
function obterDataHoje() {
    return new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        timeZone: 'America/Sao_Paulo' 
    });
}

// VERIFICA SE JÁ FOI LANÇADO HOJE
function verificarTravaDiaria() {
    const hoje = obterDataHoje();
    const jaLancado = dados.historico.some(item => item.data === hoje);
    const btnSalvar = document.getElementById('btn-salvar-principal');
    const btnDetalhar = document.getElementById('btn-detalhar');

    if (!btnSalvar || !btnDetalhar) return;

    if (jaLancado) {
        btnSalvar.innerText = `⚠️ ${hoje} JÁ LANÇADO (USE O AJUSTAR)`;
        btnSalvar.className = "w-full bg-yellow-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed";
        btnSalvar.disabled = true;
        btnDetalhar.disabled = true;
        btnDetalhar.classList.remove('bg-red-950', 'hover:bg-red-900', 'border-red-600');
        btnDetalhar.classList.add('bg-gray-950', 'text-gray-600', 'border-gray-800', 'cursor-not-allowed');
        
        ['faturamento', 'renda-extra', 'gasolina', 'reserva-financeira', 'investimento'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = true;
                el.className = "input-bloqueado";
            }
        });
    } else {
        btnSalvar.innerText = "Salvar e Fechar o Dia";
        btnSalvar.className = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-md";
        btnSalvar.disabled = false;
        btnDetalhar.disabled = false;
        btnDetalhar.classList.remove('bg-gray-950', 'text-gray-600', 'border-gray-800', 'cursor-not-allowed');
        btnDetalhar.classList.add('bg-red-950', 'hover:bg-red-900', 'border-red-600');
        
        ['faturamento', 'renda-extra', 'gasolina', 'reserva-financeira', 'investimento'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = false;
                el.className = "input-autonomo";
            }
        });
    }
}

// RASCUNHO DOS CAMPOS — SALVA DIGITAÇÃO
function salvarRascunhoCampos() {
    if (lancamentoEmEdicao !== null) return;
    const rascunho = {
        faturamento: document.getElementById('faturamento')?.value || '',
        rendaExtra: document.getElementById('renda-extra')?.value || '',
        gasolina: document.getElementById('gasolina')?.value || '',
        reservaFinanceira: document.getElementById('reserva-financeira')?.value || '',
        investimento: document.getElementById('investimento')?.value || ''
    };
    localStorage.setItem('rascunho_campos_dia', JSON.stringify(rascunho));
}

function carregarRascunhoCampos() {
    const rascunho = JSON.parse(localStorage.getItem('rascunho_campos_dia'));
    if (rascunho && lancamentoEmEdicao === null) {
        if (document.getElementById('faturamento')) document.getElementById('faturamento').value = rascunho.faturamento || '';
        if (document.getElementById('renda-extra')) document.getElementById('renda-extra').value = rascunho.rendaExtra || '';
        if (document.getElementById('gasolina')) document.getElementById('gasolina').value = rascunho.gasolina || '';
        if (document.getElementById('reserva-financeira')) document.getElementById('reserva-financeira').value = rascunho.reservaFinanceira || '';
        if (document.getElementById('investimento')) document.getElementById('investimento').value = rascunho.investimento || '';
    }
}

// MODAL SALVAMENTO DO DIA
function solicitarConfirmacaoSalvamento() {
    const faturamento = parseFloat(document.getElementById('faturamento').value) || 0;
    const rendaExtra = parseFloat(document.getElementById('renda-extra').value) || 0;
    const gasolina = parseFloat(document.getElementById('gasolina').value) || 0;
    const pessoal = parseFloat(document.getElementById('pessoal').value.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
    const reservaFinanceira = parseFloat(document.getElementById('reserva-financeira').value) || 0;
    const investimento = parseFloat(document.getElementById('investimento').value) || 0;

    if (faturamento === 0 && rendaExtra === 0 && gasolina === 0 && pessoal === 0 && reservaFinanceira === 0 && investimento === 0) {
        alert("Por favor, preencha ao menos um valor para salvar o dia.");
        return;
    }

    const modal = document.getElementById('modal-confirmar-dia');
    if (modal) modal.classList.add('active');
}

function fecharModalConfirmacaoDia() {
    const modal = document.getElementById('modal-confirmar-dia');
    if (modal) modal.classList.remove('active');
}

function executarSalvarLancamento() {
    const faturamento = parseFloat(document.getElementById('faturamento').value) || 0;
    const rendaExtra = parseFloat(document.getElementById('renda-extra').value) || 0;
    const gasolina = parseFloat(document.getElementById('gasolina').value) || 0;
    const pessoal = parseFloat(document.getElementById('pessoal').value.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
    const reservaFinanceira = parseFloat(document.getElementById('reserva-financeira').value) || 0;
    const investimento = parseFloat(document.getElementById('investimento').value) || 0;

    const dataHoje = obterDataHoje();
    const novoLancamento = {
        id: Date.now(),
        data: dataHoje,
        faturamento,
        rendaExtra,
        gasolina,
        pessoal,
        reservaFinanceira,
        investimento,
        detalhesGastos: [...itensGastosTemporarios]
    };

    dados.historico.unshift(novoLancamento);
    
    // Limpa rascunhos do dia
    itensGastosTemporarios = [];
    localStorage.removeItem('rascunho_gastos_dia');
    localStorage.removeItem('rascunho_campos_dia');

    // Limpa campos da tela
    ['faturamento', 'renda-extra', 'gasolina', 'reserva-financeira', 'investimento', 'pessoal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    if (typeof salvarDados === 'function') salvarDados();
    if (typeof atualizarUI === 'function') atualizarUI();

    fecharModalConfirmacaoDia();
}

// PLANILHA DE GASTOS
function abrirSubjanelaGastos() {
    const modal = document.getElementById('subjanela-gastos');
    if (modal) modal.classList.add('active');
    if (typeof renderizarListaGastos === 'function') renderizarListaGastos();
}

function fecharSubjanelaGastos() {
    const modal = document.getElementById('subjanela-gastos');
    if (modal) modal.classList.remove('active');
}

function adicionarItemNaLista() {
    const descEl = document.getElementById('gasto-item-desc');
    const valEl = document.getElementById('gasto-item-val');
    
    const desc = descEl?.value.trim() || 'Gasto sem nome';
    const val = parseFloat(valEl?.value) || 0;

    if (val <= 0) {
        alert("Digite um valor válido maior que zero.");
        return;
    }

    itensGastosTemporarios.push({ desc, val });

    if (lancamentoEmEdicao === null) {
        localStorage.setItem('rascunho_gastos_dia', JSON.stringify(itensGastosTemporarios));
    }

    if (descEl) descEl.value = '';
    if (valEl) valEl.value = '';

    if (typeof renderizarListaGastos === 'function') renderizarListaGastos();
}

function removerItemGasto(index) {
    itensGastosTemporarios.splice(index, 1);
    
    if (lancamentoEmEdicao === null) {
        localStorage.setItem('rascunho_gastos_dia', JSON.stringify(itensGastosTemporarios));
    }

    if (typeof renderizarListaGastos === 'function') renderizarListaGastos();
}

function confirmarSubjanelaGastos() {
    const total = itensGastosTemporarios.reduce((acc, curr) => acc + curr.val, 0);
    
    if (lancamentoEmEdicao !== null) {
        const campoPessoalEdit = document.getElementById('edit-pessoal');
        if (campoPessoalEdit) campoPessoalEdit.value = total;
    } else {
        const campoPessoal = document.getElementById('pessoal');
        if (campoPessoal) campoPessoal.value = formatarMoeda(total);
        salvarRascunhoCampos();
    }
    
    fecharSubjanelaGastos();
}

// RESGATES DA POUPANÇA E RESERVA (MODAL)
function abrirModalTransferencia(origem) {
    origemTransferenciaAtual = origem;
    const modal = document.getElementById('modal-transferencia');
    const titulo = document.getElementById('transf-titulo');
    const instrucao = document.getElementById('transf-instrucao');
    const valorInput = document.getElementById('transf-valor');

    if (valorInput) valorInput.value = '';

    if (origem === 'emergencia') {
        if (titulo) titulo.innerText = "Resgatar Fundo Emergência";
        if (instrucao) instrucao.innerText = "Informe quanto deseja retirar do Fundo de Emergência para transferir de volta ao Caixa Disponível.";
    } else {
        if (titulo) titulo.innerText = "Resgatar Poupança";
        if (instrucao) instrucao.innerText = "Informe quanto deseja retirar da Poupança para transferir de volta ao Caixa Disponível.";
    }

    if (modal) modal.classList.add('active');
}

function fecharModalTransferencia() {
    const modal = document.getElementById('modal-transferencia');
    if (modal) modal.classList.remove('active');
    origemTransferenciaAtual = null;
}

function confirmarTransferencia() {
    const valorInput = document.getElementById('transf-valor');
    const valor = parseFloat(valorInput ? valorInput.value : 0) || 0;

    if (valor <= 0) {
        alert("Por favor, digite um valor válido.");
        return;
    }

    if (origemTransferenciaAtual === 'emergencia') {
        dados.transferenciasReserva = (dados.transferenciasReserva || 0) + valor;
    } else if (origemTransferenciaAtual === 'poupanca') {
        dados.transferenciasPoupanca = (dados.transferenciasPoupanca || 0) + valor;
    }

    if (typeof salvarDados === 'function') salvarDados();
    if (typeof atualizarUI === 'function') atualizarUI();

    fecharModalTransferencia();
}

// FECHAMENTO MENSAL
function fecharBalançoMensal() {
    if (dados.historico.length === 0) {
        alert("Não existem lançamentos no histórico para fechar o mês.");
        return;
    }

    if (confirm("Deseja fechar o balanço do mês atual e arquivá-lo? O histórico de dias será resetado para o novo mês.")) {
        let faturamentoTotal = 0;
        let rendaExtraTotal = 0;
        let gasolinaTotal = 0;
        let pessoalTotal = 0;
        let reservaTotal = 0;
        let investimentoTotal = 0;

        dados.historico.forEach(item => {
            faturamentoTotal += item.faturamento || 0;
            rendaExtraTotal += item.rendaExtra || 0;
            gasolinaTotal += item.gasolina || 0;
            pessoalTotal += item.pessoal || 0;
            reservaTotal += item.reservaFinanceira || 0;
            investimentoTotal += item.investimento || 0;
        });

        const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        if (!dados.mesesAnteriores) dados.mesesAnteriores = [];

        dados.mesesAnteriores.unshift({
            mes: mesAtual,
            faturamento: faturamentoTotal,
            rendaExtra: rendaExtraTotal,
            gasolina: gasolinaTotal,
            pessoal: pessoalTotal,
            reserva: reservaTotal,
            investimento: investimentoTotal,
            saldo: (faturamentoTotal + rendaExtraTotal) - (gasolinaTotal + pessoalTotal)
        });

        // Limpa lançamentos diários para iniciar o novo mês
        dados.historico = [];

        if (typeof salvarDados === 'function') salvarDados();
        if (typeof atualizarUI === 'function') atualizarUI();

        alert(`✅ Balanço de ${mesAtual} arquivado com sucesso!`);
    }
}

// EXPOSITORES GLOBAIS
window.formatarMoeda = formatarMoeda;
window.obterDataHoje = obterDataHoje;
window.verificarTravaDiaria = verificarTravaDiaria;
window.salvarRascunhoCampos = salvarRascunhoCampos;
window.carregarRascunhoCampos = carregarRascunhoCampos;
window.solicitarConfirmacaoSalvamento = solicitarConfirmacaoSalvamento;
window.fecharModalConfirmacaoDia = fecharModalConfirmacaoDia;
window.executarSalvarLancamento = executarSalvarLancamento;
window.abrirSubjanelaGastos = abrirSubjanelaGastos;
window.fecharSubjanelaGastos = fecharSubjanelaGastos;
window.adicionarItemNaLista = adicionarItemNaLista;
window.removerItemGasto = removerItemGasto;
window.confirmarSubjanelaGastos = confirmarSubjanelaGastos;
window.abrirModalTransferencia = abrirModalTransferencia;
window.fecharModalTransferencia = fecharModalTransferencia;
window.confirmarTransferencia = confirmarTransferencia;
window.fecharBalançoMensal = fecharBalançoMensal;
