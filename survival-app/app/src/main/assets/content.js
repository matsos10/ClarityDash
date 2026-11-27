/* Conteúdo offline do guia de sobrevivência */
window.GUIDE = [
{ id:'prioridades', ic:'⚠️', t:'Prioridades & Regra dos 3', a:[
{ id:'regra3', t:'Regra dos 3', h:`
<p>Em sobrevivência, um ser humano consegue aguentar aproximadamente:</p>
<table><tr><th>3 minutos</th><td>sem ar (ou em água gelada sem controlo da respiração)</td></tr>
<tr><th>3 horas</th><td>sem abrigo em clima extremo (frio, chuva, vento, calor)</td></tr>
<tr><th>3 dias</th><td>sem água</td></tr>
<tr><th>3 semanas</th><td>sem comida</td></tr></table>
<p>Use esta ordem para decidir o que fazer primeiro. Uma pessoa encharcada ao vento morre de hipotermia muito antes de morrer de fome.</p>
<div class="tip">Ordem típica: <b>Segurança imediata → Primeiros socorros → Abrigo/temperatura → Sinalização → Água → Fogo → Comida → Navegação</b>.</div>`},
{ id:'stop', t:'Método S.T.O.P. (está perdido?)', h:`
<ol><li><b>S – Stop (Pare).</b> Sente-se. Não continue a andar às cegas. O pânico mata mais do que os elementos.</li>
<li><b>T – Think (Pense).</b> Como chegou aqui? Quem sabe onde está? Quantas horas de luz restam?</li>
<li><b>O – Observe.</b> Avalie o terreno, o tempo, recursos, ferimentos, equipamento, água próxima.</li>
<li><b>P – Plan (Planeie).</b> Decida: ficar e sinalizar (geralmente melhor se alguém sabe o seu itinerário) ou mover-se com um objetivo claro.</li></ol>
<div class="warn">Se deixou um plano de viagem com alguém, <b>fique onde está</b>. As equipas de resgate procuram primeiro ao longo do percurso previsto.</div>`},
{ id:'mentalidade', t:'Psicologia de sobrevivência', h:`
<p>A vontade de viver é o fator mais determinante. Inimigos psicológicos: medo, ansiedade, raiva, frustração, depressão, solidão, tédio, culpa.</p>
<ul><li><b>Respiração tática:</b> inspire 4 s, segure 4 s, expire 4 s, segure 4 s. Repita 4 vezes.</li>
<li>Divida o problema em tarefas pequenas e concretas. Cumpra uma de cada vez.</li>
<li>Crie rotina: horário para água, lenha, sinalização, descanso.</li>
<li>Mantenha um registo (use o <b>Diário</b> da app).</li>
<li>Em grupo: atribua papéis, partilhe decisões, vigie sinais de hipotermia e desidratação nos outros (confusão e irritabilidade são sinais precoces).</li></ul>
<p>Acrónimo <b>SURVIVAL</b>: Size up (avaliar) · Use todos os sentidos · Remember onde está · Vanquish o medo · Improvise · Value a vida · Act como os locais · Live by your wits (aprenda as técnicas).</p>`},
{ id:'plano', t:'Plano de viagem / preparação', h:`
<ul><li>Deixe a alguém de confiança: percurso, pontos de partida/chegada, hora limite de regresso, nº de pessoas, cor da roupa e tenda, matrícula do carro.</li>
<li>Combine: “se não der notícias até às HH:MM, ligue 112”.</li>
<li>Verifique a meteorologia e a hora do pôr do sol (ver <b>Sol & Lua</b>).</li>
<li>Leve mapa em papel e bússola – baterias acabam.</li>
<li>Carregue o telefone e leve powerbank. Ative modo de poupança de energia.</li>
<li>Descarregue mapas offline antes de sair.</li></ul>`}
]},
{ id:'agua', ic:'💧', t:'Água', a:[
{ id:'necessidades', t:'Necessidades de água', h:`
<p>Mínimo: <b>2–3 litros por pessoa por dia</b> em repouso e clima ameno. Com calor e esforço físico: <b>4–6+ litros</b>. Reserva doméstica recomendada: <b>4 L/pessoa/dia</b> (beber + cozinhar + higiene mínima) durante pelo menos 3 dias, idealmente 14.</p>
<p><b>Sinais de desidratação:</b> urina escura e escassa, sede, dor de cabeça, tonturas, cansaço, irritabilidade; grave: confusão, pulso rápido, pele sem elasticidade, sem urina.</p>
<div class="tip">Racione suor, não água: evite esforço nas horas de calor, fique à sombra, respire pelo nariz, não fale desnecessariamente. Beba quando tem sede se tiver água.</div>
<div class="danger-box">Não beba água do mar nem urina. Não beba álcool. Se tiver pouca água, coma pouco (a digestão gasta água), sobretudo proteínas.</div>`},
{ id:'encontrar', t:'Encontrar água', h:`
<ul><li>Siga o terreno para baixo: vales, ravinas, fundo de encostas.</li>
<li>Vegetação verde e densa, juncos, salgueiros, choupos indicam água próxima.</li>
<li>Trilhos de animais convergentes e voo de pássaros ao amanhecer/entardecer (pombos, rolas) muitas vezes levam a água.</li>
<li>Insetos (abelhas, mosquitos) indicam água perto.</li>
<li>Cave na parte exterior da curva de um rio seco, onde a areia está húmida.</li>
<li><b>Chuva:</b> recolha com lona, plástico, folhas grandes, roupa. Água da chuva recolhida limpa é das mais seguras.</li>
<li><b>Orvalho:</b> passe um pano pela erva ao amanhecer e torça-o.</li>
<li><b>Neve/gelo:</b> derreta antes de consumir (comer neve baixa a temperatura corporal). Gelo dá mais água que neve.</li>
<li><b>Transpiração vegetal:</b> saco plástico atado à volta de um ramo com folhas ao sol; recolhe-se água no fundo após horas.</li>
<li><b>Destilador solar:</b> buraco de ~1 m, recipiente no centro, plástico por cima com pedra no meio – produz pouco (0,5 L/dia), útil para dessalinizar.</li></ul>`},
{ id:'purificar', t:'Purificar água', h:`
<p>Toda a água natural deve ser considerada contaminada (bactérias, vírus, protozoários como Giardia).</p>
<h3>1. Pré-filtrar</h3><p>Deixe assentar e passe por um pano (t-shirt, meia) para retirar sedimentos. Filtro improvisado: garrafa cortada com camadas (de baixo para cima) pano, carvão triturado, areia fina, areia grossa, cascalho. <b>Isto não desinfeta</b>, só clarifica.</p>
<h3>2. Desinfetar</h3>
<table><tr><th>Ferver</th><td>Fervura em cachão <b>1 minuto</b> (3 minutos acima de 2000 m de altitude). Método mais fiável.</td></tr>
<tr><th>Lixívia</th><td>Lixívia doméstica <b>sem perfume</b> (hipoclorito de sódio 5–6%): <b>2 gotas por litro</b> (4 gotas se turva ou muito fria). Agitar e esperar <b>30 minutos</b>. Deve cheirar ligeiramente a cloro; se não, repetir dose e esperar mais 15 min. Ver calculadora.</td></tr>
<tr><th>Pastilhas</th><td>Cloro ou dióxido de cloro: seguir instruções (30 min a 4 h). Dióxido de cloro é eficaz contra Cryptosporidium.</td></tr>
<tr><th>SODIS (solar)</th><td>Garrafas PET transparentes ≤2 L, água limpa (não turva), ao sol direto <b>6 horas</b> (2 dias se nublado).</td></tr>
<tr><th>Filtros</th><td>Filtros de 0,1–0,2 µm removem bactérias e protozoários, mas normalmente não vírus.</td></tr></table>
<div class="danger-box">Água com contaminação química (combustível, resíduos industriais, mineira) <b>não fica segura</b> com fervura nem cloro. Procure outra fonte.</div>`}
]},
{ id:'fogo', ic:'🔥', t:'Fogo', a:[
{ id:'triangulo', t:'Princípios do fogo', h:`
<p>O fogo precisa de <b>calor + combustível + oxigénio</b>. Prepare tudo ANTES de acender:</p>
<ol><li><b>Isca (tinder):</b> material fino e seco que pega com uma faísca: algodão com vaselina, casca de bétula, erva seca, ninho de fibras, aparas finas, resina, cotão da máquina de secar, palha-de-aço (com pilha 9V).</li>
<li><b>Gravetos (kindling):</b> pauzinhos da espessura de um fósforo até à de um lápis. Recolha o dobro do que pensa precisar.</li>
<li><b>Combustível:</b> paus do tamanho do pulso e maiores, lenha morta e seca que estala ao partir.</li></ol>
<div class="tip">Procure lenha morta ainda presa às árvores (não no chão húmido). O interior de troncos mortos costuma estar seco. Faça “feather sticks” (aparas encaracoladas) com a faca.</div>
<p>Escolha local abrigado do vento, longe de raízes, ramos baixos e erva seca. Limpe 3 m à volta. Em solo húmido ou neve, faça uma plataforma de paus.</p>
<div class="danger-box">Em Portugal, fazer fogo em espaços rurais é proibido durante o período crítico de incêndios e em dias de risco elevado. Use-o só em emergência real e nunca o deixe sem vigilância.</div>`},
{ id:'acender', t:'Métodos de ignição', h:`
<ul><li><b>Isqueiro / fósforos à prova de água</b> – sempre leve dois métodos.</li>
<li><b>Ferrocério (pederneira):</b> raspe com força para baixo, mantendo a vara fixa junto da isca e puxando o raspador para trás.</li>
<li><b>Lupa / lente / garrafa com água / fundo de lata polido</b> – concentrar o sol num ponto da isca escura.</li>
<li><b>Pilha + palha-de-aço:</b> toque os dois polos de uma pilha 9V (ou duas AA em série) na palha-de-aço fina.</li>
<li><b>Arco de fricção (bow drill):</b> fuso de madeira macia e seca, tábua com entalhe em V, arco com cordão, pega de pedra/madeira dura. Exige prática.</li>
<li><b>Pastilhas de combustível, vela</b> – a vela prolonga a chama dos fósforos.</li></ul>`},
{ id:'tipos', t:'Tipos de fogueira', h:`
<table><tr><th>Tipi</th><td>Gravetos em cone sobre a isca. Pega rápido, boa luz e calor. Ideal para iniciar.</td></tr>
<tr><th>Cabana (log cabin)</th><td>Paus em quadrado empilhado. Estável, boa para cozinhar e brasas.</td></tr>
<tr><th>Estrela</th><td>Troncos em estrela empurrados para o centro à medida que ardem. Poupa lenha toda a noite.</td></tr>
<tr><th>Buraco Dakota</th><td>Dois buracos ligados por túnel. Pouco fumo, pouca visibilidade, eficiente e resistente ao vento.</td></tr>
<tr><th>Refletor</th><td>Parede de troncos/pedras atrás do fogo reflete calor para o abrigo.</td></tr></table>
<div class="danger-box">Não use pedras de leitos de rio junto ao fogo: podem explodir com o vapor. Nunca faça fogo dentro de abrigos fechados (monóxido de carbono).</div>`}
]},
{ id:'abrigo', ic:'⛺', t:'Abrigo & Temperatura', a:[
{ id:'principios', t:'Princípios do abrigo', h:`
<ul><li>Perde-se calor por <b>condução</b> (chão frio – o maior inimigo), <b>convecção</b> (vento), <b>evaporação</b> (roupa molhada, suor), <b>radiação</b> (céu aberto à noite).</li>
<li><b>Isolamento do chão primeiro:</b> 20–30 cm de folhas secas, agulhas de pinheiro, ramos, mochila, cordas.</li>
<li>Pequeno = quente. O abrigo deve ter o tamanho mínimo para o corpo.</li>
<li>Local: protegido do vento, longe de leitos de cheia, de árvores mortas (“widowmakers”), de quedas de pedras e do fundo de vales (ar frio acumula-se lá). Perto de lenha e água, mas não colado à água.</li>
<li>Visível para resgate (ou coloque sinais visíveis perto).</li></ul>
<div class="tip">Roupa: sistema de camadas. Princípio <b>C.O.L.D.</b>: Clean (limpa), avoid Overheating (evitar suar), Loose layers (camadas largas), Dry (seca). Algodão molhado mata: “cotton kills”.</div>`},
{ id:'tipos-abrigo', t:'Abrigos improvisados', h:`
<h3>Lean-to (meia-água)</h3><p>Vara horizontal entre duas árvores à altura do peito; varas inclinadas de um lado (contra o vento); cobrir com ramos, folhas, casca. Funciona bem com fogueira refletora à frente.</p>
<h3>A-frame / Debris hut</h3><p>Vara comprida apoiada num toco ou forquilha, costelas dos dois lados, e uma camada espessa (60 cm+) de folhas. Não precisa de fogo. Entre com os pés primeiro e tape a entrada com folhas.</p>
<h3>Lona / poncho</h3><p>Corda esticada entre árvores, lona por cima em “A”, cantos presos com estacas. Ou meia-água com a lona.</p>
<h3>Neve</h3><p>Trincheira de neve ou buraco junto à base de um pinheiro (tree well). Faça orifício de ventilação. A neve isola bem.</p>
<h3>Urbano / veículo</h3><p>Fique no veículo se estiver avariado em tempestade de neve; ligue o motor 10 min/hora com o escape desobstruído e janela entreaberta. Use mantas térmicas.</p>`},
{ id:'hipotermia', t:'Hipotermia', h:`
<p><b>Ligeira</b> (35–32 °C): tremores intensos, mãos desajeitadas, pele fria. <b>Moderada</b> (32–28 °C): tremores param, confusão, fala arrastada, sonolência, tropeçar. <b>Grave</b> (&lt;28 °C): inconsciência, respiração e pulso muito lentos.</p>
<h3>Atuação</h3><ol><li>Abrigar do vento e chuva. Isolar do chão.</li>
<li>Tirar roupa molhada, vestir seca; cobrir cabeça e pescoço; manta térmica + saco-cama.</li>
<li>Se consciente e capaz de engolir: bebidas quentes açucaradas (sem álcool) e comida.</li>
<li>Calor no tronco (axilas, peito, virilhas) com garrafas de água quente embrulhadas. Contacto pele-com-pele no saco-cama.</li>
<li>Manusear <b>com muito cuidado</b> nos casos graves (risco de arritmia), manter deitado. Ligar 112.</li></ol>
<div class="danger-box">Não esfregue membros, não dê álcool, não aqueça braços e pernas primeiro. Uma pessoa com hipotermia grave não está morta até estar quente e morta: faça RCP se não respirar.</div>`},
{ id:'calor', t:'Golpe de calor & exaustão', h:`
<p><b>Exaustão pelo calor:</b> suor abundante, pele fria e húmida, fraqueza, náuseas, dor de cabeça, cãibras. → Sombra, deitar, elevar pernas, arrefecer, beber água com um pouco de sal/açúcar.</p>
<p><b>Golpe de calor (emergência!):</b> temperatura &gt;40 °C, pele quente (seca ou não), confusão, convulsões, perda de consciência. → Ligue 112. Arrefecer <b>imediatamente</b>: imergir em água fria se possível, ou molhar e abanar, gelo no pescoço, axilas e virilhas.</p>
<div class="tip">Prevenção: evite esforço entre 11h e 17h, use chapéu e roupa clara e larga, beba regularmente.</div>`},
{ id:'congelamento', t:'Queimaduras pelo frio', h:`
<p>Pele branca/acinzentada, dura, dormente (dedos, nariz, orelhas). Reaquecer apenas se não houver risco de voltar a congelar: imergir em água morna (37–39 °C) 15–30 min. Não esfregar, não usar calor direto, não rebentar bolhas. Não caminhar com pés descongelados se possível.</p>`}
]},
{ id:'socorros', ic:'⛑️', t:'Primeiros Socorros', a:[
{ id:'avaliacao', t:'Avaliação inicial (SAV / ABC)', h:`
<ol><li><b>Segurança:</b> o local é seguro para si? Não se torne a 2ª vítima.</li>
<li><b>Resposta:</b> “Está bem?” – toque nos ombros.</li>
<li><b>Ligue 112</b> (ou peça a alguém). Use o altifalante.</li>
<li><b>Hemorragias graves</b> primeiro (sangue a jorrar ou a encharcar).</li>
<li><b>A – Via aérea:</b> inclinar a cabeça para trás e elevar o queixo.</li>
<li><b>B – Respiração:</b> ver, ouvir e sentir até 10 segundos.</li>
<li><b>C – Circulação:</b> se não respira normalmente → <b>RCP</b> (ver Metrónomo RCP).</li>
<li>Se respira e está inconsciente → <b>Posição Lateral de Segurança</b>.</li></ol>`},
{ id:'rcp', t:'RCP – Reanimação (adulto)', h:`
<ol><li>Vítima de costas em superfície dura.</li>
<li>Mãos entrelaçadas no centro do peito (metade inferior do esterno).</li>
<li>Braços esticados, ombros por cima das mãos.</li>
<li>Comprimir <b>5–6 cm</b> de profundidade, a <b>100–120 por minuto</b>. Deixe o peito subir totalmente.</li>
<li><b>30 compressões : 2 insuflações</b> (se treinado e disposto). Senão, só compressões contínuas.</li>
<li>Se houver DAE (desfibrilhador), ligue-o e siga as instruções de voz.</li>
<li>Não pare até chegar ajuda, a vítima recuperar ou ficar exausto. Troque de reanimador a cada 2 min se possível.</li></ol>
<p><b>Criança:</b> 1 ou 2 mãos, 1/3 do peito (~5 cm); comece com 5 insuflações. <b>Bebé:</b> 2 dedos, ~4 cm.</p>
<p><a href="#/rcp" class="btn primary">Abrir metrónomo RCP</a></p>`},
{ id:'hemorragia', t:'Hemorragias', h:`
<ol><li>Luvas se possível. <b>Pressão direta</b> firme sobre a ferida com compressa/pano, durante 10 minutos sem levantar.</li>
<li>Se encharcar, adicione mais pano por cima – não retire o primeiro.</li>
<li>Para feridas profundas (axila, virilha, pescoço): encha a ferida de gaze (packing) e comprima.</li>
<li><b>Garrote</b> (torniquete) em hemorragia de membro que ameaça a vida e não para com pressão: 5–7 cm acima da ferida (nunca na articulação), apertar até parar o sangramento. <b>Anotar a hora</b> (na testa/garrote). Não desapertar.</li>
<li>Deitar a vítima, manter quente (prevenir choque).</li></ol>
<p><b>Hemorragia nasal:</b> sentar inclinado para a frente, apertar a parte mole do nariz 10–15 min.</p>`},
{ id:'choque', t:'Choque', h:`
<p>Sinais: pele pálida, fria e suada, pulso rápido e fraco, respiração rápida, sede, ansiedade, confusão.</p>
<ul><li>Deitar; elevar as pernas ~30 cm (se não houver lesão da coluna/pernas).</li>
<li>Tratar a causa (hemorragia). Manter quente, isolar do chão.</li>
<li>Não dar de beber nem comer. Tranquilizar. Ligar 112.</li></ul>`},
{ id:'feridas', t:'Feridas, cortes, bolhas', h:`
<ul><li>Lavar abundantemente com água potável (irrigação com garrafa furada sob pressão).</li>
<li>Retirar sujidade visível. Desinfetar a pele à volta (iodopovidona, clorexidina).</li>
<li>Cortes limpos e pequenos: fechar com tiras adesivas (steri-strips). Feridas sujas, mordeduras e perfurações: <b>não fechar</b>, deixar drenar, pensos.</li>
<li>Sinais de infeção: vermelhidão que se espalha, calor, pus, febre, riscos vermelhos → procurar ajuda médica.</li>
<li><b>Bolhas:</b> proteger com penso/fita antes de rebentarem. Se necessário drenar com agulha esterilizada na borda, manter a pele.</li>
<li>Vacina do tétano em dia!</li></ul>`},
{ id:'fraturas', t:'Fraturas, entorses, luxações', h:`
<ul><li>Sinais de fratura: dor intensa, deformação, incapacidade de usar, inchaço, crepitação.</li>
<li><b>Imobilizar</b> na posição encontrada, incluindo a articulação acima e abaixo. Talas: paus, bastões, revistas enroladas, saco-cama, almofadado com roupa.</li>
<li>Verificar circulação abaixo da tala (cor, temperatura, sensibilidade) – desapertar se necessário.</li>
<li>Fratura exposta: cobrir com penso limpo, não empurrar o osso.</li>
<li>Entorse: <b>RICE</b> – Repouso, Gelo (20 min, com pano), Compressão, Elevação.</li>
<li>Suspeita de lesão da coluna (queda, acidente, dor no pescoço/costas, formigueiro): <b>não mover</b> salvo perigo imediato.</li></ul>`},
{ id:'queimaduras', t:'Queimaduras', h:`
<ol><li>Afastar da fonte. Arrefecer com <b>água corrente fresca durante 20 minutos</b> (não gelo).</li>
<li>Retirar anéis, relógios, roupa não colada.</li>
<li>Cobrir sem apertar com película aderente ou pano limpo e húmido.</li>
<li>Não rebentar bolhas, não aplicar pasta de dentes, manteiga ou óleos.</li>
<li>Procurar ajuda: queimaduras extensas (&gt; palma da mão), na face, mãos, genitais, articulações, químicas, elétricas ou em crianças.</li></ol>`},
{ id:'engasgamento', t:'Engasgamento (asfixia)', h:`
<ol><li>Se consegue tossir: incentivar a tossir.</li>
<li>Se não consegue tossir, falar ou respirar: <b>5 pancadas nas costas</b> entre as omoplatas, com a pessoa inclinada para a frente.</li>
<li>Depois <b>5 compressões abdominais</b> (manobra de Heimlich): punho acima do umbigo, puxar para dentro e para cima.</li>
<li>Alternar 5+5 até desobstruir. Se ficar inconsciente: 112 e RCP.</li></ol>
<p>Bebés: 5 pancadas nas costas (de bruços no antebraço) + 5 compressões torácicas com 2 dedos.</p>`},
{ id:'pls', t:'Posição Lateral de Segurança', h:`
<ol><li>Ajoelhe-se ao lado da vítima. Braço mais próximo em ângulo reto (palma para cima).</li>
<li>Braço afastado cruzado sobre o peito, costas da mão contra a bochecha mais próxima de si.</li>
<li>Dobre o joelho mais afastado, pé no chão.</li>
<li>Puxe pelo joelho, rolando a vítima para si, mantendo a mão na bochecha.</li>
<li>Ajuste a perna de cima em ângulo reto. Incline a cabeça para trás para manter a via aérea aberta. Vigie a respiração.</li></ol>`},
{ id:'mordeduras', t:'Mordeduras & picadas', h:`
<h3>Víbora (em Portugal: víbora-cornuda, víbora-de-Seoane)</h3>
<ul><li>Manter a vítima calma e imóvel; retirar anéis e relógio.</li>
<li>Imobilizar o membro abaixo do nível do coração. Ligar 112 / CIAV <b>800 250 250</b>.</li>
<li><b>Não</b> cortar, não chupar, não aplicar garrote, gelo ou álcool.</li></ul>
<h3>Picada de abelha/vespa</h3><p>Retirar o ferrão raspando (cartão), não com pinça. Frio local. Sinais de <b>anafilaxia</b> (inchaço da cara/língua, dificuldade em respirar, urticária generalizada, desmaio): 112, adrenalina auto-injetável se disponível (coxa, lado externo).</p>
<h3>Carraças</h3><p>Retirar com pinça fina o mais rente à pele possível, puxar devagar e de forma contínua. Não usar óleo, fogo ou álcool. Vigiar febre ou mancha vermelha alargada nas semanas seguintes (doença de Lyme, febre escaro-nodular).</p>
<h3>Peixe-aranha</h3><p>Imergir em água o mais quente que tolerar (sem queimar) 30–90 min.</p>
<h3>Mordedura de animal</h3><p>Lavar com água e sabão 15 min. Procurar médico (raiva, tétano, infeção).</p>`},
{ id:'medicamentos', t:'Kit de primeiros socorros', h:`
<ul><li>Luvas, compressas esterilizadas, ligaduras, adesivo, pensos rápidos, steri-strips</li>
<li>Garrote (tipo CAT), ligadura israelita / de pressão, gaze hemostática</li>
<li>Soro fisiológico, desinfetante (iodopovidona/clorexidina)</li>
<li>Manta térmica, tesoura de trauma, pinça, alfinetes, termómetro</li>
<li>Paracetamol, ibuprofeno, anti-histamínico, antidiarreico, sais de reidratação oral</li>
<li>Medicação pessoal crónica (reserva de 2+ semanas), adrenalina se alérgico</li>
<li>Pomada para queimaduras, creme antibiótico (se prescrito), protetor solar, repelente</li></ul>
<p><b>Soro de reidratação caseiro:</b> 1 L de água potável + 6 colheres de chá rasas de açúcar + ½ colher de chá rasa de sal.</p>`}
]},
{ id:'comida', ic:'🍖', t:'Alimentação', a:[
{ id:'prioridade-comida', t:'Comida em sobrevivência', h:`
<p>Pode viver semanas sem comer. A comida é prioridade baixa no curto prazo, mas a falta de energia reduz a capacidade de pensar e manter o calor.</p>
<ul><li>Necessidade média: 2000–2500 kcal/dia; com frio e esforço 3000–4500 kcal.</li>
<li>Gaste menos energia a procurar comida do que a que ela fornece.</li>
<li>Fontes mais seguras e rentáveis: insetos (cozinhados), peixe, pequenos animais, plantas que <b>conhece com 100% de certeza</b>.</li></ul>`},
{ id:'plantas', t:'Plantas silvestres (cuidado!)', h:`
<div class="danger-box">Muitas plantas mortais parecem comestíveis (ex.: cicuta e embude parecem cenoura-brava/salsa). <b>Nunca coma cogumelos silvestres</b> sem identificação por um especialista – não existe teste caseiro fiável.</div>
<p>Algumas plantas comuns e relativamente fáceis de reconhecer em Portugal/Europa:</p>
<ul><li><b>Urtiga</b> – cozida perde o ardor; muito nutritiva.</li>
<li><b>Dente-de-leão</b> – folhas, flores e raiz comestíveis.</li>
<li><b>Tanchagem</b> – folhas comestíveis; macerada alivia picadas.</li>
<li><b>Beldroega</b>, <b>azedas</b> (com moderação), <b>labaça</b> nova.</li>
<li><b>Amoras-silvestres</b>, <b>medronho</b>, <b>castanhas</b>, <b>bolotas</b> (azinheira; demolhar/lixiviar para tirar taninos), <b>pinhões</b>.</li>
<li><b>Malva</b> – folhas e flores.</li></ul>
<h3>Teste universal de comestibilidade (último recurso)</h3>
<p>Leva cerca de 24 h por parte de planta e não é seguro para plantas muito tóxicas. Jejum de 8 h; testar uma parte de cada vez: cheirar, contacto na pele 15 min, nos lábios 3 min, na língua 15 min, mastigar 15 min sem engolir, engolir pequena porção e esperar 8 h. Qualquer reação → rejeitar.</p>
<p>Evite: plantas com seiva leitosa, sabor amargo ou a sabão, cheiro a amêndoa, bagas brancas ou amarelas, folhas em grupos de três, cogumelos, plantas semelhantes a salsa/cenoura.</p>`},
{ id:'insetos', t:'Insetos & pequenos animais', h:`
<ul><li>Gafanhotos, grilos, larvas de escaravelho, formigas, térmitas: ricos em proteína. <b>Cozinhe sempre</b> (parasitas). Retire pernas e asas.</li>
<li>Evite insetos de cores vivas, peludos, com cheiro forte, lagartas e insetos que picam.</li>
<li>Minhocas: purgar em água limpa e cozinhar.</li>
<li>Caracóis: purgar 2–3 dias, cozinhar bem. Evite os de conchas coloridas e lesmas do mar.</li></ul>`},
{ id:'pesca', t:'Pesca & armadilhas', h:`
<ul><li>Linha e anzol improvisados: alfinete, espinha, arame; isco de minhocas ou insetos. Pesque ao amanhecer e entardecer, em zonas de sombra e remansos.</li>
<li>Armadilha de garrafa para peixe pequeno: garrafa com gargalo invertido.</li>
<li>Laços para pequenos animais em trilhos estreitos (onde legal/emergência real).</li>
<li>Cozinhar bem toda a carne e peixe de água doce.</li></ul>
<div class="warn">Caça e pesca sem licença são ilegais fora de situações de emergência real.</div>`},
{ id:'conservar', t:'Conservação & reservas', h:`
<ul><li>Reserva doméstica mínima: 14 dias de alimentos não perecíveis por pessoa.</li>
<li>Ideais: arroz, massa, leguminosas secas, enlatados (atum, sardinha, feijão, grão), aveia, frutos secos, mel, açúcar, sal, azeite, leite em pó/UHT, bolachas, barras energéticas, conservas de fruta.</li>
<li>Sistema <b>FIFO</b>: primeiro a entrar, primeiro a sair. Registe datas no <b>Inventário</b>.</li>
<li>Sem eletricidade: consumir primeiro o frigorífico (4 h), depois congelador (24–48 h cheio e fechado).</li>
<li>Abrelatas manual, fogão de campismo com gás extra (usar só em exterior ou bem ventilado).</li>
<li>Métodos: secagem ao sol/fumo, salga, fumagem.</li></ul>`}
]},
{ id:'navegacao', ic:'🧭', t:'Orientação & Navegação', a:[
{ id:'bussola', t:'Usar bússola e mapa', h:`
<ul><li>Oriente o mapa: rode-o até o norte do mapa coincidir com o norte da bússola.</li>
<li><b>Declinação magnética</b> em Portugal continental é pequena (~0–2° W em 2025), pode ser ignorada em distâncias curtas.</li>
<li>Rumo: aponte a seta de direção para o objetivo no mapa, rode o limbo até alinhar com as linhas norte do mapa, depois rode o corpo até a agulha coincidir com a seta de orientação.</li>
<li>Escolha pontos de referência intermédios no rumo (árvore, rocha) e avance de um para o outro.</li>
<li>Contagem de passos: conte quantos passos duplos faz em 100 m (normalmente 60–70).</li>
<li>Mantenha a bússola longe de metais, ímanes e telefones.</li></ul>
<p>Use a <b>Bússola</b> e o <b>GPS & Pontos</b> desta app para guardar a posição do acampamento e voltar a ela.</p>`},
{ id:'sem-bussola', t:'Orientar sem bússola', h:`
<h3>Sol</h3><ul><li>Nasce aproximadamente a Este, põe-se a Oeste. No hemisfério norte, ao meio-dia solar está a Sul.</li>
<li><b>Método da sombra:</b> espete um pau, marque a ponta da sombra; espere 15–30 min e marque de novo. A linha da 1ª para a 2ª marca aponta (aprox.) de Oeste para Este.</li>
<li><b>Relógio analógico</b> (hemisfério norte): aponte o ponteiro das horas para o Sol; o Sul fica a meio entre o ponteiro e as 12h (13h no horário de verão).</li></ul>
<h3>Estrelas</h3><ul><li><b>Estrela Polar</b>: prolongue 5× a distância entre as duas estrelas da frente da Ursa Maior. Indica o Norte. A sua altura acima do horizonte ≈ latitude.</li>
<li>Hemisfério sul: Cruzeiro do Sul – prolongue 4,5× o eixo maior.</li>
<li>Orion: a estrela do meio do cinturão nasce quase exatamente a Este.</li></ul>
<h3>Lua</h3><p>Se a Lua nasce antes do pôr-do-sol, o lado iluminado aponta para Oeste; se nasce após a meia-noite, para Este.</p>
<div class="warn">Musgo “a norte” não é fiável. Use vários indícios.</div>`},
{ id:'perdido', t:'Estratégias quando perdido', h:`
<ul><li>Volte ao último ponto conhecido se for seguro.</li>
<li>Siga linhas de referência: rios (para jusante), caminhos, linhas elétricas, cumeadas, vedações.</li>
<li>Suba a um ponto alto para observar (e obter rede de telemóvel).</li>
<li>Em nevoeiro ou à noite: não se mova.</li>
<li>Marque o seu percurso (setas de pedras, ramos partidos, fita).</li>
<li>Pode enviar SMS quando a chamada falha – precisa de menos rede. Tente 112 mesmo sem rede do seu operador.</li></ul>`}
]},
{ id:'sinais', ic:'🆘', t:'Sinalização & Resgate', a:[
{ id:'sinais-sos', t:'Sinais de socorro', h:`
<ul><li><b>Regra dos 3:</b> três de qualquer coisa = pedido de socorro (3 fogueiras em triângulo, 3 apitos, 3 flashes, 3 tiros).</li>
<li><b>SOS em Morse:</b> ··· ––– ··· (curto-curto-curto, longo-longo-longo, curto-curto-curto). Use <a href="#/luz">Lanterna SOS</a>.</li>
<li><b>Apito:</b> 3 apitos longos, pausa de 1 minuto, repetir. Ouve-se muito mais longe que a voz. Use o <a href="#/apito">Apito</a>.</li>
<li><b>Espelho de sinalização:</b> visível a dezenas de km. Aponte com os dedos em “V” para o alvo e faça o reflexo passar por ele. Ecrã do telefone ou CD também servem.</li>
<li><b>Fumo:</b> de dia, fumo branco (folhas verdes, erva húmida sobre o fogo); em neve, fumo escuro (borracha, óleo).</li>
<li><b>Sinais no solo:</b> letras grandes (≥3 m, idealmente 10 m), contrastantes: “SOS”, “V” (preciso de ajuda), “X” (preciso de assistência médica), “→” (fui nesta direção).</li>
<li>Cores vivas (laranja, vermelho) estendidas em zona aberta.</li></ul>`},
{ id:'helicoptero', t:'Helicóptero / aeronave', h:`
<ul><li>Braços em “Y” (para cima) = <b>Sim / preciso de ajuda</b>. Um braço para cima e outro para baixo = <b>Não / não preciso</b>.</li>
<li>Zona de aterragem: plana, livre de obstáculos (≈ 30×30 m), sem objetos soltos.</li>
<li>Aproxime-se só quando a tripulação fizer sinal, pela frente, curvado, nunca pela traseira (rotor de cauda).</li></ul>`},
{ id:'contactos', t:'Comunicar com socorro', h:`
<ul><li><b>112</b> – número europeu de emergência, funciona sem saldo e sem cartão SIM em muitos países.</li>
<li>Diga: <b>Onde</b> (coordenadas da app GPS), <b>o quê</b>, <b>quantas vítimas</b>, <b>estado</b>, <b>número de contacto</b>. Não desligue primeiro.</li>
<li>Poupe bateria: modo avião entre tentativas, brilho mínimo, fechar apps.</li>
<li>Sinais de rádio: canal PMR446 8 (código 0) ou 16 é usado informalmente para emergência; CB canal 9.</li></ul>`}
]},
{ id:'nos', ic:'🪢', t:'Nós & Cordas', a:[
{ id:'nos-essenciais', t:'Nós essenciais', h:`
<table>
<tr><th>Lais de guia (bowline)</th><td>Laço fixo que não aperta. Resgate, amarrar à cintura, prender a árvore. “O coelho sai do buraco, dá a volta à árvore e volta para o buraco.”</td></tr>
<tr><th>Nó em oito</th><td>Nó de travamento na ponta da corda; o “oito duplo/alçado” cria laço resistente (escalada).</td></tr>
<tr><th>Volta do fiel (clove hitch)</th><td>Prender rapidamente uma corda a um poste/árvore. Ajustável.</td></tr>
<tr><th>Nó direito (reef)</th><td>Unir duas pontas da mesma espessura (ligaduras, embrulhos). Não usar para cargas críticas.</td></tr>
<tr><th>Nó de escota (sheet bend)</th><td>Unir duas cordas de espessuras diferentes.</td></tr>
<tr><th>Volta de tensão (taut-line)</th><td>Laço deslizante ajustável para esticar espias de tenda ou lona.</td></tr>
<tr><th>Nó do camionista (trucker's hitch)</th><td>Sistema de roldana para esticar e prender cargas com força.</td></tr>
<tr><th>Prusik</th><td>Nó de fricção que desliza solto e trava com carga – subir corda, sistemas de segurança.</td></tr>
<tr><th>Volta de ribeira (timber hitch)</th><td>Arrastar troncos, iniciar amarrações.</td></tr>
<tr><th>Amarração quadrada</th><td>Unir duas varas em cruz (estruturas de abrigo, macas).</td></tr></table>`},
{ id:'cordas', t:'Cordas improvisadas', h:`
<ul><li>Paracord 550: 7 fios internos utilizáveis para costura, pesca, armadilhas.</li>
<li>Fibras vegetais: urtiga, casca interior de salgueiro/tília, juncos – torcer duas mechas em sentidos opostos (cordame reverso).</li>
<li>Tiras de roupa, sacos de plástico entrançados.</li></ul>`}
]},
{ id:'meteo', ic:'🌦️', t:'Meteorologia', a:[
{ id:'sinais-tempo', t:'Prever o tempo pela natureza', h:`
<ul><li>“Céu vermelho ao anoitecer, bom tempo vem a aparecer; céu vermelho ao amanhecer, chuva vem a caminho.”</li>
<li><b>Cirros</b> (nuvens altas e finas em fios) seguidos de nuvens cada vez mais baixas → frente quente, chuva em 12–24 h.</li>
<li><b>Cumulonimbos</b> (torres altas em forma de bigorna) → trovoada, granizo, rajadas.</li>
<li>Halo à volta do Sol ou da Lua → chuva provável em 24 h.</li>
<li>Pressão a descer rapidamente (&gt; 3 hPa em 3 h) → mau tempo a chegar. Use o <a href="#/barometro">Barómetro</a> se o telefone tiver sensor.</li>
<li>Fumo que desce e se espalha, aves a voar baixo, cheiros mais intensos → humidade e chuva.</li>
<li>Orvalho abundante de manhã → normalmente dia seco.</li></ul>`},
{ id:'trovoada', t:'Trovoadas & raios', h:`
<ul><li>Conte os segundos entre o relâmpago e o trovão ÷ 3 = distância em km. &lt; 10 km (30 s) → procure abrigo. Ver <a href="#/calc">Calculadoras</a>.</li>
<li>Abrigo seguro: edifício sólido ou carro fechado (metálico).</li>
<li>Evite: cumes, árvores isoladas, água, estruturas metálicas, campos abertos.</li>
<li>Se apanhado no exterior: afaste-se do grupo (15 m entre pessoas), agache-se sobre os pés juntos, cabeça baixa, mãos nos ouvidos, isolado do chão (mochila). Não deite no chão.</li>
<li>Espere 30 min após o último trovão.</li></ul>`},
{ id:'vento', t:'Frio e vento', h:`<p>O vento aumenta muito a perda de calor. A 0 °C com vento de 30 km/h a sensação é de cerca de −6 °C. Use a calculadora de <b>sensação térmica</b>.</p>`}
]},
{ id:'catastrofes', ic:'🌋', t:'Catástrofes & Emergências', a:[
{ id:'sismo', t:'Sismo (terramoto)', h:`
<h3>Durante</h3><p><b>BAIXAR – PROTEGER – AGUARDAR.</b> Baixe-se, proteja-se debaixo de uma mesa resistente ou junto a uma parede interior, segure-se. Afaste-se de janelas, espelhos, móveis altos. Não use elevadores. Não corra para a rua durante o abalo. Se estiver na rua: afaste-se de edifícios, postes, árvores. No carro: pare longe de pontes e túneis, fique dentro.</p>
<h3>Depois</h3><ul><li>Conte com réplicas. Verifique ferimentos.</li>
<li>Corte gás, água e eletricidade se houver danos. Não acenda fósforos (fuga de gás).</li>
<li>Saia com calma, calçado, para um local aberto. Use as escadas.</li>
<li>Junto à costa: se o sismo foi forte ou o mar recuar, <b>vá imediatamente para zonas altas</b> (tsunami). Não espere avisos.</li>
<li>Use SMS em vez de chamadas para não congestionar a rede.</li></ul>`},
{ id:'incendio', t:'Incêndio florestal', h:`
<ul><li>Siga ordens de evacuação da Proteção Civil. Saia cedo.</li>
<li>Se o fogo se aproximar e não puder fugir: refugie-se num edifício de alvenaria, feche janelas e portas, tape frinchas com toalhas molhadas, afaste-se das janelas, encha recipientes com água.</li>
<li>No carro: não conduza através do fumo denso. Se ficar encurralado, estacione numa zona sem vegetação, motor ligado, luzes acesas, janelas fechadas, ar condicionado em recirculação, deite-se no chão do carro tapado com manta de lã.</li>
<li>A pé: procure zona já ardida, rochosa, campo lavrado, ou água. Afaste-se de encostas acima do fogo (o fogo sobe rapidamente). Cubra o nariz e boca com pano húmido.</li>
<li>Prevenção: faixa de gestão de combustível de 50 m à volta das habitações.</li></ul>`},
{ id:'inundacao', t:'Cheias & inundações', h:`
<ul><li>Vá para zonas altas. Não espere ordem se a água subir rapidamente.</li>
<li><b>Nunca atravesse água em movimento</b>: 15 cm derrubam uma pessoa; 30–60 cm arrastam um carro.</li>
<li>Desligue eletricidade e gás. Leve documentos e kit de emergência para o andar superior.</li>
<li>Água da cheia está contaminada (esgotos, químicos). Não beba, lave as mãos.</li>
<li>Cuidado com cabos elétricos caídos e animais deslocados.</li></ul>`},
{ id:'apagao', t:'Apagão prolongado', h:`
<ul><li>Lanternas, pilhas, rádio a pilhas/manivela (informação oficial), powerbanks carregados.</li>
<li>Mantenha frigorífico e congelador fechados.</li>
<li>Desligue aparelhos para evitar sobretensão no regresso da energia; deixe uma luz ligada para saber quando volta.</li>
<li><b>Nunca</b> use geradores, grelhadores ou fogareiros a gás/carvão em espaços fechados (monóxido de carbono mata).</li>
<li>Tenha dinheiro em notas e moedas (multibanco e pagamentos eletrónicos podem não funcionar).</li>
<li>Combustível: carro com depósito sempre acima de metade.</li>
<li>Água: prédios altos dependem de bombas elétricas – armazene água.</li></ul>`},
{ id:'nuclear', t:'Acidente nuclear / químico', h:`
<p><b>ENTRAR – FICAR DENTRO – ESTAR SINTONIZADO.</b></p>
<ul><li>Entre no edifício sólido mais próximo, vá para o centro ou cave, longe de janelas.</li>
<li>Feche portas, janelas, desligue ventilação e ar condicionado; vede frinchas.</li>
<li>Se esteve no exterior durante a contaminação: tire a roupa exterior (remove grande parte da contaminação) e coloque num saco; tome duche com água e sabão sem amaciador; não esfregue a pele com força.</li>
<li>Tome iodeto de potássio <b>apenas se as autoridades indicarem</b>.</li>
<li>Coma e beba apenas alimentos embalados/selados. Fique dentro pelo menos 24 h ou até indicação oficial.</li>
<li>Químico: se o gás for mais pesado que o ar (muitos são), suba para andares superiores.</li></ul>`},
{ id:'pandemia', t:'Pandemia / doença contagiosa', h:`
<ul><li>Lavagem das mãos 20 s, máscara FFP2 em espaços fechados, ventilação.</li>
<li>Isolar doentes num quarto, utensílios separados.</li>
<li>Reserva de medicação, termómetro, paracetamol, sais de reidratação.</li>
<li>Desinfetar superfícies: lixívia diluída 1:50 (20 ml por litro de água), preparada no dia.</li></ul>`},
{ id:'tempestade', t:'Tempestade / vento forte / neve', h:`
<ul><li>Recolha objetos soltos de varandas e quintais. Afaste-se de janelas.</li>
<li>Evite circular junto a árvores, andaimes, estruturas temporárias e zona costeira (ondulação).</li>
<li>Neve: kit no carro (manta, comida, água, pá, correntes, raspador). Se ficar retido, fique no veículo.</li></ul>`},
{ id:'evacuacao', t:'Evacuação & ponto de encontro', h:`
<ul><li>Defina com a família: ponto de encontro perto de casa, outro fora do bairro, e um contacto fora da região a quem todos ligam.</li>
<li>Mochila 72 h pronta junto à saída (ver <a href="#/checklists">Checklists</a>).</li>
<li>Documentos: cópias em saco estanque + fotos no telefone.</li>
<li>Planeie pelo menos duas rotas de saída. Não dependa só do GPS.</li>
<li>Animais de estimação: transportadora, comida, trela, boletim de vacinas.</li></ul>`}
]},
{ id:'perigos', ic:'☠️', t:'Perigos da Natureza', a:[
{ id:'animais', t:'Animais perigosos (Portugal/Europa)', h:`
<ul><li><b>Víboras:</b> pupila vertical, cabeça triangular, padrão em zigue-zague. Use botas, bata com o bastão no chão, não levante pedras com as mãos.</li>
<li><b>Javali:</b> evite fêmeas com crias. Afaste-se devagar, suba a uma árvore/rocha se carregar.</li>
<li><b>Lobo-ibérico:</b> muito raro atacar pessoas. Não fuja; faça-se grande, faça barulho, recue lentamente.</li>
<li><b>Cães assilvestrados:</b> não corra, não encare, recue devagar, proteja-se com objeto (mochila, pau).</li>
<li><b>Lagarta do pinheiro (processionária):</b> pelos urticantes – não tocar. Perigosa para cães.</li>
<li><b>Vespa asiática:</b> não se aproxime dos ninhos; afaste-se lentamente.</li>
<li><b>Gado (vacas com vitelos, touros):</b> não atravesse campos com animais e crias; solte o cão se for perseguido.</li>
<li><b>Mar:</b> peixe-aranha, alforrecas, caravela-portuguesa (não tocar, nem mortas na praia).</li></ul>`},
{ id:'plantas-toxicas', t:'Plantas tóxicas comuns', h:`
<ul><li><b>Cicuta / embude (Oenanthe crocata)</b> – família da cenoura; mortal. Comum junto à água em Portugal.</li>
<li><b>Dedaleira</b> – flores roxas em sino; tóxica para o coração.</li>
<li><b>Loendro (cevadilha, oleandro)</b> – todas as partes muito tóxicas; não usar para espetos.</li>
<li><b>Teixo</b> – sementes e folhas mortais.</li>
<li><b>Beladona, estramónio, mandrágora</b> – alucinações, morte.</li>
<li><b>Hera, azevinho, visco</b> – bagas tóxicas.</li>
<li><b>Cogumelos Amanita</b> (A. phalloides – mortal) – podem parecer cogumelos comestíveis.</li></ul>
<p>Em caso de intoxicação: CIAV <b>800 250 250</b>. Não provoque o vómito. Guarde uma amostra.</p>`},
{ id:'agua-perigos', t:'Água: correntes & afogamento', h:`
<ul><li><b>Agueiro (corrente de retorno):</b> não lute contra ela; nade paralelo à praia até sair e depois para terra. Ou flutue e acene.</li>
<li>Atravessar rios: só se necessário, em zona larga e calma, desaperte a cintura da mochila, enfrente a corrente com bastão (3 pontos de apoio), em grupo de braços dados.</li>
<li>Queda em água gelada: controle a respiração no primeiro minuto (choque frio), tem ~10 min de movimento útil – saia da água ou prenda-se a algo. Posição HELP (joelhos ao peito) para conservar calor.</li>
<li>Salvar alguém: <b>atire, não vá</b> – lance corda, boia, objeto flutuante.</li></ul>`}
]},
{ id:'ferramentas', ic:'🔪', t:'Ferramentas & Equipamento', a:[
{ id:'faca', t:'Faca & segurança', h:`
<ul><li>Faca de lâmina fixa, “full tang”, 10–12 cm, aço carbono ou inox de boa qualidade.</li>
<li>Corte sempre para longe do corpo. “Triângulo de sangue”: nunca corte na zona entre as coxas (artéria femoral).</li>
<li>Afie regularmente: ângulo de ~20°, movimentos uniformes. Pedra de afiar ou fundo de caneca de cerâmica.</li>
<li>Machado/serra: espaço livre à volta, nunca em direção às pernas.</li></ul>`},
{ id:'kit-bolso', t:'Kit de sobrevivência de bolso', h:`
<ul><li>Ferrocério + isqueiro + isca (algodão com vaselina)</li>
<li>Apito, espelho de sinalização, mini-lanterna</li>
<li>Manta térmica, saco de lixo grande (poncho/abrigo)</li>
<li>Pastilhas purificadoras, saco para água</li>
<li>Anzóis e linha, arame fino, agulha e linha</li>
<li>Paracord 5–10 m, fita adesiva enrolada, alfinetes</li>
<li>Lâmina pequena, mini-bússola, lápis e papel</li>
<li>Pensos, steri-strips, analgésicos</li></ul>`},
{ id:'improvisar', t:'Improvisar', h:`
<ul><li>Saco do lixo: poncho, abrigo, recolha de água, isolamento, sinalização (laranja).</li>
<li>Lata: panela, fogareiro, espelho (fundo polido), concentrador solar.</li>
<li>Garrafa PET: filtro, SODIS, armadilha, flutuador.</li>
<li>Meias: pré-filtro, luvas, saco.</li>
<li>Pilha 9V + palha de aço: fogo.</li>
<li>Telefone: lanterna, espelho, bússola, GPS, câmara para registar o percurso, cronómetro.</li></ul>`}
]},
{ id:'higiene', ic:'🧼', t:'Higiene & Saneamento', a:[
{ id:'higiene-campo', t:'Higiene no campo', h:`
<ul><li>Lavar mãos antes de comer e depois da casa de banho – a maioria das doenças em crise é gastrointestinal.</li>
<li>Latrina a pelo menos <b>60 m</b> de fontes de água, a jusante do acampamento; buraco de 15–20 cm; tapar com terra.</li>
<li>Em casa sem água: balde com saco duplo + serradura/cal/areia; separar urina de fezes reduz odores.</li>
<li>Cuide dos pés: meias secas, arejar ao fim do dia, tratar bolhas cedo.</li>
<li>Dentes: escovar com pau mastigado ou pano com cinza/sal se necessário.</li>
<li>Lixo: queimar ou enterrar longe, ou embalar e transportar (atrai animais).</li></ul>`}
]}
];

