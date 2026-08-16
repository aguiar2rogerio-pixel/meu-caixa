// ===== MEU CAIXA — LÓGICA PRINCIPAL =====

function lerJsonSeguro(texto, fallback) {
    try {
        return texto ? JSON.parse(texto) : fallback;
    } catch (erro) {
        return fallback;
    }
}

function normalizarNumero(valor) {
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;
    if (valor === null || valor === undefined || valor === '') return 0;
    let texto = String(valor).trim().replace(/R\$/gi, '').replace(/\s/g, '');
    if (texto.includes(',') && texto.includes('.')) texto = texto.replace(/\./g, '').replace(',', '.');
    else texto = texto.replace(',', '.');
    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : 0;
}

function normalizarItemGasto(item) {
    const origem = item && typeof item === 'object' ? item : {};
    const desc = origem.desc ?? origem.descricao ?? origem.description ?? 'Gasto sem nome';
    const val = normalizarNumero(origem.val ?? origem.valor ?? origem.value);
    return { desc: String(desc || 'Gasto sem nome').trim() || 'Gasto sem nome', val };
}

function normalizarListaGastos(lista) {
    if (!Array.isArray(lista)) return [];
    return lista.map(normalizarItemGasto).filter(item => item.val > 0);
}

function normalizarLancamento(item) {
    const origem = item && typeof item === 'object' ? item : {};
    const pessoal = normalizarNumero(origem.pessoal);
    const detalhes = normalizarListaGastos(origem.detalhesGastos);
    return {
        ...origem,
        faturamento: normalizarNumero(origem.faturamento),
        rendaExtra: normalizarNumero(origem.rendaExtra),
        gasolina: normalizarNumero(origem.gasolina),
        pessoal: detalhes.length ? detalhes.reduce((soma, gasto) => soma + gasto.val, 0) : pessoal,
        reservaFinanceira: normalizarNumero(origem.reservaFinanceira),
        investimento: normalizarNumero(origem.investimento),
        detalhesGastos: detalhes.length ? detalhes : (pessoal > 0 ? [{ desc: 'Gastos do Dia', val: pessoal }] : [])
    };
}

function normalizarDados(valor) {
    const origem = valor && typeof valor === 'object' ? valor : {};
    const historico = Array.isArray(origem.historico) ? origem.historico.map(normalizarLancamento) : [];
    const mesesAnteriores = Array.isArray(origem.mesesAnteriores) ? origem.mesesAnteriores.map(mes => ({
        ...mes,
        historico: Array.isArray(mes.historico) ? mes.historico.map(normalizarLancamento) : [],
        resumo: mes.resumo ? {
            faturamento: normalizarNumero(mes.resumo.faturamento),
            rendaExtra: normalizarNumero(mes.resumo.rendaExtra),
            gasolina: normalizarNumero(mes.resumo.gasolina),
            pessoal: normalizarNumero(mes.resumo.pessoal),
            reservaFinanceira: normalizarNumero(mes.resumo.reservaFinanceira),
            investimento: normalizarNumero(mes.resumo.investimento)
        } : null
    })) : [];
    return {
        ...origem,
        saldoAcumulado: normalizarNumero(origem.saldoAcumulado),
        historico,
        mesesAnteriores,
        transferenciasReserva: normalizarNumero(origem.transferenciasReserva),
        transferenciasPoupanca: normalizarNumero(origem.transferenciasPoupanca)
    };
}

const dadosSalvos = localStorage.getItem('meu_caixa_data') || localStorage.getItem('financeiro_pro');
let dados = normalizarDados(lerJsonSeguro(dadosSalvos, null));
let itensGastosTemporarios = normalizarListaGastos(lerJsonSeguro(localStorage.getItem('rascunho_gastos_dia'), []));
let lancamentoEmEdicao = null;
let origemTransferenciaAtual = null;

// Migra silenciosamente os formatos antigos para o modelo atual.
localStorage.setItem('meu_caixa_data', JSON.stringify(dados));
localStorage.setItem('rascunho_gastos_dia', JSON.stringify(itensGastosTemporarios));

