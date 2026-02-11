// =====================================
// Configuração Supabase
// =====================================
const SUPABASE_URL = 'https://ktrsifglbkhntameaqnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bt0nsjFqqAIa3xBtGtmnDg_aLHCz-Ak';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let usuarioLogado = null;

// =====================================
// Login
// =====================================
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', usuario)
        .eq('senha', senha)
        .single();

    if (error || !data) {
        alert('CPF ou senha inválidos!');
        return;
    }

    usuarioLogado = data.cpf;
    alert(`Bem-vindo, ${usuarioLogado}! Tipo: ${data.tipo}`);

    // mostrar as seções
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('filtro-section').style.display = 'block';
    document.getElementById('tabela-section').style.display = 'block';
    document.getElementById('export-section').style.display = 'block';
    if (data.tipo.toLowerCase() === 'master') {
        document.getElementById('usuario-master-section').style.display = 'block';
    }

    carregarRegistros();
    carregarUsuarios();
});

// =====================================
// Funções de Registros
// =====================================
async function carregarRegistros() {
    const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

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

document.getElementById('adicionar-registro').addEventListener('click', async () => {
    const tipo = document.getElementById('tipo-registro').value;
    const ano = document.getElementById('ano-registro').value;
    const vereador = prompt("Deseja vincular algum vereador? (Deixe em branco se não)");

    const { data, error } = await supabase
        .from('registros')
        .insert([{
            tipo_registro: tipo,
            data_hora: new Date().toISOString(),
            responsavel: usuarioLogado,
            vereador_vinculado: vereador || null
        }]);

    if (error) {
        console.error(error);
        alert('Erro ao adicionar registro!');
        return;
    }

    alert(`Registro adicionado! Nº do registro: ${data[0].id}`);
    carregarRegistros();
});

async function apagarRegistro(id, responsavel, vereador) {
    if (usuarioLogado !== responsavel && usuarioLogado !== vereador) {
        alert('Você não tem permissão para apagar este registro!');
        return;
    }

    const confirmacao = confirm(`Deseja realmente apagar o registro Nº ${id}?`);
    if (!confirmacao) return;

    const { error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(error);
        alert('Erro ao apagar registro!');
        return;
    }

    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

// =====================================
// Funções de Usuários
// =====================================
async function carregarUsuarios() {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('cpf', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    const tbody = document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML = '';
    data.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.cpf}</td>
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
// Exportação (simulação)
// =====================================
document.getElementById('export-btn').addEventListener('click', () => {
    const formato = document.getElementById('export-format').value;
    alert(`Exportando registros em ${formato.toUpperCase()} (funcionalidade ainda precisa ser implementada)`);
});
