const SUPABASE_URL = 'https://ktrsifglbkhntameaqnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bt0nsjFqqAIa3xBtGtmnDg_aLHCz-Ak';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('login-form');
let usuarioLogado = null;
let tipoUsuario = null;

loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;

    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cpf)
        .eq('senha', senha)
        .single();

    if (error || !data) {
        alert('CPF ou senha incorreto!');
        return;
    }

    usuarioLogado = cpf;
    tipoUsuario = data.tipo;

    alert(`Bem-vindo, ${cpf} (${tipoUsuario})`);

    document.getElementById('login-section').style.display='none';
    document.getElementById('filtro-section').style.display='block';
    document.getElementById('tabela-section').style.display='block';
    if(tipoUsuario==='master') document.getElementById('usuario-master-section').style.display='block';

    carregarRegistros();
    if(tipoUsuario==='master') carregarUsuarios();
});

async function carregarRegistros(){
    const { data, error } = await supabase.from('registros').select('*').order('id',{ascending:true});
    if(error){ console.error(error); return; }

    const tbody = document.querySelector('#tabela-registros tbody');
    tbody.innerHTML='';
    data.forEach(r=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`
            <td>${r.tipo_registro}</td>
            <td>${r.id}</td>
            <td>${new Date(r.data_hora).toLocaleString()}</td>
            <td>${r.responsavel}</td>
            <td>${r.vereador_vinculado||'-'}</td>
            <td><button onclick="apagarRegistro(${r.id}, '${r.responsavel}', '${r.vereador_vinculado||''}')">Apagar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('adicionar-registro').addEventListener('click', async ()=>{
    const tipo=document.getElementById('tipo-registro').value;
    const ano=document.getElementById('ano-registro').value;
    const vereador=prompt("Vereador vinculado (CPF) ou deixe em branco:");

    const { data, error } = await supabase.from('registros').insert([{
        tipo_registro: tipo,
        data_hora: new Date().toISOString(),
        responsavel: usuarioLogado,
        vereador_vinculado: vereador || null
    }]);

    if(error){ console.error(error); alert('Erro ao adicionar registro!'); return; }
    alert(`Registro adicionado Nº ${data[0].id}`);
    carregarRegistros();
});

async function apagarRegistro(id, responsavel, vereador){
    if(usuarioLogado!==responsavel && usuarioLogado!==vereador){
        alert('Você não pode apagar este registro!');
        return;
    }
    if(!confirm(`Deseja apagar o registro Nº ${id}?`)) return;
    const { error } = await supabase.from('registros').delete().eq('id',id);
    if(error){ console.error(error); alert('Erro ao apagar registro!'); return; }
    alert(`Registro Nº ${id} apagado!`);
    carregarRegistros();
}

async function carregarUsuarios(){
    const { data, error } = await supabase.from('usuarios').select('*');
    if(error){ console.error(error); return; }
    const tbody=document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML='';
    data.forEach(u=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`
            <td>${u.cpf}</td>
            <td>${u.tipo}</td>
            <td>
                <button onclick="resetSenha('${u.cpf}')">Resetar</button>
                <button onclick="inativarUsuario('${u.cpf}')">Inativar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function resetSenha(cpf){ alert(`Resetar senha do CPF ${cpf} (implementar)`); }
function inativarUsuario(cpf){ alert(`Inativar usuário CPF ${cpf} (implementar)`); }
