import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box
} from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { buscarGastos } from "../services/localStorageService";

function DashboardGeral({ faturas }) {
    const gastos = buscarGastos();

    const valorTotalFaturas = faturas.reduce(
        (total, fatura) => total + fatura.valorTotal,
        0
    );

    const totalQueDevem = gastos
        .filter(gasto => gasto.devedor.trim().toLowerCase() !== "eu")
        .reduce((total, gasto) => total + gasto.valor, 0);

    const totalRecebido = gastos
        .filter(
            gasto =>
                gasto.devedor.trim().toLowerCase() !== "eu" &&
                gasto.pago
        )
        .reduce((total, gasto) => total + gasto.valor, 0);

    const totalPendente = totalQueDevem - totalRecebido;

    const valorDistribuido = gastos.reduce(
        (total, gasto) => total + gasto.valor,
        0
    );

    const valorNaoDistribuido = valorTotalFaturas - valorDistribuido;

    const minhaParte = valorTotalFaturas - totalQueDevem;

    const dadosGrafico = [
        {
            name: "Minha parte",
            value: minhaParte
        },
        {
            name: "Recebido",
            value: totalRecebido
        },
        {
            name: "Pendente",
            value: totalPendente
        },
        {
            name: "Não distribuído",
            value: valorNaoDistribuido > 0 ? valorNaoDistribuido : 0
        }
    ].filter(item => item.value > 0);

    const cores = [
        "#820AD1",
        "#2E7D32",
        "#ED6C02",
        "#9E9E9E"
    ];

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
                            Já recebi
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
                            Distribuído
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {valorDistribuido.toFixed(2)}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="text.secondary">
                            Não distribuído
                        </Typography>
                        <Typography fontWeight="bold">
                            R$ {valorNaoDistribuido.toFixed(2)}
                        </Typography>
                    </Grid>
                </Grid>

                {dadosGrafico.length > 0 && (
                    <Box sx={{ width: "100%", height: 260, mt: 3 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={dadosGrafico}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={90}
                                    label
                                >
                                    {dadosGrafico.map((item, index) => (
                                        <Cell
                                            key={item.name}
                                            fill={cores[index % cores.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    formatter={(value) =>
                                        `R$ ${Number(value).toFixed(2)}`
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default DashboardGeral;