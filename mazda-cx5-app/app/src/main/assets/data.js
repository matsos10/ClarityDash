// Dados de referência para o Mazda CX-5 (KE 2012–2017 e KF 2017+).
// Valores indicativos: confirmar sempre no manual do proprietário / livro de manutenção.

const ENGINES = {
  g20: 'Skyactiv-G 2.0 (gasolina)',
  g25: 'Skyactiv-G 2.5 (gasolina)',
  g25t: 'Skyactiv-G 2.5 Turbo (gasolina)',
  d22: 'Skyactiv-D 2.2 (diesel)',
  d22b: 'Skyactiv-D 2.2 (diesel, AdBlue)'
};

// fuel: 'g' só gasolina, 'd' só diesel; trans: 'auto' | 'manual'; awd: só AWD
const DEFAULT_PLAN = [
  { id: 'oil', name: 'Óleo do motor + filtro', cat: 'Motor', km: 20000, months: 12, severeKm: 10000, severeMonths: 6, notes: 'Gasolina: 0W-20. Diesel: 0W-30 low-SAPS (DPF). Em uso severo (trajetos curtos, cidade, reboque) reduzir para 10.000 km / 6 meses.' },
  { id: 'general', name: 'Revisão geral (oficina)', cat: 'Geral', km: 20000, months: 12, notes: 'Revisão programada Mazda: inspeção geral, atualização de software e carimbo no livro.' },
  { id: 'cabin', name: 'Filtro do habitáculo (pólen)', cat: 'Filtros', km: 20000, months: 12, notes: 'Atrás do porta-luvas. Trocar mais cedo se houver cheiros ou pouco caudal de ar.' },
  { id: 'air', name: 'Filtro de ar do motor', cat: 'Filtros', km: 40000, months: 0, severeKm: 20000, notes: 'Inspecionar a cada revisão; zonas com pó: trocar mais cedo.' },
  { id: 'fuelf', name: 'Filtro de combustível', cat: 'Filtros', km: 60000, months: 0, fuel: 'd', notes: 'Apenas diesel. Purgar o ar após a substituição.' },
  { id: 'plugs', name: 'Velas de ignição (iridium)', cat: 'Motor', km: 75000, months: 60, fuel: 'g', notes: 'Iridium, folga não ajustável. Confirmar intervalo no livro de manutenção.' },
  { id: 'belt', name: 'Correia de acessórios (inspeção)', cat: 'Motor', km: 40000, months: 24, notes: 'Verificar fissuras, ruído e tensor.' },
  { id: 'coolant', name: 'Líquido de refrigeração (FL22)', cat: 'Motor', km: 200000, months: 120, notes: '1.ª troca aos 200.000 km / 10 anos; depois a cada 100.000 km / 5 anos. Usar só FL22.' },
  { id: 'brakefl', name: 'Líquido de travões', cat: 'Travões', km: 40000, months: 24, notes: 'DOT 3 / DOT 4. Absorve humidade – trocar a cada 2 anos.' },
  { id: 'brakes', name: 'Pastilhas e discos (inspeção)', cat: 'Travões', km: 20000, months: 12, notes: 'Espessura mínima pastilha ≈ 2 mm. Verificar travão de mão elétrico.' },
  { id: 'rotation', name: 'Rotação dos pneus', cat: 'Pneus', km: 10000, months: 0, notes: 'Frente ↔ trás do mesmo lado. Reinicializar TPMS depois.' },
  { id: 'align', name: 'Alinhamento da direção', cat: 'Pneus', km: 20000, months: 12, notes: 'Fazer também após trocar pneus ou bater num passeio.' },
  { id: 'atf', name: 'Óleo caixa automática (ATF FZ)', cat: 'Transmissão', km: 60000, months: 0, trans: 'auto', notes: 'Mazda diz "sem manutenção" mas a troca preventiva aos 60–80 mil km prolonga a vida da caixa.' },
  { id: 'mtf', name: 'Óleo caixa manual (inspeção)', cat: 'Transmissão', km: 60000, months: 0, trans: 'manual', notes: 'Verificar fugas e nível.' },
  { id: 'diff', name: 'Óleo diferencial traseiro / transfer (AWD)', cat: 'Transmissão', km: 40000, months: 24, awd: true, notes: 'Inspeção; trocar em uso severo / reboque.' },
  { id: 'dpf', name: 'Verificação DPF / regenerações', cat: 'Motor', km: 20000, months: 12, fuel: 'd', notes: 'Ler % de fuligem e nível de diluição do óleo (OBD).' },
  { id: 'adblue', name: 'Reabastecer AdBlue', cat: 'Motor', km: 10000, months: 0, fuel: 'd', engines: ['d22b'], notes: 'O painel avisa quando faltar autonomia.' },
  { id: 'battery', name: 'Bateria (teste)', cat: 'Elétrico', km: 0, months: 12, notes: 'Bateria EFB/AGM específica para i-Stop. Vida típica 4–6 anos.' },
  { id: 'wipers', name: 'Escovas limpa-vidros', cat: 'Exterior', km: 0, months: 12, notes: 'Frente ≈ 600 + 450 mm; traseira ≈ 300 mm.' },
  { id: 'ac', name: 'Ar condicionado (higienização / carga)', cat: 'Conforto', km: 0, months: 24, notes: 'Desinfeção do evaporador e verificação do gás.' },
  { id: 'keybat', name: 'Pilha da chave (CR2025)', cat: 'Elétrico', km: 0, months: 36, notes: 'Abre-se pela ranhura da chave mecânica.' },
  { id: 'suspension', name: 'Suspensão e direção (inspeção)', cat: 'Chassis', km: 40000, months: 24, notes: 'Amortecedores, rótulas, foles, barras estabilizadoras.' },
  { id: 'lights', name: 'Luzes e sinalização (verificação)', cat: 'Exterior', km: 0, months: 6, notes: 'Médios, máximos, piscas, travão, nevoeiro, matrícula.' }
];