// FORMATAÇÃO DE MOEDA
function formatarMoeda(valor) {
    return normalizarNumero(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function obterTotalRascunhoGastos() {
    return normalizarListaGastos(itensGastosTemporarios).reduce((total, item) => total + item.val, 0);
}

function sincronizarCampoPessoalComRascunho() {
    if (lancamentoEmEdicao !== null) return;
    const campo = document.getElementById('pessoal');
    if (campo) campo.value = formatarMoeda(obterTotalRascunhoGastos());
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
    try {
        const rascunho = JSON.parse(localStorage.getItem('rascunho_campos_dia') || 'null');
        if (rascunho) {
            if (document.getElementById('faturamento')) document.getElementById('faturamento').value = rascunho.faturamento || '';
            if (document.getElementById('renda-extra')) document.getElementById('renda-extra').value = rascunho.rendaExtra || '';
            if (document.getElementById('gasolina')) document.getElementById('gasolina').value = rascunho.gasolina || '';
            if (document.getElementById('reserva-financeira')) document.getElementById('reserva-financeira').value = rascunho.reservaFinanceira || '';
            if (document.getElementById('investimento')) document.getElementById('investimento').value = rascunho.investimento || '';
        }
    } catch (erro) {
        localStorage.removeItem('rascunho_campos_dia');
    }
    itensGastosTemporarios = normalizarListaGastos(lerJsonSeguro(localStorage.getItem('rascunho_gastos_dia'), []));
    localStorage.setItem('rascunho_gastos_dia', JSON.stringify(itensGastosTemporarios));
    sincronizarCampoPessoalComRascunho();
}

// MODAL SALVAMENTO DO DIA
function solicitarConfirmacaoSalvamento() {
    if (typeof podeSalvarNovoLancamento === 'function' && !podeSalvarNovoLancamento()) {
        alert('Seu período de teste terminou. Libere o acesso completo para continuar lançando novos dias.');
        if (typeof verificarStatusPremium === 'function') verificarStatusPremium();
        return;
    }

    const faturamento = normalizarNumero(document.getElementById('faturamento').value);
    const rendaExtra = normalizarNumero(document.getElementById('renda-extra').value);
    const gasolina = normalizarNumero(document.getElementById('gasolina').value);
    const pessoal = obterTotalRascunhoGastos();
    const reservaFinanceira = normalizarNumero(document.getElementById('reserva-financeira').value);
    const investimento = normalizarNumero(document.getElementById('investimento').value);

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
    const faturamento = normalizarNumero(document.getElementById('faturamento').value);
    const rendaExtra = normalizarNumero(document.getElementById('renda-extra').value);
    const gasolina = normalizarNumero(document.getElementById('gasolina').value);
    const pessoal = obterTotalRascunhoGastos();
    const reservaFinanceira = normalizarNumero(document.getElementById('reserva-financeira').value);
    const investimento = normalizarNumero(document.getElementById('investimento').value);

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
    if (typeof registrarFechamentoTeste === 'function') registrarFechamentoTeste();
    
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
    if (lancamentoEmEdicao === null) {
        itensGastosTemporarios = normalizarListaGastos(lerJsonSeguro(localStorage.getItem('rascunho_gastos_dia'), []));
        sincronizarCampoPessoalComRascunho();
    }
    const modal = document.getElementById('subjanela-gastos');
    if (modal) modal.classList.add('active');
    if (typeof renderizarListaGastos === 'function') renderizarListaGastos();
}

function fecharSubjanelaGastos() {
    if (lancamentoEmEdicao === null) {
        localStorage.setItem('rascunho_gastos_dia', JSON.stringify(normalizarListaGastos(itensGastosTemporarios)));
        sincronizarCampoPessoalComRascunho();
    }
    const modal = document.getElementById('subjanela-gastos');
    if (modal) modal.classList.remove('active');
}

function adicionarItemNaLista() {
    const descEl = document.getElementById('gasto-item-desc');
    const valEl = document.getElementById('gasto-item-val');
    
    const desc = descEl?.value.trim() || 'Gasto sem nome';
    const val = normalizarNumero(valEl?.value);

    if (val <= 0) {
        alert("Digite um valor válido maior que zero.");
        return;
    }

    itensGastosTemporarios = normalizarListaGastos(itensGastosTemporarios);
    itensGastosTemporarios.push({ desc, val });
    localStorage.setItem('rascunho_gastos_dia', JSON.stringify(itensGastosTemporarios));

    if (descEl) descEl.value = '';
    if (valEl) valEl.value = '';
    sincronizarCampoPessoalComRascunho();

    if (typeof renderizarListaGastos === 'function') renderizarListaGastos();
}

function removerItemGasto(index) {
    itensGastosTemporarios.splice(index, 1);
    itensGastosTemporarios = normalizarListaGastos(itensGastosTemporarios);
    localStorage.setItem('rascunho_gastos_dia', JSON.stringify(itensGastosTemporarios));
    sincronizarCampoPessoalComRascunho();
    if (typeof renderizarListaGastos === 'function') renderizarListaGastos();
}

function confirmarSubjanelaGastos() {
    itensGastosTemporarios = normalizarListaGastos(itensGastosTemporarios);
    const total = obterTotalRascunhoGastos();
    const idCampo = lancamentoEmEdicao !== null ? 'edit-pessoal' : 'pessoal';
    const campoPessoal = document.getElementById(idCampo);

    if (campoPessoal) campoPessoal.value = lancamentoEmEdicao !== null ? total : formatarMoeda(total);
    if (lancamentoEmEdicao === null) {
        localStorage.setItem('rascunho_gastos_dia', JSON.stringify(itensGastosTemporarios));
        sincronizarCampoPessoalComRascunho();
    }
    fecharSubjanelaGastos();
}

// TRANSFERÊNCIAS (RESGATE)
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
    const valor = normalizarNumero(document.getElementById('transf-valor')?.value);
    if (valor <= 0) {
        alert("Por favor, digite um valor válido.");
        return;
    }

    const resumoAtual = typeof resumirLancamentos === 'function' ? resumirLancamentos(dados.historico) : { reservaFinanceira: 0, investimento: 0 };
    const resumoArquivado = typeof resumoArquivos === 'function' ? resumoArquivos() : { reservaFinanceira: 0, investimento: 0 };
    const campoOrigem = origemTransferenciaAtual === 'emergencia' ? 'reservaFinanceira' : 'investimento';
    const campoTransferencia = origemTransferenciaAtual === 'emergencia' ? 'transferenciasReserva' : 'transferenciasPoupanca';
    const saldoDisponivel = (Number(resumoAtual[campoOrigem]) || 0) + (Number(resumoArquivado[campoOrigem]) || 0) - (Number(dados[campoTransferencia]) || 0);

    if (valor > saldoDisponivel + 0.005) {
        alert(`O valor do resgate não pode ser maior que o saldo disponível (${formatarMoeda(Math.max(0, saldoDisponivel))}).`);
        return;
    }

    dados[campoTransferencia] = (Number(dados[campoTransferencia]) || 0) + valor;
    if (typeof salvarDados === 'function') salvarDados();
    if (typeof atualizarUI === 'function') atualizarUI();
    fecharModalTransferencia();
}

// EXPOSITORES PARA ESCOPO GLOBAL (Para acionamento dos onclick do HTML)
window.lerJsonSeguro = lerJsonSeguro;
window.normalizarNumero = normalizarNumero;
window.normalizarItemGasto = normalizarItemGasto;
window.normalizarListaGastos = normalizarListaGastos;
window.normalizarDados = normalizarDados;
window.formatarMoeda = formatarMoeda;
window.obterTotalRascunhoGastos = obterTotalRascunhoGastos;
window.sincronizarCampoPessoalComRascunho = sincronizarCampoPessoalComRascunho;
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
