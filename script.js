// =====================================
// Supabase Config
// =====================================
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co'; // substitua
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA'; // substitua
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================
// Login
// =====================================
const loginForm = document.getElementById('login-form');
let usuarioLogado = null;
let tipoUsuario = null;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cpf = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cpf)
        .eq('senha', senha)
        .eq('ativo', true)
        .limit(1);

    if (error) { console.error(error); alert('Erro ao buscar usuário'); return; }
    if (!usuarios || usuarios.length === 0) { alert('Usuário ou senha incorretos!'); return; }

    usuarioLogado = cpf;
    tipoUsuario = usuarios[0].tipo;

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('filtro-section').style.display = 'block';
    document.getElementById('tabela-section').style.display = 'block';
    document.getElementById('export-section').style.display = tipoUsuario === 'master' ? 'block' : 'none';
    document.getElementById('usuario-master-section').style.display = tipoUsuario === 'master' ? 'block' : 'none';

    carregarRegistros();
    if (tipoUsuario === 'master') carregarUsuarios();
});

// =====================================
// Carregar registros
// =====================================
async function carregarRegistros() {
    let query = supabase.from('registros').select('*').order('id', { ascending: true });
    if (tipoUsuario !== 'master') query = query.or(`responsavel.eq.${usuarioLogado},vereador_vinculado.eq.${usuarioLogado}`);

    const { data, error } = await query;
    if (error) { console.error(error); return; }

    const tbody = document.querySelector('#tabela-registros tbody');
    tbody.innerHTML = '';
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.tipo_registro}</td>
            <td>${r.id}</td>
            <td>${new Date(r.data_hora).toLocaleString()}</td>
            <td>${r.responsavel}</td>
            <td>${r.vereador_vinculado || '-'}</td>
            <td>
                <button onclick="apagarRegistro(${r.id}, '${r.responsavel}', '${r.vereador_vinculado || ''}')">Apagar</button>
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
    const vereador = prompt("Vereador vinculado (deixe em branco se não)");

    const { data, error } = await supabase
        .from('registros')
        .insert([{ tipo_registro: tipo, data_hora: new Date().toISOString(), responsavel: usuarioLogado, vereador_vinculado: vereador || null }]);

    if (error) { console.error(error); alert('Erro ao adicionar registro!'); return; }
    alert(`Registro adicionado! Nº: ${data[0].id}`);
    carregarRegistros();
});

// =====================================
// Apagar registro
// =====================================
async function apagarRegistro(id, responsavel, vereador) {
    if (tipoUsuario !== 'master' && usuarioLogado !== responsavel && usuarioLogado !== vereador) {
        alert('Você não tem permissão para apagar este registro!');
        return;
    }
    if (!confirm(`Apagar registro Nº ${id}?`)) return;

    const { error } = await supabase.from('registros').delete().eq('id', id);
    if (error) { console.error(error); alert('Erro ao apagar!'); return; }
    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

// =====================================
// Usuários master
// =====================================
function carregarUsuarios() {
    supabase.from('usuarios').select('*').then(({ data, error }) => {
        if (error) { console.error(error); return; }
        const tbody = document.querySelector('#tabela-usuarios tbody');
        tbody.innerHTML = '';
        data.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.cpf}</td>
                <td>${u.senha}</td>
                <td>${u.tipo}</td>
                <td>
                    <button onclick="resetarSenha('${u.cpf}')">Resetar Senha</button>
                    <button onclick="inativarUsuario('${u.cpf}')">Inativar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

async function resetarSenha(cpf) {
    const novaSenha = prompt(`Nova senha para ${cpf}:`);
    if (!novaSenha) return;
    const { error } = await supabase.from('usuarios').update({ senha: novaSenha }).eq('cpf', cpf);
    if (error) { console.error(error); alert('Erro ao resetar senha!'); return; }
    alert('Senha atualizada!');
}

async function inativarUsuario(cpf) {
    if (!confirm(`Inativar ${cpf}?`)) return;
    const { error } = await supabase.from('usuarios').update({ ativo: false }).eq('cpf', cpf);
    if (error) { console.error(error); alert('Erro ao inativar usuário!'); return; }
    alert('Usuário inativado!');
    carregarUsuarios();
}

// =====================================
// Exportar registros (simulação)
// =====================================
document.getElementById('export-btn').addEventListener('click', () => {
    const formato = document.getElementById('export-format').value;
    alert(`Exportando em ${formato.toUpperCase()} (não implementado ainda)`);
});