const DEFAULT_REMINDERS = [
  { title: 'Seguro automóvel', repeatMonths: 12, cat: 'Documentos' },
  { title: 'IUC – Imposto Único de Circulação', repeatMonths: 12, cat: 'Documentos' },
  { title: 'Inspeção periódica (IPO)', repeatMonths: 24, cat: 'Documentos' }
];

const EXPENSE_CATS = ['Seguro', 'IUC / Impostos', 'Inspeção', 'Portagens / Via Verde', 'Estacionamento', 'Lavagem', 'Peças / Acessórios', 'Pneus', 'Reparação', 'Multas', 'Financiamento', 'Outros'];

const SECRET_CODES = [
  { group: 'Mazda Connect (ecrã central)', items: [
    { title: 'Menu de diagnóstico / modo de teste', how: 'Ignição ligada. Mantenha premido o botão MUTE (carregar no botão do volume) e, sem largar, mantenha premidos os botões MUSIC (♫ / Entretenimento) e FAV (★) durante 3–10 segundos.', what: 'Mostra versões de firmware, GPS, Bluetooth, sinais de rádio, teste de botões/ecrã tátil, atualização de software por USB e opções para limpar dados.', warn: 'Não altere valores que não conhece. "Clear data"/"Factory" apaga definições.' },
    { title: 'Reiniciar o sistema (ecrã congelado)', how: 'Mantenha premidos ao mesmo tempo os botões NAV + BACK (◄) + MUTE (volume) durante ~10 segundos até o ecrã desligar e reiniciar.', what: 'Reinício "a quente" do Mazda Connect sem apagar dados.', warn: '' },
    { title: 'Ver a versão do firmware', how: 'Definições ▸ Sistema ▸ Sobre ▸ Informação da versão.', what: 'Versões ≥ 70.00.100 permitem Android Auto / Apple CarPlay (requer também hub USB atualizado no concessionário).', warn: '' },
    { title: 'Reposição de fábrica do Mazda Connect', how: 'Definições ▸ Sistema ▸ Restaurar predefinições de fábrica.', what: 'Apaga telemóveis emparelhados, favoritos e definições. Útil antes de vender o carro.', warn: 'Irreversível.' },
    { title: 'Rádio antigo (2012–2014, sem Mazda Connect)', how: 'Mantenha premido POWER/VOLUME + SEEK ▲ ao mesmo tempo.', what: 'Abre um modo de diagnóstico numerado do auto-rádio.', warn: 'Depende do auto-rádio instalado.' }
  ]},
  { group: 'Painel de instrumentos', items: [
    { title: 'Modo de teste do painel', how: 'Com a ignição desligada, mantenha premido o botão do conta-quilómetros parcial (TRIP / INFO). Ligue a ignição (sem arrancar) mantendo o botão. Largue e volte a premir 3 vezes em menos de 5 segundos.', what: 'Os ponteiros fazem um varrimento completo, todas as luzes acendem (teste de LEDs) e em alguns anos aparecem códigos de erro do painel.', warn: 'O procedimento varia com o ano do modelo; se não funcionar não há qualquer dano.' },
    { title: 'Repor o aviso de manutenção programada (chave inglesa)', how: 'Mazda Connect: Definições ▸ Veículo ▸ Manutenção ▸ Programada ▸ Repor. Sem ecrã: botão INFO do volante ▸ Manutenção.', what: 'Apaga o símbolo 🔧 após a revisão e reinicia a contagem.', warn: '' },
    { title: 'Repor a vida do óleo (diesel / "Flexível")', how: 'Definições ▸ Veículo ▸ Manutenção ▸ Mudança de óleo ▸ Repor. Modelos diesel antigos sem menu: ignição ON (motor desligado), pisar a fundo o acelerador 5 vezes em 10 s; a luz pisca e apaga.', what: 'Obrigatório depois de mudar o óleo no diesel: o calculador estima a diluição do óleo por regenerações do DPF.', warn: 'Fazer apenas depois de efetivamente trocar o óleo.' }
  ]},
  { group: 'Calibrações e funções escondidas', items: [
    { title: 'Inicializar o TPMS (pressão dos pneus)', how: 'KF (2017+): Definições ▸ Veículo ▸ Monitorização da pressão dos pneus ▸ Inicializar. KE (2012–2017): botão TPMS por baixo do lado esquerdo do tablier – manter premido até a luz piscar 2 vezes.', what: 'Fazer sempre depois de acertar pressões, trocar ou rodar pneus. O sistema aprende durante ~20–40 min de condução.', warn: 'Acerte as pressões a frio antes de inicializar.' },
    { title: 'Reaprender os vidros automáticos', how: 'Abra totalmente o vidro mantendo o botão premido. Depois feche totalmente e continue a puxar o botão ~2 segundos depois de fechado.', what: 'Recupera a subida/descida automática e o anti-entalamento após troca de bateria.', warn: '' },
    { title: 'Memorizar altura da bagageira elétrica', how: 'Abra a bagageira e pare-a (à mão) na altura desejada. Mantenha premido o botão da própria tampa ~3 segundos até ouvir o sinal sonoro.', what: 'A tampa passa a abrir só até essa altura (garagens baixas).', warn: '' },
    { title: 'Arrancar com a pilha da chave descarregada', how: 'Encoste a chave (lado do logótipo) ao botão START/STOP e carregue no pedal de travão/embraiagem.', what: 'O botão lê a chave por proximidade e permite arrancar.', warn: '' },
    { title: 'Chave mecânica escondida', how: 'Deslize o botão na traseira do comando e retire a chave metálica. A fechadura está sob uma tampa na porta do condutor (empurrar por baixo).', what: 'Abrir o carro com bateria ou pilha descarregada.', warn: '' },
    { title: 'Personalizações sem oficina', how: 'Definições ▸ Veículo: fecho automático, destrancar só condutor, tempo de luzes "follow me home", sensibilidade do sensor de luzes/chuva, sinal sonoro dos piscas, vidros/espelhos ao trancar, ecrã HUD.', what: 'Muitas funções que as oficinas cobram para "programar" estão neste menu.', warn: '' },
    { title: 'Desligar i-Stop', how: 'Botão "i-Stop OFF" no tablier – tem de ser premido a cada arranque. Desativação permanente só por codificação (FORScan).', what: 'Útil em trânsito pára-arranca ou com bateria fraca.', warn: '' },
    { title: 'Regeneração do DPF (diesel)', how: 'Quando acende a luz do DPF: conduzir 15–20 min a > 60 km/h e > 2000 rpm sem desligar o motor. Regeneração forçada: FORScan / máquina de diagnóstico.', what: 'Queima a fuligem acumulada no filtro de partículas.', warn: 'Não desligar o motor a meio de uma regeneração (ventoinha a trabalhar, ralenti mais alto).' }
  ]},
  { group: 'FORScan (OBD-II + computador / telemóvel)', items: [
    { title: 'O que é', how: 'Programa FORScan (Windows) ou FORScan Lite (Android/iOS) + interface OBD-II de qualidade (OBDLink, vLinker). Liga-se à ficha OBD por baixo do volante.', what: 'Lê/apaga códigos de todos os módulos, mostra dados em tempo real (temperatura do óleo, fuligem DPF, diluição do óleo, estado da bateria) e permite codificar funções.', warn: 'Codificação requer licença estendida (gratuita, renovável). Faça sempre backup dos módulos antes.' },
    { title: 'Codificações populares', how: 'FORScan ▸ Configuração e Programação ▸ módulo respetivo (BCM, IC, ABS…).', what: 'Desativar i-Stop por defeito; desativar aviso sonoro do cinto; ativar luzes diurnas/piscas sequenciais (se suportado); ativar fecho ao andar; mostrar temperatura do refrigerante; indicador de regeneração DPF.', warn: 'Pode afetar a garantia e algumas alterações (cinto, luzes) podem ser ilegais em estrada.' }
  ]}
];

