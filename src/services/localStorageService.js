const FATURAS_KEY = "controle_faturas";
const GASTOS_KEY = "controle_gastos";

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