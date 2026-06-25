import {
    Box,
    Card,
    CardContent,
    Chip,
    Typography
} from "@mui/material";
import {
    calcularValorPagoGasto,
    calcularValorPendenteGasto,
    obterStatusGasto
} from "../utils/pagamentos";

function ResumoPorPessoa({ gastos }) {
    const pessoas = gastos.reduce((acc, gasto) => {
        const nome = gasto.devedor.trim();

        if (!acc[nome]) {
            acc[nome] = [];
        }

        acc[nome].push(gasto);
        return acc;
    }, {});

    const nomes = Object.keys(pessoas);

    if (nomes.length === 0) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Resumo por Pessoa
            </Typography>

            {nomes.map(nome => {
                const gastosDaPessoa = pessoas[nome];
                const total = gastosDaPessoa.reduce(
                    (soma, gasto) => soma + Number(gasto.valor || 0),
                    0
                );
                const totalPago = gastosDaPessoa.reduce(
                    (soma, gasto) => soma + calcularValorPagoGasto(gasto),
                    0
                );
                const totalPendente = total - totalPago;

                return (
                    <Card key={nome} sx={{ mb: 2, borderRadius: 3 }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 1
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold">
                                    {nome}
                                </Typography>

                                <Chip
                                    label={totalPendente <= 0 ? "Pago" : totalPago > 0 ? "Parcial" : "Pendente"}
                                    color={totalPendente <= 0 ? "success" : totalPago > 0 ? "info" : "warning"}
                                    size="small"
                                />
                            </Box>

                            {gastosDaPessoa.map(gasto => {
                                const status = obterStatusGasto(gasto);

                                return (
                                    <Box
                                        key={gasto.id}
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr auto",
                                            gap: 1,
                                            mt: 1.5,
                                            alignItems: "center"
                                        }}
                                    >
                                        <Box>
                                            <Typography fontWeight="bold">
                                                {gasto.descricao}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Recebido: R$ {calcularValorPagoGasto(gasto).toFixed(2)} de R$ {Number(gasto.valor || 0).toFixed(2)}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Falta: R$ {calcularValorPendenteGasto(gasto).toFixed(2)}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            label={status.label}
                                            color={status.color}
                                            size="small"
                                        />
                                    </Box>
                                );
                            })}

                            <Box sx={{ mt: 2 }}>
                                <Typography fontWeight="bold">
                                    Total: R$ {total.toFixed(2)}
                                </Typography>

                                <Typography>
                                    Já pagou: R$ {totalPago.toFixed(2)}
                                </Typography>

                                <Typography>
                                    Falta pagar: R$ {totalPendente.toFixed(2)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );
}

export default ResumoPorPessoa;
