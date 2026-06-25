import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import {
    buscarFaturas,
    buscarGastos
} from "../services/localStorageService";
import {
    calcularValorPagoGasto,
    calcularValorPendenteGasto,
    obterStatusGasto
} from "../utils/pagamentos";
import { ordenarPorMesAno } from "../utils/meses";

function Pessoas() {
    const navigate = useNavigate();
    const faturas = buscarFaturas();
    const gastos = buscarGastos();
    const [pessoaSelecionada, setPessoaSelecionada] = useState("");
    const [statusSelecionado, setStatusSelecionado] = useState("todos");

    const nomes = Array.from(
        new Set(gastos.map(gasto => gasto.devedor.trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    const gastosDaPessoa = gastos
        .filter(gasto =>
            !pessoaSelecionada || gasto.devedor.trim() === pessoaSelecionada
        )
        .filter(gasto => {
            if (statusSelecionado === "todos") return true;

            return obterStatusGasto(gasto).label.toLowerCase() === statusSelecionado;
        })
        .map(gasto => {
            const fatura = faturas.find(
                item => String(item.id) === String(gasto.faturaId)
            );

            return {
                ...gasto,
                fatura
            };
        })
        .sort((a, b) => ordenarPorMesAno(
            {
                mes: a.fatura?.mes || "",
                ano: a.fatura?.ano || 0
            },
            {
                mes: b.fatura?.mes || "",
                ano: b.fatura?.ano || 0
            }
        ));

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
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/")}>
                Voltar
            </Button>

            <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }} gutterBottom>
                Dívidas por Pessoa
            </Typography>

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Filtros
                    </Typography>

                    <TextField
                        select
                        label="Pessoa"
                        value={pessoaSelecionada}
                        onChange={event => setPessoaSelecionada(event.target.value)}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="">Todas</MenuItem>
                        {nomes.map(nome => (
                            <MenuItem key={nome} value={nome}>
                                {nome}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Status"
                        value={statusSelecionado}
                        onChange={event => setStatusSelecionado(event.target.value)}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="todos">Todos</MenuItem>
                        <MenuItem value="pendente">Pendente</MenuItem>
                        <MenuItem value="parcial">Parcial</MenuItem>
                        <MenuItem value="pago">Pago</MenuItem>
                    </TextField>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Resumo
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 2
                        }}
                    >
                        <Box>
                            <Typography color="text.secondary">Total</Typography>
                            <Typography fontWeight="bold">
                                R$ {total.toFixed(2)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography color="text.secondary">Já pagou</Typography>
                            <Typography fontWeight="bold">
                                R$ {totalPago.toFixed(2)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography color="text.secondary">Falta pagar</Typography>
                            <Typography fontWeight="bold" color="warning.main">
                                R$ {totalPendente.toFixed(2)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography color="text.secondary">Registros</Typography>
                            <Typography fontWeight="bold">
                                {gastosDaPessoa.length}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Dívidas
            </Typography>

            {gastosDaPessoa.length === 0 ? (
                <Typography>Nenhuma dívida encontrada.</Typography>
            ) : (
                gastosDaPessoa.map(gasto => {
                    const status = obterStatusGasto(gasto);
                    const valorPago = calcularValorPagoGasto(gasto);
                    const valorPendente = calcularValorPendenteGasto(gasto);

                    return (
                        <Card key={gasto.id} sx={{ mb: 2, borderRadius: 3 }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="bold">
                                        {gasto.devedor}
                                    </Typography>

                                    <Chip
                                        label={status.label}
                                        color={status.color}
                                        size="small"
                                    />
                                </Box>

                                <Typography sx={{ mt: 1 }} fontWeight="bold">
                                    {gasto.descricao}
                                </Typography>

                                <Typography>
                                    Fatura: {gasto.fatura?.mes || "Sem mês"}/{gasto.fatura?.ano || "-"}
                                </Typography>

                                <Typography>Total: R$ {Number(gasto.valor || 0).toFixed(2)}</Typography>
                                <Typography>Já pagou: R$ {valorPago.toFixed(2)}</Typography>
                                <Typography fontWeight="bold" color={valorPendente > 0 ? "warning.main" : "success.main"}>
                                    Falta pagar: R$ {valorPendente.toFixed(2)}
                                </Typography>

                                {gasto.fatura && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ mt: 2 }}
                                        onClick={() => navigate(`/fatura/${gasto.fatura.id}`)}
                                    >
                                        Abrir fatura
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </Container>
    );
}

export default Pessoas;
