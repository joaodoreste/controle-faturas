import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography
} from "@mui/material";
import {
    buscarGastos,
    buscarPagamentosMinhaParte
} from "../services/localStorageService";

function CardFatura({
                        fatura,
                        onEditar,
                        onExcluir,
                        onSubir,
                        onDescer,
                        podeSubir,
                        podeDescer
                    }) {
    const navigate = useNavigate();

    const gastos = buscarGastos().filter(
        gasto => String(gasto.faturaId) === String(fatura.id)
    );

    const pagamentosMinhaParte = buscarPagamentosMinhaParte().filter(
        pagamento => String(pagamento.faturaId) === String(fatura.id)
    );

    const totalQueDevem = gastos.reduce(
        (total, gasto) => total + gasto.valor,
        0
    );

    const totalPago = gastos
        .filter(gasto => gasto.pago)
        .reduce((total, gasto) => total + gasto.valor, 0);

    const totalPendente = totalQueDevem - totalPago;
    const minhaParte = fatura.valorTotal - totalQueDevem;

    const totalPagoPorMim = pagamentosMinhaParte.reduce(
        (total, pagamento) => total + Number(pagamento.valor || 0),
        0
    );

    const faltaEuPagar = Math.max(minhaParte - totalPagoPorMim, 0);

    return (
        <Card
            onClick={() => navigate(`/fatura/${fatura.id}`)}
            sx={{
                mb: 2,
                borderRadius: 3,
                cursor: "pointer"
            }}
        >
            <CardContent>
                <Typography variant="h6" fontWeight="bold">
                    {fatura.mes}/{fatura.ano}
                </Typography>

                <Typography>
                    Valor Total: R$ {fatura.valorTotal.toFixed(2)}
                </Typography>

                <Typography>
                    Me devem: R$ {totalQueDevem.toFixed(2)}
                </Typography>

                <Typography>
                    Ja recebi: R$ {totalPago.toFixed(2)}
                </Typography>

                <Typography>
                    Falta receber: R$ {totalPendente.toFixed(2)}
                </Typography>

                <Typography fontWeight="bold">
                    Minha parte: R$ {minhaParte.toFixed(2)}
                </Typography>

                <Typography>
                    Ja paguei: R$ {totalPagoPorMim.toFixed(2)}
                </Typography>

                <Typography fontWeight="bold" color="warning.main">
                    Falta eu pagar: R$ {faltaEuPagar.toFixed(2)}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={!podeSubir}
                        onClick={(event) => {
                            event.stopPropagation();
                            onSubir();
                        }}
                    >
                        Subir
                    </Button>

                    <Button
                        variant="outlined"
                        size="small"
                        disabled={!podeDescer}
                        onClick={(event) => {
                            event.stopPropagation();
                            onDescer();
                        }}
                    >
                        Descer
                    </Button>

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEditar(fatura);
                        }}
                    >
                        Editar
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={(event) => {
                            event.stopPropagation();
                            onExcluir(fatura);
                        }}
                    >
                        Excluir
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

export default CardFatura;
