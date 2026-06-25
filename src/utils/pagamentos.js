export function obterPagamentosGasto(gasto) {
    return Array.isArray(gasto.pagamentos) ? gasto.pagamentos : [];
}

export function calcularValorPagoGasto(gasto) {
    const pagamentos = obterPagamentosGasto(gasto);

    if (pagamentos.length > 0) {
        return pagamentos.reduce(
            (total, pagamento) => total + Number(pagamento.valor || 0),
            0
        );
    }

    return gasto.pago ? Number(gasto.valor || 0) : 0;
}

export function calcularValorPendenteGasto(gasto) {
    return Math.max(Number(gasto.valor || 0) - calcularValorPagoGasto(gasto), 0);
}

export function obterStatusGasto(gasto) {
    const valorPago = calcularValorPagoGasto(gasto);
    const valor = Number(gasto.valor || 0);

    if (valorPago >= valor && valor > 0) {
        return {
            label: "Pago",
            color: "success"
        };
    }

    if (valorPago > 0) {
        return {
            label: "Parcial",
            color: "info"
        };
    }

    return {
        label: "Pendente",
        color: "warning"
    };
}
