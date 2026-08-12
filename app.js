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

    if (jaLancado) {
        btnSalvar.innerText = `⚠️ ${hoje} JÁ LANÇADO (USE O AJUSTAR)`;
        btnSalvar.className = "w-full bg-yellow-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed";
        btnSalvar.disabled = true;
        btnDetalhar.disabled = true;
        btnDetalhar.classList.remove('bg-red-950', 'hover:bg-red-900', 'border-red-600');
        btnDetalhar.classList.add('bg-gray-950', 'text-gray-600', 'border-gray-800', 'cursor-not-allowed');
        
        ['faturamento', 'renda-extra', 'gasolina', 'reserva-financeira', 'investimento'].forEach(id => {
            document.getElementById(id).disabled = true;
            document.getElementById(id).className = "input-bloqueado";
        });
    } else {
        btnSalvar.innerText = "Salvar e Fechar o Dia";
        btnSalvar.className = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-md";
        btnSalvar.disabled = false;
        btnDetalhar.disabled = false;
        btnDetalhar.classList.remove('bg-gray-950', 'text-gray-600', 'border-gray-800', 'cursor-not-allowed');
        btnDetalhar.classList.add('bg-red-950', 'hover:bg-red-900', 'border-red-600');
        
        ['faturamento', 'renda-extra', 'gasolina', 'reserva-financeira', 'investimento'].forEach(id => {
            document.getElementById(id).disabled = false;
            document.getElementById(id).className = "input-autonomo";
        });
    }
}

// RASCUNHO DOS CAMPOS — SALVA DIGITAÇÃO
function salvarRascunhoCampos() {
    if (lancamentoEmEdicao !== null) return;
    const rascunho = {
        faturamento: document.getElementById('faturamento').value,
        rendaExtra: document.getElementById('renda-extra').value,
        gasolina: document.getElementById('gasolina').value,
        reservaFinanceira: document.getElementById('reserva-financeira').value,
        investimento: document.getElementById('investimento').value
    };
    localStorage.setItem('rascunho_campos_dia', JSON.stringify(rascunho));
}

function carregarRascunhoCampos() {
    const rascunho = JSON.parse(localStorage.getItem('rascunho_campos_dia'));
    if (rascunho) {
        document.getElementById('faturamento').value = rascunho.faturamento || '';
        document.getElementById('renda-extra').value = rascunho.rendaExtra || '';
        document.getElementById('gasolina').value = rascunho.gasolina || '';
        document.getElementById('reserva-financeira').value = rascunho.reservaFinanceira || '';
        document.getElementById('investimento').value = rascunho.investimento || '';
    }
}
