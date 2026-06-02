import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Container,
    FormControlLabel,
    TextField,
    Typography
} from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import ResumoPorPessoa from "../components/ResumoPorPessoa";
import {
    buscarFaturas,
    buscarGastos,
    salvarGastos
} from "../services/localStorageService";

function DetalheFatura() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [gastos, setGastos] = useState([]);

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [devedor, setDevedor] = useState("");
    const [souEu, setSouEu] = useState(false);
    const [gastoEditandoId, setGastoEditandoId] = useState(null);

    const faturas = buscarFaturas();
    const fatura = faturas.find(item => String(item.id) === String(id));

    useEffect(() => {
        const todosGastos = buscarGastos();

        const gastosDaFatura = todosGastos.filter(
            gasto => String(gasto.faturaId) === String(id)
        );

        setGastos(gastosDaFatura);
    }, [id]);

    function limparFormulario() {
        setDescricao("");
        setValor("");
        setDevedor("");
        setSouEu(false);
        setGastoEditandoId(null);
    }

    function salvarGasto(event) {
        event.preventDefault();

        if (!descricao || !valor) {
            alert("Preencha a descrição e o valor.");
            return;
        }

        if (!souEu && !devedor) {
            alert("Informe quem deve esse valor.");
            return;
        }

        const todosGastos = buscarGastos();

        const dadosGasto = {
            descricao: descricao.trim(),
            valor: Number(valor),
            devedor: souEu ? "Eu" : devedor.trim(),
            pago: souEu ? true : false
        };

        if (gastoEditandoId) {
            const gastosAtualizados = todosGastos.map(gasto =>
                gasto.id === gastoEditandoId
                    ? {
                        ...gasto,
                        ...dadosGasto,
                        pago: souEu ? true : gasto.pago
                    }
                    : gasto
            );

            salvarGastos(gastosAtualizados);

            setGastos(
                gastos.map(gasto =>
                    gasto.id === gastoEditandoId
                        ? {
                            ...gasto,
                            ...dadosGasto,
                            pago: souEu ? true : gasto.pago
                        }
                        : gasto
                )
            );

            limparFormulario();
            return;
        }

        const novoGasto = {
            id: Date.now(),
            faturaId: Number(id),
            ...dadosGasto,
            pago: souEu
        };

        const novosGastos = [...todosGastos, novoGasto];

        salvarGastos(novosGastos);
        setGastos([...gastos, novoGasto]);
        limparFormulario();
    }

    function editarGasto(gasto) {
        setGastoEditandoId(gasto.id);
        setDescricao(gasto.descricao);
        setValor(String(gasto.valor));

        const ehMeu = gasto.devedor.trim().toLowerCase() === "eu";

        setSouEu(ehMeu);
        setDevedor(ehMeu ? "" : gasto.devedor);
    }

    function alternarPago(gastoId) {
        const todosGastos = buscarGastos();

        const gastosAtualizados = todosGastos.map(gasto =>
            gasto.id === gastoId
                ? { ...gasto, pago: !gasto.pago }
                : gasto
        );

        salvarGastos(gastosAtualizados);

        setGastos(
            gastos.map(gasto =>
                gasto.id === gastoId
                    ? { ...gasto, pago: !gasto.pago }
                    : gasto
            )
        );
    }

    function excluirGasto(gastoId) {
        const confirmar = confirm("Tem certeza que deseja excluir esse gasto?");
        if (!confirmar) return;

        const todosGastos = buscarGastos();

        const gastosAtualizados = todosGastos.filter(
            gasto => gasto.id !== gastoId
        );

        salvarGastos(gastosAtualizados);
        setGastos(gastos.filter(gasto => gasto.id !== gastoId));

        if (gastoEditandoId === gastoId) {
            limparFormulario();
        }
    }

    if (!fatura) {
        return (
            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Fatura não encontrada
                </Typography>

                <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    onClick={() => navigate("/")}
                >
                    Voltar
                </Button>
            </Container>
        );
    }

    const totalQueDevem = gastos
        .filter(gasto => gasto.devedor.trim().toLowerCase() !== "eu")
        .reduce((total, gasto) => total + gasto.valor, 0);

    const totalPago = gastos
        .filter(
            gasto =>
                gasto.devedor.trim().toLowerCase() !== "eu" &&
                gasto.pago
        )
        .reduce((total, gasto) => total + gasto.valor, 0);

    const totalPendente = totalQueDevem - totalPago;
    const minhaParte = fatura.valorTotal - totalQueDevem;

    const valorDistribuido = gastos.reduce(
        (total, gasto) => total + gasto.valor,
        0
    );

    const valorNaoDistribuido = fatura.valorTotal - valorDistribuido;

    const dadosGrafico = [
        { name: "Minha parte", value: minhaParte },
        { name: "Recebido", value: totalPago },
        { name: "Pendente", value: totalPendente },
        {
            name: "Não distribuído",
            value: valorNaoDistribuido > 0 ? valorNaoDistribuido : 0
        }
    ].filter(item => item.value > 0);

    const cores = ["#820AD1", "#2E7D32", "#ED6C02", "#9E9E9E"];

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/")}>
                ← Voltar
            </Button>

            <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                {fatura.mes}/{fatura.ano}
            </Typography>

            <Typography variant="body1" color="text.secondary" gutterBottom>
                Valor total: R$ {fatura.valorTotal.toFixed(2)}
            </Typography>

            <Card sx={{ mt: 2, mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Resumo da Fatura
                    </Typography>

                    <Typography>
                        Pessoas me devem: R$ {totalQueDevem.toFixed(2)}
                    </Typography>

                    <Typography>
                        Já recebi: R$ {totalPago.toFixed(2)}
                    </Typography>

                    <Typography>
                        Falta receber: R$ {totalPendente.toFixed(2)}
                    </Typography>

                    <Typography fontWeight="bold" sx={{ mt: 1 }}>
                        Minha parte: R$ {minhaParte.toFixed(2)}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                        Valor distribuído: R$ {valorDistribuido.toFixed(2)}
                    </Typography>

                    <Typography
                        color={
                            valorNaoDistribuido > 0
                                ? "warning.main"
                                : "success.main"
                        }
                        fontWeight="bold"
                    >
                        Valor não distribuído: R$ {valorNaoDistribuido.toFixed(2)}
                    </Typography>

                    {dadosGrafico.length > 0 && (
                        <Box sx={{ width: "100%", height: 240, mt: 3 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={dadosGrafico}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={85}
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

            <ResumoPorPessoa gastos={gastos} />

            <Card sx={{ mt: 3, mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {gastoEditandoId ? "Editar Gasto" : "Adicionar Gasto"}
                    </Typography>

                    <Box component="form" onSubmit={salvarGasto}>
                        <TextField
                            label="Descrição"
                            value={descricao}
                            onChange={event => setDescricao(event.target.value)}
                            placeholder="Ex: Mercado"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Valor"
                            type="number"
                            value={valor}
                            onChange={event => setValor(event.target.value)}
                            placeholder="Ex: 300"
                            fullWidth
                            margin="normal"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={souEu}
                                    onChange={event =>
                                        setSouEu(event.target.checked)
                                    }
                                />
                            }
                            label="Esse gasto é meu"
                        />

                        {!souEu && (
                            <TextField
                                label="Quem deve?"
                                value={devedor}
                                onChange={event => setDevedor(event.target.value)}
                                placeholder="Ex: Pai"
                                fullWidth
                                margin="normal"
                            />
                        )}

                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                            <Button type="submit" variant="contained">
                                {gastoEditandoId
                                    ? "Salvar Alterações"
                                    : "Salvar Gasto"}
                            </Button>

                            {gastoEditandoId && (
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={limparFormulario}
                                >
                                    Cancelar
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Gastos
            </Typography>

            {gastos.length === 0 ? (
                <Typography>Nenhum gasto cadastrado.</Typography>
            ) : (
                gastos.map(gasto => {
                    const ehMeu =
                        gasto.devedor.trim().toLowerCase() === "eu";

                    return (
                        <Card
                            key={gasto.id}
                            sx={{ mb: 2, borderRadius: 3 }}
                        >
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
                                        {gasto.descricao}
                                    </Typography>

                                    <Chip
                                        label={
                                            ehMeu
                                                ? "Minha despesa"
                                                : gasto.pago
                                                    ? "Pago"
                                                    : "Pendente"
                                        }
                                        color={
                                            ehMeu
                                                ? "default"
                                                : gasto.pago
                                                    ? "success"
                                                    : "warning"
                                        }
                                        size="small"
                                    />
                                </Box>

                                <Typography sx={{ mt: 1 }}>
                                    Valor: R$ {gasto.valor.toFixed(2)}
                                </Typography>

                                <Typography>
                                    Quem deve: {gasto.devedor}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        mt: 2,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    {!ehMeu && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() =>
                                                alternarPago(gasto.id)
                                            }
                                        >
                                            {gasto.pago
                                                ? "Marcar pendente"
                                                : "Marcar pago"}
                                        </Button>
                                    )}

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => editarGasto(gasto)}
                                    >
                                        Editar
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => excluirGasto(gasto.id)}
                                    >
                                        Excluir
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </Container>
    );
}

export default DetalheFatura;