window.CHECKLISTS = {
  'mochila72': { t:'Mochila de emergência 72 h', ic:'🎒', items:[
    'Água: 3 L/pessoa + garrafa/saco dobrável','Pastilhas ou filtro de água','Comida 3 dias (barras, enlatados abre-fácil, frutos secos)','Abrelatas / canivete multiusos',
    'Lanterna frontal + pilhas extra','Rádio a pilhas ou manivela','Powerbank carregado + cabos','Apito','Manta térmica (2)','Poncho / impermeável',
    'Roupa de muda + meias de lã','Gorro e luvas','Saco-cama compacto ou bivy','Kit de primeiros socorros','Medicação pessoal (7+ dias)','Cópia dos óculos / lentes',
    'Cópias de documentos em saco estanque','Dinheiro em notas e moedas','Lista de contactos em papel','Mapa em papel da região + bússola','Isqueiro + fósforos à prova de água',
    'Paracord 15 m','Fita adesiva','Máscaras FFP2','Gel desinfetante + toalhitas','Papel higiénico','Sacos do lixo (3)','Escova de dentes / higiene básica','Caneta + bloco','Chaves suplentes (casa/carro)','Luvas de trabalho']},
  'casa': { t:'Reserva em casa (14 dias)', ic:'🏠', items:[
    'Água 4 L/pessoa/dia (56 L/pessoa)','Comida não perecível 14 dias','Fogão de campismo + gás (uso exterior)','Lanternas e pilhas','Velas + fósforos','Rádio a pilhas',
    'Kit de primeiros socorros completo','Medicação para 2+ semanas','Lixívia sem perfume','Sacos do lixo resistentes','Balde (sanita de emergência) + serradura/areia','Extintor',
    'Ferramentas: chave para fechar o gás e a água','Fita adesiva e plástico (vedar janelas)','Mantas e sacos-cama','Dinheiro em notas','Comida para animais de estimação','Jogos/livros (moral)','Detetor de monóxido de carbono','Gerador/painel solar (opcional)']},
  'carro': { t:'Kit do carro', ic:'🚗', items:[
    'Triângulo e colete refletor','Água 2 L','Barras energéticas','Manta térmica + manta de lã','Lanterna','Cabos de bateria','Kit de primeiros socorros','Pá dobrável','Raspador de gelo + correntes (inverno)','Carregador de isqueiro','Mapa em papel','Extintor','Corda de reboque','Martelo quebra-vidros + corta-cintos','Depósito sempre acima de 1/2']},
  'socorros': { t:'Kit de primeiros socorros', ic:'⛑️', items:[
    'Luvas descartáveis','Compressas esterilizadas','Ligaduras (várias)','Adesivo hipoalergénico','Pensos rápidos','Steri-strips','Garrote (CAT)','Ligadura de pressão','Soro fisiológico','Desinfetante (iodopovidona/clorexidina)','Tesoura de trauma','Pinça','Termómetro','Manta térmica','Paracetamol','Ibuprofeno','Anti-histamínico','Antidiarreico','Sais de reidratação','Pomada para queimaduras','Máscara de RCP']},
  'evacuar': { t:'Antes de evacuar', ic:'🏃', items:[
    'Pegar na mochila 72 h','Fechar gás, água e eletricidade','Fechar janelas e portas','Levar medicação e documentos','Avisar o contacto de emergência','Deixar nota com destino (dentro de casa)','Levar animais de estimação','Telefone e powerbank carregados','Calçado resistente','Seguir as rotas indicadas pelas autoridades']},
  'trilho': { t:'Antes de uma caminhada', ic:'🥾', items:[
    'Plano de viagem deixado a alguém','Previsão meteorológica verificada','Hora do pôr do sol verificada','Mapa offline + mapa em papel','Bússola','Água suficiente','Comida + extra','Camada impermeável e camada quente','Frontal','Apito','Kit de primeiros socorros','Telefone carregado + powerbank','Protetor solar e chapéu','Faca/canivete','Isqueiro']}
};

window.EMERGENCY_NUMBERS = [
  ['112','Emergência (Europa / Portugal)'],
  ['808 24 24 24','SNS 24 – Saúde (PT)'],
  ['800 250 250','CIAV – Centro de Informação Antivenenos (PT)'],
  ['117','Incêndios florestais – SOS Ambiente (PT)'],
  ['144','Linha Nacional de Emergência Social (PT)'],
  ['116 111','SOS Criança (PT)'],
  ['190','Emergência (Brasil – Polícia Militar)'],
  ['192','SAMU (Brasil)'],
  ['193','Bombeiros (Brasil)'],
  ['911','Emergência (EUA/Canadá/México)']
];
