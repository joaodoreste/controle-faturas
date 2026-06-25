import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import CardFatura from "../components/CardFatura";
import DashboardGeral from "../components/DashboardGeral";
import {
    buscarFaturas,
    excluirFatura,
    excluirGastosDaFatura,
    excluirPagamentosMinhaParteDaFatura,
    exportarBackup,
    importarBackup,
    salvarFaturas
} from "../services/localStorageService";
import { MESES, obterMesCanonico } from "../utils/meses";

function Faturas() {
    const navigate = useNavigate();
    const [faturas, setFaturas] = useState(() => buscarFaturas());
    const [mes, setMes] = useState("");
    const [ano, setAno] = useState(new Date().getFullYear());
    const [valorTotal, setValorTotal] = useState("");
    const [faturaEditandoId, setFaturaEditandoId] = useState(null);
    const inputArquivoRef = useRef(null);

    function limparFormulario() {
        setMes("");
        setAno(new Date().getFullYear());
        setValorTotal("");
        setFaturaEditandoId(null);
    }

    function fazerBackup() {
        const backup = exportarBackup();
        const blob = new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "controle-faturas-backup.json";
        link.click();
        URL.revokeObjectURL(url);
    }

    function restaurarBackup(event) {
        const arquivo = event.target.files[0];

        if (!arquivo) return;

        const leitor = new FileReader();

        leitor.onload = function (e) {
            try {
                const backup = JSON.parse(e.target.result);
                const confirmar = confirm(
                    "Deseja substituir todos os dados atuais pelo backup?"
                );

                if (!confirmar) return;

                importarBackup(backup);
                setFaturas(buscarFaturas());
                alert("Backup restaurado com sucesso!");
                window.location.reload();
            } catch {
                alert("Arquivo de backup inválido.");
            }
        };

        leitor.readAsText(arquivo);
        event.target.value = "";
    }

    function salvarFatura(event) {
        event.preventDefault();

        if (!mes || !ano || !valorTotal) {
            alert("Preencha mês, ano e valor total.");
            return;
        }

        const dadosFatura = {
            mes: obterMesCanonico(mes.trim()),
            ano: Number(ano),
            valorTotal: Number(valorTotal)
        };

        if (dadosFatura.valorTotal <= 0) {
            alert("Informe um valor maior que zero.");
            return;
        }

        if (faturaEditandoId) {
            const faturasAtualizadas = faturas.map(fatura =>
                fatura.id === faturaEditandoId
                    ? {
                        ...fatura,
                        ...dadosFatura
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
            ...dadosFatura
        };
        const novasFaturas = [novaFatura, ...faturas];

        setFaturas(novasFaturas);
        salvarFaturas(novasFaturas);
        limparFormulario();
    }

    function editarFatura(fatura) {
        setFaturaEditandoId(fatura.id);
        setMes(obterMesCanonico(fatura.mes));
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
        excluirPagamentosMinhaParteDaFatura(fatura.id);
        setFaturas(faturas.filter(item => item.id !== fatura.id));

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

            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Button variant="outlined" onClick={() => navigate("/planejamento")}>
                    Planejamento Futuro
                </Button>

                <Button variant="outlined" onClick={() => navigate("/pessoas")}>
                    Pessoas
                </Button>
            </Box>

            <DashboardGeral faturas={faturas} />

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {faturaEditandoId ? "Editar Fatura" : "Nova Fatura"}
                    </Typography>

                    <Box component="form" onSubmit={salvarFatura}>
                        <TextField
                            select
                            label="Mês"
                            value={mes}
                            onChange={event => setMes(event.target.value)}
                            fullWidth
                            margin="normal"
                        >
                            {MESES.map(item => (
                                <MenuItem key={item} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </TextField>

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

                        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
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

                        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                            <Button variant="outlined" onClick={fazerBackup}>
                                Exportar Backup
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => inputArquivoRef.current.click()}
                            >
                                Importar Backup
                            </Button>

                            <input
                                type="file"
                                accept=".json"
                                ref={inputArquivoRef}
                                style={{ display: "none" }}
                                onChange={restaurarBackup}
                            />
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
