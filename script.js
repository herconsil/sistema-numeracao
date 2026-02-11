// =====================================
// Configuração Supabase
// =====================================
const SUPABASE_URL = 'https://ktrsifglbkhntameaqnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bt0nsjFqqAIa3xBtGtmnDg_aLHCz-Ak';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================
// Login com CPF
// =====================================
const loginForm = document.getElementById('login-form');
let usuarioLogado = null;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cpf = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cpf)
        .eq('senha', senha)
        .single();

    if (error || !user) {
        alert('CPF ou senha incorreto!');
        return;
    }

    usuarioLogado = cpf;
    alert(`Bem-vindo, ${cpf}!`);
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('filtro-section').style.display = 'block';
    document.getElementById('tabela-section').style.display = 'block';
    document.getElementById('export-section').style.display = 'block';
    if(user.tipo === 'master') document.getElementById('usuario-master-section').style.display = 'block';
    carregarRegistros();
    carregarUsuarios();
});

// =====================================
// Função para carregar registros
// =====================================
async function carregarRegistros() {
    const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('id', { ascending: true });

    const tbody = document.querySelector('#tabela-registros tbody');
    tbody.innerHTML = '';
    if(error) { console.error(error); return; }

    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.tipo_registro}</td>
            <td>${r.id}</td>
            <td>${new Date(r.data_hora).toLocaleString()}</td>
            <td>${r.responsavel}</td>
            <td>${r.vereador_vinculado || '-'}</td>
            <td>
                <button onclick="apagarRegistro(${r.id}, '${r.responsavel}', '${r.vereador_vinculado||''}')">Apagar</button>
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
    const vereador = prompt("Deseja vincular algum vereador? (CPF ou deixe em branco)");

    const { data, error } = await supabase
        .from('registros')
        .insert([{
            tipo_registro: tipo,
            responsavel: usuarioLogado,
            vereador_vinculado: vereador || null
        }]);

    if(error) { console.error(error); alert('Erro ao adicionar registro!'); return; }

    alert(`Registro adicionado! Nº do registro: ${data[0].id}`);
    carregarRegistros();
});

// =====================================
// Apagar registro
// =====================================
async function apagarRegistro(id, responsavel, vereador) {
    if(usuarioLogado !== responsavel && usuarioLogado !== vereador) {
        alert('Você não tem permissão para apagar este registro!');
        return;
    }
    if(!confirm(`Deseja realmente apagar o registro Nº ${id}?`)) return;

    const { error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id);

    if(error) { console.error(error); alert('Erro ao apagar registro!'); return; }

    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

// =====================================
// Carregar usuários (somente master)
function carregarUsuarios() {
    const tbody = document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML = '';
    supabase.from('usuarios').select('*').then(res => {
        if(res.error) return;
        res.data.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.cpf}</td>
                <td>${u.tipo}</td>
                <td>
                    <button>Resetar Senha</button>
                    <button>Inativar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// =====================================
// Exportação simulada
document.getElementById('export-btn').addEventListener('click', () => {
    const formato = document.getElementById('export-format').value;
    alert(`Exportando registros em ${formato.toUpperCase()} (simulação)`);
});
