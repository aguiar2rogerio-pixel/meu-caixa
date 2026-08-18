// SALVAR DADOS NO LOCALSTORAGE
function salvarDados() {
    if (typeof normalizarDados === 'function') dados = normalizarDados(dados);
    localStorage.setItem('meu_caixa_data', JSON.stringify(dados));
}

// SALVAR RASCUNHO DE GASTOS
function salvarRascunhoGastos() {
    if (lancamentoEmEdicao === null) {
        if (typeof normalizarListaGastos === 'function') itensGastosTemporarios = normalizarListaGastos(itensGastosTemporarios);
        localStorage.setItem('rascunho_gastos_dia', JSON.stringify(itensGastosTemporarios));
    }
}

// ZERAR TUDO
function limparDados() {
    if (confirm('Deseja apagar todo o banco de dados do aplicativo?')) {
        dados = { saldoAcumulado: 0, historico: [], mesesAnteriores: [], transferenciasReserva: 0, transferenciasPoupanca: 0 };
        salvarDados();
        localStorage.removeItem('rascunho_gastos_dia');
        localStorage.removeItem('rascunho_campos_dia');
        itensGastosTemporarios = [];
        atualizarUI();
    }
}

function lerEstadoTesteParaBackup() {
    try {
        const estado = JSON.parse(localStorage.getItem('meuCaixa_estadoTeste') || 'null');
        if (!estado || typeof estado !== 'object') return null;
        return {
            iniciadoEm: typeof estado.iniciadoEm === 'string' ? estado.iniciadoEm : null,
            fechamentosUsados: Math.max(0, Number(estado.fechamentosUsados) || 0)
        };
    } catch (erro) {
        return null;
    }
}

function dataMaisAntiga(dataA, dataB) {
    const timestampA = dataA ? new Date(dataA).getTime() : NaN;
    const timestampB = dataB ? new Date(dataB).getTime() : NaN;
    if (!Number.isFinite(timestampA)) return Number.isFinite(timestampB) ? dataB : null;
    if (!Number.isFinite(timestampB)) return dataA;
    return timestampA <= timestampB ? dataA : dataB;
}

function preservarEstadoTesteRestaurado(estadoBackup) {
    if (!estadoBackup || typeof estadoBackup !== 'object') return;

    let estadoAtual = null;
    try {
        estadoAtual = JSON.parse(localStorage.getItem('meuCaixa_estadoTeste') || 'null');
    } catch (erro) {
        estadoAtual = null;
    }

    const estadoConsolidado = {
        // A data mais antiga impede que um backup antigo prorrogue o teste.
        iniciadoEm: dataMaisAntiga(estadoAtual?.iniciadoEm, estadoBackup.iniciadoEm),
        // O maior contador impede que um backup antigo devolva fechamentos usados.
        fechamentosUsados: Math.max(
            0,
            Number(estadoAtual?.fechamentosUsados) || 0,
            Number(estadoBackup.fechamentosUsados) || 0
        )
    };

    if (estadoConsolidado.iniciadoEm) {
        localStorage.setItem('meuCaixa_estadoTeste', JSON.stringify(estadoConsolidado));
    }
}

// EXPORTAR BACKUP
function exportarBackup() {
    const backup = {
        ...dados,
        _meuCaixa: {
            versaoBackup: 2,
            estadoTeste: lerEstadoTesteParaBackup()
        }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `backup_meucaixa_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
}

// IMPORTAR BACKUP
function importarBackup(event) {
    const input = event.target;
    const reader = new FileReader();
    reader.onload = function() {
        try {
            const dadosImportados = JSON.parse(reader.result);
            if (dadosImportados && Array.isArray(dadosImportados.historico)) {
                const estadoTesteBackup = dadosImportados._meuCaixa?.estadoTeste || null;
                dados = typeof normalizarDados === 'function' ? normalizarDados(dadosImportados) : dadosImportados;
                salvarDados();
                preservarEstadoTesteRestaurado(estadoTesteBackup);
                atualizarUI();
                if (typeof verificarStatusPremium === 'function') verificarStatusPremium();
                alert('Backup restaurado com sucesso. O período de teste e os fechamentos utilizados também foram preservados.');
            } else {
                alert('Arquivo de backup inválido.');
            }
        } catch (e) {
            alert('Erro ao ler o arquivo de backup.');
        }
        input.value = '';
    };
    if (input.files.length > 0) reader.readAsText(input.files[0]);
}

// EXPOSITORES GLOBAIS
window.salvarDados = salvarDados;
window.salvarRascunhoGastos = salvarRascunhoGastos;
window.limparDados = limparDados;
window.exportarBackup = exportarBackup;
window.importarBackup = importarBackup;
window.preservarEstadoTesteRestaurado = preservarEstadoTesteRestaurado;
