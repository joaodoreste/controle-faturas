export const MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

export function normalizarTexto(texto) {
    return String(texto)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function obterIndiceMes(mes) {
    return MESES.findIndex(
        item => normalizarTexto(item) === normalizarTexto(mes)
    );
}

export function obterMesCanonico(mes) {
    const indice = obterIndiceMes(mes);

    return indice >= 0 ? MESES[indice] : mes;
}

export function ordenarPorMesAno(a, b) {
    if (Number(a.ano) !== Number(b.ano)) {
        return Number(a.ano) - Number(b.ano);
    }

    const indiceA = obterIndiceMes(a.mes);
    const indiceB = obterIndiceMes(b.mes);

    return (indiceA === -1 ? 99 : indiceA) - (indiceB === -1 ? 99 : indiceB);
}