const WARNING_LIGHTS = [
  { icon: '🔴', name: 'Aviso de travões', color: 'red', meaning: 'Nível baixo do líquido de travões ou avaria no sistema / travão de mão acionado.', action: 'Pare em segurança. Não conduza se o pedal estiver "esponjoso".' },
  { icon: '🛢️', name: 'Pressão do óleo', color: 'red', meaning: 'Pressão de óleo do motor insuficiente.', action: 'Pare imediatamente e desligue o motor. Verifique o nível. Não conduza.' },
  { icon: '🌡️', name: 'Temperatura do motor (vermelho)', color: 'red', meaning: 'Sobreaquecimento do motor.', action: 'Pare, deixe o motor ao ralenti 1–2 min e desligue. Não abra o vaso quente.' },
  { icon: '🔋', name: 'Sistema de carga', color: 'red', meaning: 'Alternador ou bateria não está a carregar.', action: 'Desligue consumidores e vá à oficina. Verifique correia.' },
  { icon: '💺', name: 'Airbag / pré-tensores', color: 'red', meaning: 'Avaria no sistema de airbags.', action: 'Oficina o mais breve possível: os airbags podem não disparar.' },
  { icon: '⚙️', name: 'Direção assistida (EPS)', color: 'red', meaning: 'Avaria na direção assistida elétrica.', action: 'A direção fica pesada. Conduza com cuidado até à oficina.' },
  { icon: '❗', name: 'Aviso principal (triângulo)', color: 'amber', meaning: 'Há uma mensagem no ecrã de informação.', action: 'Leia a mensagem no painel/ecrã central.' },
  { icon: '🟡', name: 'Verificar motor (check engine)', color: 'amber', meaning: 'Avaria no sistema de gestão do motor ou emissões.', action: 'Fixa: oficina em breve. A piscar: falha de ignição – reduza velocidade e vá à oficina.' },
  { icon: '🅰️', name: 'ABS', color: 'amber', meaning: 'Avaria no ABS; travões normais continuam a funcionar.', action: 'Oficina. Evite travagens bruscas em piso molhado.' },
  { icon: '〰️', name: 'DSC (controlo de estabilidade)', color: 'amber', meaning: 'A piscar: DSC/TCS a atuar. Fixa: avaria.', action: 'A piscar: reduza a velocidade. Fixa: oficina.' },
  { icon: '🚫', name: 'DSC OFF', color: 'amber', meaning: 'Controlo de tração desligado pelo condutor.', action: 'Prima o botão DSC OFF para reativar.' },
  { icon: '🛞', name: 'Pressão dos pneus (TPMS)', color: 'amber', meaning: 'Fixa: pressão baixa. A piscar ~1 min e fica fixa: avaria do sistema.', action: 'Verifique pressões a frio, acerte e inicialize o TPMS.' },
  { icon: '🔧', name: 'Manutenção (chave inglesa)', color: 'amber', meaning: 'Manutenção programada / troca de óleo próxima.', action: 'Marque revisão. Depois reponha o aviso (ver Códigos secretos).' },
  { icon: '🛢️', name: 'Nível/diluição do óleo (diesel)', color: 'amber', meaning: 'Óleo diluído por gasóleo após muitas regenerações do DPF.', action: 'Trocar o óleo e repor a vida do óleo.' },
  { icon: '🌫️', name: 'DPF (filtro de partículas)', color: 'amber', meaning: 'Filtro com muita fuligem.', action: 'Conduza 15–20 min a > 60 km/h. Se persistir: oficina.' },
  { icon: '🌀', name: 'Velas de incandescência (diesel)', color: 'amber', meaning: 'Pré-aquecimento. Se piscar com o motor a trabalhar: avaria.', action: 'Aguarde que apague antes de arrancar.' },
  { icon: '💧', name: 'AdBlue', color: 'amber', meaning: 'Nível de AdBlue baixo ou avaria SCR.', action: 'Reabastecer. Com nível a zero o motor pode não voltar a arrancar.' },
  { icon: '⛽', name: 'Reserva de combustível', color: 'amber', meaning: 'Restam cerca de 8–10 L.', action: 'Abasteça brevemente.' },
  { icon: '🅿️', name: 'Travão de mão elétrico (EPB)', color: 'amber', meaning: 'Avaria no travão de estacionamento elétrico.', action: 'Use a mudança P / 1.ª e calços. Oficina.' },
  { icon: '🔄', name: 'AWD', color: 'amber', meaning: 'Avaria no sistema i-Activ AWD ou sobreaquecimento.', action: 'Pare para arrefecer. Se persistir: oficina.' },
  { icon: '🅰️', name: 'i-Stop (âmbar)', color: 'amber', meaning: 'Avaria no sistema i-Stop (frequentemente bateria fraca).', action: 'Testar a bateria.' },
  { icon: '🟢', name: 'i-Stop (verde)', color: 'green', meaning: 'Motor parado automaticamente pelo i-Stop.', action: 'Normal. Liberte o travão para arrancar.' },
  { icon: '🚗', name: 'SCBS / SBS (travagem automática)', color: 'amber', meaning: 'Sistema de travagem de emergência desligado ou câmara/radar obstruído.', action: 'Limpe o para-brisas/emblema frontal. Se persistir: oficina.' },
  { icon: '↔️', name: 'LDWS / LAS (faixa de rodagem)', color: 'amber', meaning: 'Aviso de saída de faixa indisponível ou avaria.', action: 'Limpe a zona da câmara no para-brisas.' },
  { icon: '👁️', name: 'BSM (ângulo morto)', color: 'amber', meaning: 'Sistema de ângulo morto desligado/avaria (sensores sujos).', action: 'Limpe o para-choques traseiro.' },
  { icon: '🔑', name: 'Chave (i-key)', color: 'amber', meaning: 'Chave não detetada ou pilha fraca.', action: 'Troque a pilha CR2025; encoste a chave ao botão START.' },
  { icon: '💡', name: 'Avaria das luzes LED / AFS', color: 'amber', meaning: 'Avaria nos faróis LED ou nos faróis adaptativos.', action: 'Oficina.' },
  { icon: '⚡', name: 'i-ELOOP', color: 'amber', meaning: 'Avaria no sistema de regeneração de energia (condensador).', action: 'Oficina.' },
  { icon: '🔺', name: 'Transmissão automática', color: 'amber', meaning: 'Avaria ou temperatura elevada do óleo da caixa.', action: 'Pare e deixe arrefecer. Se persistir: oficina.' }
];

