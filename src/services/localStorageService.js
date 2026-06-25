const FATURAS_KEY = "controle_faturas";
const GASTOS_KEY = "controle_gastos";
const PAGAMENTOS_MINHA_PARTE_KEY = "controle_pagamentos_minha_parte";
const PLANEJAMENTO_KEY = "controle_planejamento";

export function buscarFaturas() {
    const dados = localStorage.getItem(FATURAS_KEY);
    return dados ? JSON.parse(dados) : [];
}

export function salvarFaturas(faturas) {
    localStorage.setItem(FATURAS_KEY, JSON.stringify(faturas));
}

export function buscarGastos() {
    const dados = localStorage.getItem(GASTOS_KEY);
    return dados ? JSON.parse(dados) : [];
}

export function salvarGastos(gastos) {
    localStorage.setItem(GASTOS_KEY, JSON.stringify(gastos));
}

export function buscarPagamentosMinhaParte() {
    const dados = localStorage.getItem(PAGAMENTOS_MINHA_PARTE_KEY);
    return dados ? JSON.parse(dados) : [];
}

export function salvarPagamentosMinhaParte(pagamentos) {
    localStorage.setItem(PAGAMENTOS_MINHA_PARTE_KEY, JSON.stringify(pagamentos));
}

export function buscarPlanejamento() {
    const dados = localStorage.getItem(PLANEJAMENTO_KEY);

    return dados
        ? JSON.parse(dados)
        : {
            saldoAtual: 0,
            recebimentos: [],
            despesas: []
        };
}

export function salvarPlanejamento(planejamento) {
    localStorage.setItem(PLANEJAMENTO_KEY, JSON.stringify(planejamento));
}

export function excluirFatura(faturaId) {
    const faturas = buscarFaturas();

    const novasFaturas = faturas.filter(
        fatura => String(fatura.id) !== String(faturaId)
    );

    salvarFaturas(novasFaturas);
}

export function excluirGastosDaFatura(faturaId) {
    const gastos = buscarGastos();

    const novosGastos = gastos.filter(
        gasto => String(gasto.faturaId) !== String(faturaId)
    );

    salvarGastos(novosGastos);
}

export function excluirPagamentosMinhaParteDaFatura(faturaId) {
    const pagamentos = buscarPagamentosMinhaParte();

    const novosPagamentos = pagamentos.filter(
        pagamento => String(pagamento.faturaId) !== String(faturaId)
    );

    salvarPagamentosMinhaParte(novosPagamentos);
}

export function exportarBackup() {
    return {
        faturas: buscarFaturas(),
        gastos: buscarGastos(),
        pagamentosMinhaParte: buscarPagamentosMinhaParte(),
        planejamento: buscarPlanejamento(),
        exportadoEm: new Date().toISOString()
    };
}

export function importarBackup(backup) {
    if (!backup || !Array.isArray(backup.faturas) || !Array.isArray(backup.gastos)) {
        throw new Error("Backup inválido");
    }

    salvarFaturas(backup.faturas);
    salvarGastos(backup.gastos);
    salvarPagamentosMinhaParte(
        Array.isArray(backup.pagamentosMinhaParte)
            ? backup.pagamentosMinhaParte
            : []
    );
    salvarPlanejamento(
        backup.planejamento && typeof backup.planejamento === "object"
            ? backup.planejamento
            : {
                saldoAtual: 0,
                recebimentos: [],
                despesas: []
            }
    );
}
