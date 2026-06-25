import {
    Card,
    CardContent,
    Grid,
    Typography
} from "@mui/material";
import {
    buscarGastos,
    buscarPagamentosMinhaParte
} from "../services/localStorageService";
import { calcularValorPagoGasto } from "../utils/pagamentos";

function DashboardGeral({ faturas }) {
    const gastos = buscarGastos();
    const pagamentosMinhaParte = buscarPagamentosMinhaParte();

    const valorTotalFaturas = faturas.reduce(
        (total, fatura) => total + fatura.valorTotal,
        0
    );

    const totalQueDevem = gastos.reduce(
        (total, gasto) => total + gasto.valor,
        0
    );

    const totalRecebido = gastos.reduce(
        (total, gasto) => total + calcularValorPagoGasto(gasto),
        0
    );

    const totalPendente = totalQueDevem - totalRecebido;

    const minhaParte = valorTotalFaturas - totalQueDevem;

    const totalPagoPorMim = pagamentosMinhaParte.reduce(
        (total, pagamento) => total + Number(pagamento.valor || 0),
        0
    );

    const faltaEuPagar = Math.max(minhaParte - totalPagoPorMim, 0);

    return (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Resumo Geral
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Faturas
                        </Typography>
                        <Typography fontWeight="bold">
                            {faturas.length}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Valor Total
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {valorTotalFaturas.toFixed(2)}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Me devem
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {totalQueDevem.toFixed(2)}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Ja recebi
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {totalRecebido.toFixed(2)}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Pendente
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {totalPendente.toFixed(2)}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Minha parte
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {minhaParte.toFixed(2)}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Ja paguei
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {totalPagoPorMim.toFixed(2)}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Falta eu pagar
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {faltaEuPagar.toFixed(2)}
                        </Typography>
                    </Grid>

                </Grid>
            </CardContent>
        </Card>
    );
}

export default DashboardGeral;