const DTC_CODES = [
  ['P0011', 'Árvore de cames de admissão – posição avançada / desempenho', 'Óleo velho/nível baixo, válvula VVT.'],
  ['P0016', 'Correlação cambota / árvore de cames', 'Corrente de distribuição esticada, sensores.'],
  ['P0087', 'Pressão na rampa de combustível demasiado baixa', 'Filtro de combustível (diesel), bomba de alta pressão.'],
  ['P0088', 'Pressão na rampa de combustível demasiado alta', 'Regulador/sensor de pressão.'],
  ['P0101', 'Sensor de fluxo de ar (MAF) – desempenho', 'Sensor sujo, fuga de admissão, filtro de ar.'],
  ['P0113', 'Sensor de temperatura do ar de admissão – sinal alto', 'Ficha/sensor.'],
  ['P0117', 'Sensor temperatura do refrigerante – sinal baixo', 'Sensor/cablagem.'],
  ['P0128', 'Temperatura do refrigerante abaixo do termóstato', 'Termóstato aberto.'],
  ['P0130', 'Sonda lambda (montante) – circuito', 'Sonda A/F, cablagem.'],
  ['P0171', 'Mistura pobre (banco 1)', 'Fuga de vácuo, MAF sujo, injetores, pressão de combustível.'],
  ['P0172', 'Mistura rica (banco 1)', 'Injetor a pingar, MAF, sonda.'],
  ['P0300', 'Falhas de ignição aleatórias', 'Velas, bobinas, injetores, compressão.'],
  ['P0301', 'Falha de ignição cilindro 1', 'Trocar bobina com outro cilindro para testar.'],
  ['P0302', 'Falha de ignição cilindro 2', 'Idem.'],
  ['P0303', 'Falha de ignição cilindro 3', 'Idem.'],
  ['P0304', 'Falha de ignição cilindro 4', 'Idem.'],
  ['P0335', 'Sensor de posição da cambota', 'Sensor, roda fónica, cablagem.'],
  ['P0340', 'Sensor de posição da árvore de cames', 'Sensor/cablagem.'],
  ['P0380', 'Velas de incandescência – circuito', 'Vela queimada, relé/módulo.'],
  ['P0401', 'EGR – caudal insuficiente', 'Válvula/ refrigerador EGR com carbono.'],
  ['P0403', 'EGR – circuito de controlo', 'Válvula EGR, cablagem.'],
  ['P0420', 'Eficiência do catalisador abaixo do limite', 'Catalisador, sonda jusante, fuga escape.'],
  ['P0442', 'EVAP – pequena fuga', 'Tampão do depósito mal fechado, tubos.'],
  ['P0455', 'EVAP – fuga grande', 'Tampão do depósito, válvula purga.'],
  ['P0500', 'Sensor de velocidade do veículo', 'Sensor ABS / cablagem.'],
  ['P0505', 'Controlo de ralenti', 'Corpo de borboleta sujo.'],
  ['P0521', 'Sensor de pressão de óleo – desempenho', 'Diesel: nível de óleo alto por diluição. Sensor.'],
  ['P0562', 'Tensão do sistema baixa', 'Bateria fraca, alternador.'],
  ['P0571', 'Interruptor das luzes de travão', 'Interruptor desafinado/avariado.'],
  ['P0597', 'Termóstato – circuito de controlo', 'Termóstato eletrónico.'],
  ['P0606', 'Processador do módulo de controlo (PCM)', 'Atualização de software ou PCM.'],
  ['P0700', 'Avaria da transmissão (ver TCM)', 'Ler códigos do módulo da caixa.'],
  ['P0741', 'Embraiagem do conversor de binário – desempenho', 'ATF degradado, solenoide.'],
  ['P2002', 'Eficiência do DPF abaixo do limite', 'DPF danificado, sensor diferencial.'],
  ['P2096', 'Correção de combustível pós-catalisador – pobre', 'Fuga de escape, sonda.'],
  ['P20EE', 'Eficiência do catalisador SCR abaixo do limite', 'AdBlue de má qualidade, injetor AdBlue.'],
  ['P2187', 'Mistura pobre ao ralenti', 'Fuga de vácuo, PCV.'],
  ['P2228', 'Sensor de pressão barométrica – sinal baixo', 'PCM/sensor.'],
  ['P242F', 'Restrição do DPF – acumulação de cinza', 'DPF no fim da vida – limpeza/substituição.'],
  ['P2459', 'Frequência de regeneração do DPF demasiado alta', 'Trajetos curtos, sensor de pressão, injetores.'],
  ['P2463', 'DPF – acumulação de fuligem', 'Regeneração forçada; evitar trajetos curtos.'],
  ['P2BAD', 'NOx excessivo – causa desconhecida', 'Sistema SCR/AdBlue.'],
  ['U0073', 'Barramento CAN desligado', 'Cablagem, módulo em curto.'],
  ['U0100', 'Comunicação perdida com o PCM', 'Bateria, cablagem CAN, PCM.'],
  ['U0121', 'Comunicação perdida com o ABS', 'Bateria fraca (muito comum no arranque), módulo ABS.'],
  ['U0155', 'Comunicação perdida com o painel de instrumentos', 'Ficha do painel, bateria.'],
  ['C0035', 'Sensor de velocidade roda dianteira esquerda', 'Sensor sujo/avariado, rolamento.'],
  ['C0040', 'Sensor de velocidade roda dianteira direita', 'Idem.'],
  ['B1342', 'Módulo de airbag – avaria interna', 'Módulo SAS.'],
  ['B10A2', 'Colisão detetada no módulo', 'Reposição na oficina.']
];

