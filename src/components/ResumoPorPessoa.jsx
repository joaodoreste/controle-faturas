import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip
} from "@mui/material";

function ResumoPorPessoa({ gastos }) {
    const gastosDeOutrasPessoas = gastos.filter(
        gasto => gasto.devedor.trim().toLowerCase() !== "eu"
    );

    const pessoas = gastosDeOutrasPessoas.reduce((acc, gasto) => {
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
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Resumo por Pessoa
            </Typography>

            {nomes.map(nome => {
                const gastosDaPessoa = pessoas[nome];

                const total = gastosDaPessoa.reduce(
                    (soma, gasto) => soma + gasto.valor,
                    0
                );

                const totalPago = gastosDaPessoa
                    .filter(gasto => gasto.pago)
                    .reduce((soma, gasto) => soma + gasto.valor, 0);

                const totalPendente = total - totalPago;

                return (
                    <Card key={nome} sx={{ mb: 2, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold">
                                {nome}
                            </Typography>

                            {gastosDaPessoa.map(gasto => (
                                <Box
                                    key={gasto.id}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        mt: 1
                                    }}
                                >
                                    <Typography>
                                        {gasto.descricao}
                                    </Typography>

                                    <Typography>
                                        R$ {gasto.valor.toFixed(2)}
                                    </Typography>

                                    <Chip
                                        label={gasto.pago ? "Pago" : "Pendente"}
                                        color={gasto.pago ? "success" : "warning"}
                                        size="small"
                                    />
                                </Box>
                            ))}

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