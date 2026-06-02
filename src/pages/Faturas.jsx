import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography
} from "@mui/material";

import CardFatura from "../components/CardFatura";
import DashboardGeral from "../components/DashboardGeral";

import {
    buscarFaturas,
    salvarFaturas,
    excluirFatura,
    excluirGastosDaFatura
} from "../services/localStorageService";

function Faturas() {
    const [faturas, setFaturas] = useState([]);

    const [mes, setMes] = useState("");
    const [ano, setAno] = useState(new Date().getFullYear());
    const [valorTotal, setValorTotal] = useState("");

    const [faturaEditandoId, setFaturaEditandoId] = useState(null);

    useEffect(() => {
        setFaturas(buscarFaturas());
    }, []);

    function limparFormulario() {
        setMes("");
        setAno(new Date().getFullYear());
        setValorTotal("");
        setFaturaEditandoId(null);
    }

    function salvarFatura(event) {
        event.preventDefault();

        if (!mes || !ano || !valorTotal) {
            alert("Preencha mês, ano e valor total.");
            return;
        }

        if (faturaEditandoId) {
            const faturasAtualizadas = faturas.map(fatura =>
                fatura.id === faturaEditandoId
                    ? {
                        ...fatura,
                        mes: mes.trim(),
                        ano: Number(ano),
                        valorTotal: Number(valorTotal)
                    }
                    : fatura
            );

            setFaturas(faturasAtualizadas);
            salvarFaturas(faturasAtualizadas);
            limparFormulario();
            return;
        }

        const novaFatura = {
            id: Date.now(),
            mes: mes.trim(),
            ano: Number(ano),
            valorTotal: Number(valorTotal)
        };

        const novasFaturas = [novaFatura, ...faturas];

        setFaturas(novasFaturas);
        salvarFaturas(novasFaturas);

        limparFormulario();
    }

    function editarFatura(fatura) {
        setFaturaEditandoId(fatura.id);
        setMes(fatura.mes);
        setAno(fatura.ano);
        setValorTotal(fatura.valorTotal);
    }

    function removerFatura(fatura) {
        const confirmar = confirm(
            `Tem certeza que deseja excluir a fatura ${fatura.mes}/${fatura.ano}?\n\nTodos os gastos dessa fatura também serão excluídos.`
        );

        if (!confirmar) return;

        excluirFatura(fatura.id);
        excluirGastosDaFatura(fatura.id);

        setFaturas(
            faturas.filter(item => item.id !== fatura.id)
        );

        if (faturaEditandoId === fatura.id) {
            limparFormulario();
        }
    }

    function subirFatura(index) {
        if (index === 0) return;

        const novasFaturas = [...faturas];

        const temporaria = novasFaturas[index - 1];
        novasFaturas[index - 1] = novasFaturas[index];
        novasFaturas[index] = temporaria;

        setFaturas(novasFaturas);
        salvarFaturas(novasFaturas);
    }

    function descerFatura(index) {
        if (index === faturas.length - 1) return;

        const novasFaturas = [...faturas];

        const temporaria = novasFaturas[index + 1];
        novasFaturas[index + 1] = novasFaturas[index];
        novasFaturas[index] = temporaria;

        setFaturas(novasFaturas);
        salvarFaturas(novasFaturas);
    }

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Minhas Faturas
            </Typography>

            <DashboardGeral faturas={faturas} />

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {faturaEditandoId ? "Editar Fatura" : "Nova Fatura"}
                    </Typography>

                    <Box component="form" onSubmit={salvarFatura}>
                        <TextField
                            label="Mês"
                            value={mes}
                            onChange={event => setMes(event.target.value)}
                            placeholder="Ex: Junho"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Ano"
                            type="number"
                            value={ano}
                            onChange={event => setAno(event.target.value)}
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Valor Total"
                            type="number"
                            value={valorTotal}
                            onChange={event => setValorTotal(event.target.value)}
                            placeholder="Ex: 1800"
                            fullWidth
                            margin="normal"
                        />

                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                            <Button type="submit" variant="contained">
                                {faturaEditandoId ? "Salvar Alterações" : "Salvar Fatura"}
                            </Button>

                            {faturaEditandoId && (
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
                Faturas Cadastradas
            </Typography>

            {faturas.length === 0 ? (
                <Typography>Nenhuma fatura cadastrada.</Typography>
            ) : (
                faturas.map((fatura, index) => (
                    <CardFatura
                        key={fatura.id}
                        fatura={fatura}
                        onEditar={editarFatura}
                        onExcluir={removerFatura}
                        onSubir={() => subirFatura(index)}
                        onDescer={() => descerFatura(index)}
                        podeSubir={index > 0}
                        podeDescer={index < faturas.length - 1}
                    />
                ))
            )}
        </Container>
    );
}

export default Faturas;