const SPECS = [
  { group: 'Motor e fluidos', rows: [
    ['Óleo – gasolina (Skyactiv-G)', '0W-20 (ACEA C5 / API SP). ≈ 4,2 L (2.0) / ≈ 4,5 L (2.5) com filtro'],
    ['Óleo – diesel (Skyactiv-D 2.2)', '0W-30 low-SAPS para DPF (Mazda Dexelia / ACEA C2). ≈ 5,1 L com filtro'],
    ['Binário do bujão do cárter', '≈ 30–41 N·m (anilha nova)'],
    ['Filtro de óleo (ref. Mazda)', 'Gasolina PE01-14-302B · Diesel SH01-14-302B'],
    ['Líquido de refrigeração', 'Mazda FL22 (verde) ≈ 7,5 L'],
    ['Líquido de travões', 'DOT 3 / DOT 4'],
    ['Caixa automática', 'Mazda ATF FZ'],
    ['Diferencial traseiro / transfer (AWD)', 'SAE 80W-90 API GL-5'],
    ['Depósito de combustível', '56 L (2WD) · 58 L (AWD) – KF']
  ]},
  { group: 'Pneus e rodas', rows: [
    ['Medidas comuns', '225/65 R17 · 225/55 R19'],
    ['Pressão', 'Ver etiqueta no pilar da porta do condutor (tipicamente 2,3–2,5 bar a frio)'],
    ['Aperto das porcas', '108–147 N·m (chave 21 mm), em cruz'],
    ['Profundidade mínima legal', '1,6 mm (recomendado trocar aos 3 mm)'],
    ['Pneu suplente', 'Kit anti-furo na maioria das versões']
  ]},
  { group: 'Elétrico', rows: [
    ['Bateria', 'EFB/AGM para i-Stop (ex.: Q-85 / S-95 diesel). Confirmar etiqueta'],
    ['Pilha da chave', 'CR2025'],
    ['Ficha OBD-II', 'Debaixo do tablier, lado do condutor'],
    ['Caixa de fusíveis', 'Compartimento do motor + lado esquerdo do habitáculo (tampa junto aos pés)']
  ]},
  { group: 'Exterior', rows: [
    ['Escovas dianteiras', '≈ 600 mm (condutor) + 450 mm (passageiro)'],
    ['Escova traseira', '≈ 300 mm'],
    ['Iluminação', 'LED na maioria das versões KF; halogéneo H11 nas versões base KE']
  ]}
];

