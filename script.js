// =====================================
// Configuração Supabase
// =====================================
const SUPABASE_URL = 'https://ktrsifglbkhntameaqnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bt0nsjFqqAIa3xBtGtmnDg_aLHCz-Ak';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================
// Teste direto sem login
// =====================================
const usuarioLogado = '02746895293'; // CPF fixo Master

document.addEventListener('DOMContentLoaded', () => {
    // mostra todas as seções
    document.getElementById('filtro-section').style.display = 'block';
    document.getElementById('tabela-section').style.display = 'block';
    document.getElementById('export-section').style.display = 'block';
    document.getElementById('usuario-master-section').style.display = 'block';

    carregarRegistros();
    carregarUsuarios();
});

// =====================================
// Carregar registros
// =====================================
async function carregarRegistros() {
    const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('id', { ascending: true });

    if (error) return console.error(error);

    const tbody = document.querySelector('#tabela-registros tbody');
    tbody.innerHTML = '';

    data.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.tipo_registro}</td>
            <td>${registro.id}</td>
            <td>${new Date(registro.data_hora).toLocaleString()}</td>
            <td>${registro.responsavel}</td>
            <td>${registro.vereador_vinculado || '-'}</td>
            <td>
                <button onclick="apagarRegistro(${registro.id}, '${registro.responsavel}', '${registro.vereador_vinculado || ''}')">Apagar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// =====================================
// Adicionar registro
// =====================================
document.getElementById('adicionar-registro').addEventListener('click', async () => {
    const tipo = document.getElementById('tipo-registro').value;
    const vereador = prompt("Deseja vincular algum vereador? (Deixe em branco se não)");

    const { data, error } = await supabase
        .from('registros')
        .insert([{
            tipo_registro: tipo,
            data_hora: new Date().toISOString(),
            responsavel: usuarioLogado,
            vereador_vinculado: vereador || null
        }]);

    if (error) return alert('Erro ao adicionar registro!');

    alert(`Registro adicionado! Nº do registro: ${data[0].id}`);
    carregarRegistros();
});

// =====================================
// Apagar registro
// =====================================
async function apagarRegistro(id, responsavel, vereador) {
    if (usuarioLogado !== responsavel && usuarioLogado !== vereador) {
        return alert('Você não tem permissão para apagar este registro!');
    }

    const confirmacao = confirm(`Deseja realmente apagar o registro Nº ${id}?`);
    if (!confirmacao) return;

    const { error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id);

    if (error) return alert('Erro ao apagar registro!');

    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

// =====================================
// Carregar usuários (simulação)
function carregarUsuarios() {
    const usuarios = [
        { nome: 'Hercules', login: '02746895293', tipo: 'Master' }
    ];

    const tbody = document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML = '';
    usuarios.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.nome}</td>
            <td>${u.login}</td>
            <td>${u.tipo}</td>
            <td>
                <button>Editar</button>
                <button>Resetar Senha</button>
                <button>Inativar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// =====================================
// Exportar registros (simulação)
document.getElementById('export-btn').addEventListener('click', () => {
    const formato = document.getElementById('export-format').value;
    alert(`Exportando registros em ${formato.toUpperCase()} (funcionalidade ainda precisa ser implementada)`);
});
