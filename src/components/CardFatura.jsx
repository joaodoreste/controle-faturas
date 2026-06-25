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
import { calcularValorPagoGasto } from "../utils/pagamentos";

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

    const totalPago = gastos.reduce(
        (total, gasto) => total + calcularValorPagoGasto(gasto),
        0
    );

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

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                        mt: 1
                    }}
                >
                    <Box>
                        <Typography color="text.secondary">Valor total</Typography>
                        <Typography fontWeight="bold">
                            R$ {fatura.valorTotal.toFixed(2)}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography color="text.secondary">Me devem</Typography>
                        <Typography fontWeight="bold">
                            R$ {totalQueDevem.toFixed(2)}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography color="text.secondary">Já recebi</Typography>
                        <Typography fontWeight="bold">
                            R$ {totalPago.toFixed(2)}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography color="text.secondary">Falta receber</Typography>
                        <Typography fontWeight="bold" color="warning.main">
                            R$ {totalPendente.toFixed(2)}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography color="text.secondary">Minha parte</Typography>
                        <Typography fontWeight="bold">
                            R$ {minhaParte.toFixed(2)}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography color="text.secondary">Falta eu pagar</Typography>
                        <Typography fontWeight="bold" color="warning.main">
                            R$ {faltaEuPagar.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

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