const CHECKLISTS = {
  'Antes de uma viagem': ['Pressão dos pneus (incl. carga)', 'Nível de óleo', 'Líquido de refrigeração', 'Líquido limpa-vidros', 'Luzes e piscas', 'Escovas', 'Triângulo e colete', 'Kit anti-furo / suplente', 'Documentos (DUA, seguro, IPO)', 'Carregar portagens / Via Verde'],
  'Preparar o inverno': ['Testar bateria', 'Anticongelante FL22 ok', 'Líquido limpa-vidros com anticongelante', 'Pneus de inverno / all-season', 'Escovas novas', 'Luzes de nevoeiro', 'Raspador de gelo', 'Correntes de neve (se necessário)'],
  'Preparar o verão': ['Ar condicionado a arrefecer bem', 'Filtro do habitáculo', 'Nível do refrigerante', 'Pressão dos pneus', 'Proteção solar do tablier'],
  'Antes da inspeção (IPO)': ['Todas as luzes a funcionar', 'Sem luzes de aviso no painel', 'Pneus > 1,6 mm e sem danos', 'Para-brisas sem fissuras no campo de visão', 'Escovas e esguicho a funcionar', 'Buzina', 'Travão de mão', 'Matrículas legíveis', 'Cintos de segurança', 'Sem fugas de óleo', 'Triângulo e colete no carro'],
  'Comprar um CX-5 usado': ['Livro de revisões carimbado', 'Histórico de óleo (diesel: diluição)', 'Ruído de corrente/distribuição a frio', 'Teste do i-Stop', 'Mudanças suaves (caixa auto)', 'Funcionamento Mazda Connect / ecrã tátil', 'Sem códigos de erro (OBD)', 'Discos sem rebordo', 'Desgaste irregular dos pneus', 'Ar condicionado', 'Campanhas de recolha (recall) feitas']
};

const TIPS = [
  'Diesel: evite só trajetos curtos – o DPF precisa de regenerar. Faça regularmente 20 min de estrada/autoestrada.',
  'Diesel: verifique o nível do óleo com frequência. Se SUBIR, é diluição por gasóleo – troque o óleo.',
  'O i-Stop desativa-se sozinho quando a bateria está fraca – é um bom indicador do estado da bateria.',
  'O Mazda Connect atualiza-se no concessionário ou por USB; versões recentes trazem Android Auto / CarPlay.',
  'Os sensores do SCBS/radar ficam atrás do para-brisas e do emblema frontal: mantenha-os limpos.',
  'Use apenas líquido de refrigeração FL22 – misturar com outros reduz a proteção.',
  'Os pneus devem ser trocados aos pares no mesmo eixo; no AWD, os quatro iguais.',
  'Após trocar a bateria, reaprenda os vidros automáticos e o ponto zero do volante (rodar de batente a batente).',
  'Guarde as faturas: o histórico completo valoriza o carro na revenda.'
];
