// ===== MEU CAIXA — SALVAMENTO E BACKUP =====

// SALVAR DADOS NO LOCALSTORAGE
function salvarDados() {
    localStorage.setItem('meu_caixa_data', JSON.stringify(dados));
}

// SALVAR RASCUNHO DE GASTOS
function salvarRascunhoGastos() {
    if (lancamentoEmEdicao === null) {
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

// EXPORTAR BACKUP
function exportarBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados));
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
                dados = dadosImportados; 
                salvarDados();
                atualizarUI(); 
                alert('Backup restaurado com sucesso.');
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
