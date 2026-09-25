/*
 * Receitas transcritas da pasta "receitas" do Google Drive.
 *
 * Formato de cada receita:
 *   id    identificador (usado no endereço)
 *   t     título            o   título original (opcional)
 *   c     categoria         e   emoji
 *   s     [n, "pessoas"]    doses base (null = receita sem nº de doses → multiplicador)
 *   tm    tempo             d   dificuldade
 *   src   fonte             f   id do ficheiro no Drive ("doc:" para Google Docs)
 *   n     nota (opcional)
 *   i     ingredientes — "200 g de farinha"; "# Título" cria uma secção;
 *         "(s)" e "{singular|plural}" ajustam o plural à quantidade.
 *   p     passos — "# Título" cria uma secção.
 */
window.RECIPES = [
  // ───────────────────────── PRATOS PRINCIPAIS ─────────────────────────
  {
    id: "arroz-de-pato", t: "Arroz de pato", c: "pratos", e: "🦆",
    s: [4, "pessoas"], tm: "60 min", d: "Fácil", src: "Pingo Doce", f: "1vPjCdLCcN_6L0lPPr5sCKbeNMJ5gbD1n",
    i: [
      "1,5 l de água", "100 ml de vinho tinto", "150 g de chouriço de carne", "150 g de toucinho fumado",
      "2 folhas de louro", "4 peitos de pato", "1 c. chá de sal", "50 ml de azeite", "1 cebola média",
      "3 dentes de alho", "1 c. sopa de polpa de tomate", "400 g de arroz agulha", "Pimenta preta q.b.", "Colorau q.b."
    ],
    p: [
      "Num tacho, coloque a água, o vinho tinto, metade do chouriço, o toucinho fumado, as folhas de louro, os peitos de pato e o sal.",
      "Deixe cozer durante 40 minutos.",
      "Coe e reserve o caldo de cozedura do pato.",
      "Num tacho, faça um refogado com o azeite, a cebola picada e o alho picado. Deixe alourar 3 minutos e junte a polpa de tomate.",
      "Deixe apurar durante 5 minutos.",
      "Deixe arrefecer as carnes, desfie o pato e corte o chouriço e o toucinho fumado aos cubos. Junte ao tacho do refogado.",
      "Adicione um pouco do caldo e deixe apurar durante 3 minutos.",
      "Junte o arroz e misture bem. Adicione 400 ml do caldo de cozedura, a pimenta e o colorau. Quando levantar fervura, baixe o lume e deixe cozer durante 10 minutos.",
      "Coloque o arroz num tabuleiro de ir ao forno. Corte o restante chouriço às rodelas e decore por cima do arroz.",
      "Leve ao forno a 170 °C durante 15 minutos, até alourar."
    ]
  },
  {
    id: "bacalhau-a-bras", t: "Bacalhau à Brás", c: "pratos", e: "🐟",
    s: [4, "pessoas"], tm: "45 min", d: "Média", src: "Pingo Doce", f: "1TrCe-ARU2tFzPBYJjLP4dcupIX-cawn0",
    i: [
      "450 g de lombo de bacalhau demolhado", "800 g de batata", "1 cebola", "4 dentes de alho", "1 folha de louro",
      "2 c. sopa de azeite", "6 ovos M", "Óleo para fritar q.b.", "1 ramo de salsa fresca", "12 azeitonas pretas"
    ],
    p: [
      "Descasque as batatas e corte-as em palitos muito finos (batata-palha). Deixe-as de molho em água cerca de meia hora, para retirar o excesso de amido.",
      "Entretanto, retire a pele e as espinhas do bacalhau e desfie-o com as mãos.",
      "Escorra as batatas e seque-as muito bem com um pano ou papel de cozinha. Frite-as no óleo bem quente.",
      "Aqueça o azeite numa frigideira e refogue a cebola cortada em meias-luas, o alho picado e a folha de louro.",
      "Quando a cebola e o alho estiverem macios, junte o bacalhau desfiado e tape a frigideira.",
      "Cozinhe em lume brando até o bacalhau ficar branco.",
      "Retire a folha de louro e junte as batatas fritas.",
      "Junte os ovos batidos e mexa suavemente, envolvendo todos os ingredientes. Não deixe os ovos cozinharem demasiado nem secarem.",
      "Antes de servir, polvilhe com salsa picada e decore com as azeitonas."
    ]
  },
  {
    id: "caldeirada-de-peixe", t: "Caldeirada de peixe", c: "pratos", e: "🍲",
    s: [4, "pessoas"], tm: "40 min", d: "Fácil", src: "A Pitada do Pai", f: "1fgUGFy00_dUlFZsSZ7uflGi7yDbrzbt3",
    n: "Pode juntar outro peixe, como tamboril. O rascasso é uma ótima escolha!",
    i: [
      "Peixe para caldeirada q.b. (safio em posta aberta, raia e rascasso)", "3 cebolas grandes", "3 dentes de alho",
      "1 pimento vermelho", "Tomate maduro q.b.", "4 batatas", "200 ml de vinho branco", "4 c. sopa de molho de tomate",
      "Fio de azeite", "Coentros q.b.", "Sal e pimenta q.b."
    ],
    p: [
      "Num tacho, comece por colocar a cebola às meias-luas e junte os dentes de alho.",
      "Corte o tomate e as batatas às rodelas e o pimento em tiras. Junte ao tacho, fazendo camadas.",
      "Adicione o peixe, tempere com sal e pimenta, junte o molho de tomate, refresque com o vinho branco e regue com um fio de azeite.",
      "Para finalizar, junte os coentros, tape e deixe cozinhar tapado 20 a 25 minutos."
    ]
  },
  {
    id: "cabrito-da-avo", t: "Cabritinho da avó com arroz de miúdos", c: "pratos", e: "🍖",
    s: null, tm: "1 noite + 1h15", d: "Média", src: "Filipa Gomes · 24Kitchen", f: "1UZ6ZYsZUzfFAWqDCGxId1n8pVlbQYVg4",
    n: "Prato de Natal. O cabrito fica a marinar de um dia para o outro.",
    i: [
      "# Cabrito", "½ cabrito", "3 cebolas grandes", "3 dentes de alho", "1 folha de louro", "1 c. sopa de colorau",
      "Hastes de tomilho q.b.", "Raminhos de hortelã q.b.", "Piri-piri q.b.", "Banha q.b.", "Azeite q.b.", "Vinho branco q.b.", "Sal e pimenta q.b.",
      "# Arroz de miúdos", "Miúdos do cabrito", "1 cebola", "1 dente de alho", "Azeite q.b.", "Banha q.b.", "Sal e pimenta q.b.",
      "Coentros q.b.", "2 chávenas de arroz carolino", "Hortelã q.b.", "4 chávenas de água"
    ],
    p: [
      "Retire a gordura ao cabrito, reservando os miúdos. Coloque o cabrito num tabuleiro.",
      "Faça uma pasta: num almofariz, esmague os dentes de alho com sal. Junte a folha de louro em pedaços, o tomilho e o piri-piri e esmague novamente.",
      "Regue com um fio de azeite e junte 2 colheres de sopa de banha. Passe para uma taça, junte o colorau e mexa bem.",
      "Barre todo o cabrito com esta pasta. Tempere com pimenta, aromatize com hortelã picada, regue com vinho branco e junte uma cebola em pedaços e um pouco de água. Deixe tomar gosto de um dia para o outro.",
      "Leve o cabrito a assar em forno pré-aquecido a 180 °C durante 50 minutos.",
      "Quando faltarem 15 minutos, prepare o arroz: num tacho, derreta 2 colheres de sopa de banha e aloure a cebola picada. Junte o alho picado e os miúdos e cozinhe 10 a 15 minutos.",
      "Tempere com sal e pimenta, aromatize com pés de coentros, junte o arroz e a água e tape.",
      "Perto do fim da cozedura, junte coentros e hortelã picados, apague o lume e cubra com um pano.",
      "Retire o cabrito do forno e sirva com o arroz de miúdos."
    ]
  },
  {
    id: "paella", t: "Paella", c: "pratos", e: "🥘",
    s: [6, "pessoas"], tm: "2 h", d: "Média", src: "Chef Philippe · Meilleur du Chef", f: "0BzY_l8VK8soLUFRfYjl6N2lKR2s",
    n: "Dica do chef: um arroz de grão longo não fica pegajoso. Um comentário sugere 500 g de mexilhão e 200 g de chouriço, com 20 min de cozedura do arroz.",
    i: [
      "6 coxas de frango", "Caldo de galinha q.b.", "1 cebola", "500 g de tomate", "1 pimento vermelho", "1 pimento verde",
      "250 g de ervilhas congeladas", "1 kg de mexilhão", "Azeite q.b.", "350 g de arroz bomba", "12 lagostins",
      "12 camarões", "200 g de lulas limpas", "150 g de chouriço", "3 doses de açafrão", "Sal e pimenta q.b.", "3 limões"
    ],
    p: [
      "Prepare todos os ingredientes.",
      "Corte a cebola em fatias finas e os pimentos (vermelho e verde) em tiras finas.",
      "Mergulhe os tomates em água a ferver, pele-os, corte-os ao meio, retire as sementes e corte-os em cubos pequenos.",
      "Na paellera, aloure a cebola em azeite até ficar translúcida.",
      "Junte os pimentos e o chouriço às rodelas e deixe cozinhar mais alguns minutos. Junte o tomate.",
      "À parte, numa frigideira, aloure bem as coxas de frango de todos os lados.",
      "Junte o arroz aos legumes e mexa bem para envolver na gordura.",
      "Disponha as coxas por cima e regue com o caldo quente.",
      "Junte as ervilhas, os mexilhões, os camarões, as lulas e, por fim, os lagostins. Tempere com sal, pimenta e açafrão.",
      "Deixe cozinhar em lume brando, mexendo de vez em quando para não pegar. Se for preciso, junte mais caldo. Cozinhe tapado com papel vegetal ou uma tampa.",
      "No fim, mantenha quente e sirva na paellera, com meio limão por pessoa."
    ]
  },
  {
    id: "risoto-cogumelos-espargos", t: "Risoto de cogumelos e espargos", c: "pratos", e: "🍄",
    s: null, tm: "40 min", d: "Fácil", src: "Horto", f: "1U2O3KMBYmOcfjxLkD0cTDoW19E4guWrV",
    i: [
      "1 cebola", "1 dente de alho", "1 dl de azeite", "1 dl de vinho branco", "250 g de arroz para risoto",
      "Caldo de legumes q.b.", "1 molho de espargos (320 g)", "350 g de cogumelos Marron frescos",
      "1 l de água (para escaldar os espargos)", "Sal q.b.", "Pimenta q.b.", "Queijo parmesão ralado a gosto"
    ],
    p: [
      "Ferva 1 litro de água e escalde os espargos durante 6 a 7 minutos.",
      "Escorra os espargos e reserve a água.",
      "Refogue a cebola e o alho picados no azeite.",
      "Junte o arroz e deixe fritar um pouco. Refresque com o vinho branco.",
      "Junte o caldo de legumes e um pouco da água dos espargos.",
      "Corte os cogumelos e junte ao arroz. Tempere com sal e pimenta.",
      "Vá juntando a água dos espargos aos poucos.",
      "Corte os espargos em pedaços, guardando as pontas. Junte os pedaços ao arroz e deixe cozinhar em lume brando, acrescentando água sempre que necessário.",
      "Sirva decorado com as pontas dos espargos e polvilhado com parmesão."
    ]
  },
  {
    id: "risoto-bolonhesa", t: "Risoto à bolonhesa", c: "pratos", e: "🍚",
    s: [4, "pessoas"], tm: "40 min", d: "Fácil", src: "Betty Bossi", f: "10tNcz7oTu4A0IxML65yWMxdjoNpzSsNw",
    n: "Pode trocar a cenoura e o aipo por uma embalagem de brunoise (cerca de 70 g). 564 kcal por dose.",
    i: [
      "# Carne", "1 c. sopa de azeite", "300 g de carne de vaca picada", "0,25 c. chá de sal", "Pimenta a gosto",
      "# Risoto", "1 cebola", "1 dente de alho", "1 cenoura", "100 g de aipo-rábano", "1 c. sopa de folhas de orégãos",
      "1 c. sopa de azeite", "3 c. sopa de concentrado de tomate", "350 g de arroz para risoto (vialone ou carnaroli)",
      "2 dl de vinho tinto (p. ex. chianti)", "1 l de caldo de carne bem quente", "50 g de parmesão ralado", "Sal a gosto"
    ],
    p: [
      "Aqueça bem o azeite numa frigideira. Aloure a carne por porções, retire, tempere com sal e pimenta e reserve tapada.",
      "Pique finamente a cebola e o alho, corte a cenoura e o aipo em cubinhos e pique os orégãos.",
      "Aqueça o azeite num tacho, aloure rapidamente a cebola e o alho, junte a cenoura e o aipo e cozinhe cerca de 5 minutos.",
      "Junte o concentrado de tomate e deixe apurar um instante.",
      "Junte o arroz e mexa até ficar nacarado. Regue com o vinho e deixe reduzir completamente.",
      "Junte a carne e os orégãos e misture.",
      "Vá juntando o caldo aos poucos, mexendo com frequência, só o suficiente para cobrir o arroz. Deixe cozinhar cerca de 20 minutos, até ficar cremoso e al dente.",
      "Retire do lume, envolva o parmesão e retifique o sal."
    ]
  },
  {
    id: "carne-salteada-thai", t: "Carne salteada tailandesa com massa", o: "Bœuf sauté thaï et ses nouilles", c: "pratos", e: "🍜",
    s: null, tm: "50 min", d: "Fácil", src: "Cookpad", f: "11PFl-nZj_Sd0liL9SIMBd8pSSpV6-mmC",
    i: [
      "300 g de lombo de vaca", "1 dente de alho", "1 cebola", "1 pimento", "200 g de massa chinesa (noodles)",
      "Coentros q.b.", "Molho de soja doce q.b.", "Molho de soja salgado q.b.", "Azeite q.b.", "Sal e pimenta q.b."
    ],
    p: [
      "Corte a carne em cubos ou tiras e deixe marinar numa taça com 3 colheres de sopa de molho de soja salgado, no frigorífico, durante 30 minutos.",
      "Corte o pimento e a cebola em tiras e pique o alho.",
      "Num wok, salteie a carne 5 a 7 minutos e reserve.",
      "Salteie os legumes também 5 a 7 minutos.",
      "Numa taça, misture 2 colheres de sopa de molho de soja doce, 2 de molho de soja salgado e os coentros.",
      "Coza a massa em água a ferver, como indicado na embalagem.",
      "Junte a massa cozida ao wok com os legumes e a carne, regue com o molho da taça, misture e deixe cozinhar em lume brando.",
      "Empratar e servir."
    ]
  },
  {
    id: "poke-bowl-salmao", t: "Poke bowl de salmão e abacate", c: "pratos", e: "🥑",
    s: [5, "pessoas"], tm: "40 min", d: "Fácil", src: "Journal des Femmes", f: "1TpCERskMtz7KdkA8eNcclhfVVptEi0xE",
    i: [
      "# Arroz", "500 g de arroz para sushi (cru)", "5 c. sopa de vinagre de arroz", "3 c. sopa de açúcar", "1 c. chá de sal",
      "# Peixe e molho", "650 g de salmão cru (sem pele nem espinhas)", "2 abacates", "0,5 c. chá de gengibre em pó",
      "85 g de molho de soja", "20 g de óleo de sésamo", "2 c. sopa de açúcar", "1 pitada de wasabi em pó (opcional)",
      "Sementes de sésamo torradas q.b."
    ],
    p: [
      "Coza o arroz para sushi conforme a embalagem. Entretanto, misture o vinagre de arroz, 3 colheres de sopa de açúcar e o sal.",
      "Quando o arroz estiver pronto, deixe repousar 10 minutos, regue com o tempero e misture delicadamente. Deixe amornar ou arrefecer.",
      "Corte o salmão e o abacate em cubos de 0,5 a 1 cm e coloque numa taça.",
      "Prepare o molho: misture o gengibre, o molho de soja, o óleo de sésamo, 2 colheres de sopa de açúcar e o wasabi.",
      "Verta o molho sobre o peixe e misture. Guarde no frigorífico até servir.",
      "Encha cada taça com arroz, cubra com o salmão e o abacate e polvilhe com sementes de sésamo."
    ]
  },
  {
    id: "poke-bowl-salmao-marinado", t: "Poke bowl de salmão marinado", c: "pratos", e: "🍣",
    s: [4, "pessoas"], tm: "1 h", d: "Fácil", src: "Marmiton", f: "19OnmCid9frK9RYp8iT-uyUNfOh1EprIJ",
    n: "A autora também faz esta receita com atum tataki ou com camarão.",
    i: [
      "# Arroz", "300 g de arroz para sushi", "330 ml de água", "50 ml de vinagre de arroz", "2 c. sopa de açúcar", "1 c. chá de sal",
      "# Guarnição", "2 postas de salmão fresco", "1 lima", "Óleo de sésamo q.b.", "1 pepino", "1 cenoura", "1 abacate",
      "1 cebola roxa", "Molho agridoce (picante) q.b.", "4 c. sopa de sementes de sésamo", "Cebola, alho ou chalota frita q.b.",
      "Molho de soja q.b.", "Wasabi q.b. (opcional)", "Gengibre marinado q.b. (opcional)"
    ],
    p: [
      "Lave o arroz 3 vezes numa taça, esfregando-o com as mãos.",
      "Deixe-o repousar meia hora em água fria.",
      "Num tacho, coloque o arroz escorrido com 330 ml de água, em lume forte e tapado. Quando ferver, passe a lume brando e coza 8 a 10 minutos, até a água ser totalmente absorvida.",
      "Deixe repousar tapado, fora do lume, 10 minutos.",
      "Misture bem o vinagre, o sal e o açúcar.",
      "Areje o arroz com uma espátula e incorpore a mistura. Deixe arrefecer destapado.",
      "Descasque o pepino às riscas, corte-o às rodelas e tempere numa taça com 1 a 2 colheres de sopa de molho agridoce e 1 colher de chá de óleo de sésamo. Faça o mesmo com a cenoura ralada.",
      "Deixe marinar o salmão, cortado em tiras finas, com 1 colher de chá de óleo de sésamo, o sumo da lima e um pouco de pimenta.",
      "Corte a cebola roxa em rodelas finas e o abacate em lâminas.",
      "Montagem: coloque o arroz no fundo de cada taça e disponha os ingredientes por cima. Regue com as marinadas.",
      "Termine com a cebola frita e as sementes de sésamo.",
      "Misture wasabi com um pouco de molho de soja para molhar o salmão e sirva o gengibre à parte."
    ]
  },
  {
    id: "jardineira", t: "Jardineira (Bimby)", c: "pratos", e: "🥕",
    s: null, tm: "50 min", d: "Fácil", src: "MyTaste", f: "0BzY_l8VK8soLYjFnUU5ZVzhwN3c",
    n: "Se usar legumes congelados, pode precisar de mais tempo de cozedura.",
    i: [
      "1 cebola", "2 dentes de alho", "1 cenoura", "50 g de azeite", "500 g de carne de vaca para estufar", "80 g de vinho branco",
      "20 g de molho de soja", "1 caldo de legumes", "400 g de batata, em cubos", "300 g de cenoura, em cubos",
      "200 g de ervilhas", "200 g de água", "Sal q.b."
    ],
    p: [
      "Coloque no copo a cebola, o alho, a cenoura e o azeite. Pique 5 seg/vel 5 e refogue 5 min/temp. Varoma/vel 1.",
      "Adicione a carne, o vinho, o molho de soja e o caldo e programe 20 min/100 °C/colher inversa.",
      "Junte as batatas, as cenouras, as ervilhas, a água e o sal e programe 20 min/100 °C/colher inversa."
    ]
  },
  {
    id: "couscous", t: "Cuscuz", o: "Couscous (Bottex)", c: "pratos", e: "🫕",
    s: [10, "pessoas"], tm: "Longo", d: "Média", src: "Marmiton", f: "0BzY_l8VK8soLWnk2X2YxMjZNTkU",
    n: "A carne e os legumes servem-se em travessas separadas, para cada um escolher.",
    i: [
      "# Sêmola e legumes", "2 kg de cuscuz médio", "Azeite q.b.", "1 lata de grão-de-bico", "150 g de passas (demolhadas e cozidas)",
      "5 alcachofras (½ por pessoa)", "10 curgete(s)", "1 kg de nabos", "1 kg de favas frescas (ou congeladas)", "1 funcho",
      "1 kg de cardos", "1 limão às rodelas", "1 couve lombarda", "3 cenouras", "1 talo de aipo", "Salsa q.b.",
      "1 molho de coentros frescos", "1 cabeça de alho", "1 cebola com 2 cravinhos espetados", "1 fatia de abóbora",
      "# Especiarias", "Sal e pimenta q.b.", "1 c. sopa de cominhos em pó", "2 c. sopa de pimentão doce", "2 pitadas de ras-el-hanout",
      "2 pitadas de noz-moscada", "2 c. chá de canela em pó", "2 pitadas de coentros em pó", "2 c. sopa de concentrado de tomate",
      "300 g de manteiga com sal", "1 tubo de harissa (ou tabasco)",
      "# Carne", "1 frango", "1 kg de cachaço de carneiro", "1 kg de entrecosto de vaca", "Merguez e almôndegas (opcional)"
    ],
    p: [
      "Aloure a carne, começando pelo frango, depois a vaca e por fim o carneiro, retirando cada uma à medida que fica alourada.",
      "Aloure os legumes da mesma forma e retire-os.",
      "Volte a juntar tudo com as especiarias, cubra com água e deixe cozer. Vá retirando legumes e carne à medida que ficam cozidos.",
      "Coloque o cuscuz num alguidar grande, cubra com água morna salgada e deixe inchar.",
      "Quando a água for absorvida, solte os grãos com dois garfos.",
      "Ponha água salgada com cominhos e louro na cuscuzeira. Coloque o cesto com um pano fino no fundo e o cuscuz por cima. Faça alguns buracos com o cabo de uma colher de pau para deixar passar o vapor e feche o pano.",
      "Coza 20 minutos; retire, junte 1 colher de azeite e solte os grumos com dois garfos.",
      "Coza mais 20 minutos; retire e envolva 150 g de manteiga com sal.",
      "Coza mais 10 minutos; retire, envolva o resto da manteiga, regue com 2 conchas de caldo e sirva."
    ]
  },
  {
    id: "ovos-mexidos-alheira", t: "Ovos mexidos com alheira", c: "pratos", e: "🍳",
    s: [4, "pessoas"], tm: "25 min", d: "Fácil", src: "Continente · The Healthy Sins", f: "1oV7IdSgr-HU5ILdGvGksP07Yqb7VCYjC",
    i: [
      "4 ovos", "1 c. café de sal", "Pimenta q.b.", "Salsa picada q.b.", "1 c. sopa de azeite", "½ cebola picada",
      "1 dente de alho picado", "1 alheira sem pele", "Fatias de broa de milho q.b."
    ],
    p: [
      "Bata os ovos com o sal, a pimenta e a salsa picada até ficarem bem envolvidos.",
      "Aqueça o azeite numa frigideira, junte a cebola e o alho picados e deixe refogar até amolecerem.",
      "Junte a alheira desfeita em pedaços e deixe saltear em lume brando, mexendo de vez em quando.",
      "Junte os ovos batidos e mexa continuamente até ficarem cremosos. Retire do lume.",
      "Sirva polvilhado com mais salsa e acompanhe com fatias de broa de milho."
    ]
  },
  {
    id: "magret-pato-porto", t: "Magret de pato com molho do Porto", o: "Magret de canard, pommes rissolées et sauce au Porto", c: "pratos", e: "🦆",
    s: [4, "pessoas"], tm: "50 min", d: "Média", src: "Alicia · Marmiton", f: "1SH1jxuY6fmULbX3tzBWAjJpXiDlqXC4W",
    i: [
      "# Pato e guarnição", "4 magrets de pato", "500 g de batatas", "250 g de cogumelos Paris", "4 dentes de alho",
      "Salsa picada q.b.", "Azeite q.b.", "Sal e pimenta q.b.",
      "# Molho do Porto", "20 cl de vinho do Porto", "10 cl de natas líquidas", "1 c. chá de fundo de vitela", "15 g de manteiga"
    ],
    p: [
      "Faça golpes na pele dos magrets. Aqueça uma frigideira e aloure os magrets do lado da pele.",
      "Quando largarem gordura, esmague um dente de alho e junte à frigideira. Regue os magrets com a gordura. Quando a pele estiver dourada, retire-os e reserve, guardando a gordura na frigideira.",
      "Molho: num tacho, deixe reduzir o Porto em lume brando até metade. Junte as natas e deixe reduzir de novo. Junte o fundo de vitela e mexa bem com a vara. Deixe cozinhar 3 minutos, junte a manteiga e mexa até derreter. Reserve.",
      "Corte as batatas com pele em cubos e coza-as em água salgada. Entretanto, lave os cogumelos e corte-os em quatro.",
      "Escorra as batatas e salteie-as na gordura do pato. Quando começarem a dourar, junte 2 dentes de alho picados e um pouco de salsa. Tempere com sal e pimenta.",
      "Noutra frigideira, salteie os cogumelos com um pouco de azeite. Quando estiverem dourados, junte o alho restante picado e o resto da salsa.",
      "Pré-aqueça o forno a 180 °C e termine os magrets no forno 10 a 15 minutos. O pato deve ficar rosado.",
      "Sirva com as batatas, os cogumelos e o molho."
    ]
  },
  {
    id: "pita-frango-caril", t: "Pita de frango ao caril", c: "pratos", e: "🥙",
    s: [1, "pessoa"], tm: "25 min", d: "Fácil", src: "Marmiton", f: "1ezsZ-h3AlwFPZZaoPod_JMy7MH2cBjZA",
    n: "Junte alface, tomate ou outros legumes à pita para dar frescura.",
    i: [
      "1 {pão|pães} pita", "1 peito de frango", "1 cebola", "2 punhados de passas", "1 c. sopa de caril",
      "1 c. chá de salsa fresca ou seca", "2 c. sopa de natas (crème fraîche)", "Azeite q.b.", "1,5 copo de água", "Sal e pimenta q.b."
    ],
    p: [
      "Corte a cebola e o frango em pedaços pequenos e cozinhe-os numa frigideira funda com um fundo de azeite.",
      "Quando o frango ficar branco, junte um copo de água (15 a 20 cl) e as passas.",
      "Quando a água ferver, junte 1 colher de sopa de caril.",
      "Quando a água estiver quase evaporada, junte 1 colher de sopa de natas e 1 colher de chá de salsa.",
      "Quando o molho desaparecer, junte a segunda colher de sopa de natas.",
      "Aguarde 2 a 3 minutos, junte meio copo de água, sal, pimenta e, se quiser mais sabor, 1 colher de chá de caril.",
      "Recheie a pita com esta mistura."
    ]
  },
  {
    id: "esparguete-mascarpone-nozes", t: "Esparguete com mascarpone e nozes", c: "pratos", e: "🍝",
    s: [4, "pessoas"], tm: "20 min", d: "Fácil", src: "Tampa de mascarpone", f: "1YWJNKUrQeZC0lN6GHiSGjitqWZ0LtUYh",
    i: ["300 g de esparguete", "500 g de mascarpone", "2 dentes de alho", "100 g de nozes pisadas", "100 g de queijo ralado na hora", "Óleo q.b.", "1 pitada de sal"],
    p: [
      "Frite o alho numa frigideira com um pouco de óleo.",
      "Junte as nozes pisadas e deixe alourar. Envolva o mascarpone com uma pitada de sal e deixe cozinhar 5 minutos em lume brando.",
      "Coza o esparguete, escorra e envolva no molho.",
      "Junte o queijo ralado e sirva."
    ]
  },

  // ───────────────────────── ENTRADAS, SOPAS E ACOMPANHAMENTOS ─────────────────────────
  {
    id: "veloute-cogumelos", t: "Creme de cogumelos", o: "Velouté de champignons", c: "entradas", e: "🥣",
    s: [3, "pessoas"], tm: "50 min", d: "Fácil", src: "Marmiton", f: "0BzY_l8VK8soLUDZubHl2dzc4TUk",
    n: "Sem natas e triturado também fica excelente.",
    i: [
      "3 c. sopa de manteiga", "1 cebola", "250 g de cogumelos Paris", "2 c. sopa de farinha", "250 ml de caldo (ou água)",
      "500 ml de leite", "1 limão", "2 c. sopa de natas", "1 c. sopa de salsa picada", "Sal e pimenta q.b."
    ],
    p: [
      "Derreta a manteiga num tacho.",
      "Junte a cebola picada e os cogumelos cortados em pedaços pequenos.",
      "Tempere com sal e pimenta e polvilhe com a salsa picada.",
      "Envolva bem os cogumelos na manteiga quente. Tape e deixe cozinhar em lume brando 15 minutos.",
      "Junte a farinha, mexendo sempre. Junte o caldo e o leite.",
      "Deixe cozinhar em lume brando, mexendo de vez em quando.",
      "Quando começar a ferver, baixe o lume e deixe cozinhar destapado mais 15 minutos.",
      "Alguns minutos antes de servir, junte o sumo do limão e as natas."
    ]
  },
  {
    id: "sopa-de-cebola", t: "Sopa de cebola gratinada", o: "Soupe à l'oignon", c: "entradas", e: "🧅",
    s: [4, "pessoas"], tm: "45 min", d: "Fácil", src: "Marmiton", f: "0BzY_l8VK8soLU0FMeFNGRFAyS2c",
    i: [
      "4 cebolas grandes", "50 g de manteiga", "1 c. sopa de óleo", "1 c. sopa de farinha", "25 cl de vinho branco",
      "1 l de água", "Sal e pimenta q.b.", "6 fatias de pão de forma", "100 g de queijo comté ralado"
    ],
    p: [
      "Descasque e corte as cebolas às fatias finas e aloure-as na mistura de manteiga e óleo.",
      "Polvilhe com a farinha, regue com a água quente e o vinho branco e tempere.",
      "Tape e deixe ferver suavemente durante 20 minutos.",
      "Torre o pão e coloque as fatias no fundo de 4 taças que possam ir ao forno.",
      "Polvilhe com um pouco de queijo ralado e verta a sopa por cima.",
      "Polvilhe novamente com queijo e leve a gratinar."
    ]
  },
  {
    id: "torres-legumes-camarao", t: "Torres de legumes e camarão com molho gaspacho", o: "Tourelles aux légumes et aux crevettes", c: "entradas", e: "🦐",
    s: [4, "pessoas"], tm: "40 min", d: "Fácil", src: "Colruyt", f: "0BzY_l8VK8soLbkNSR1V3cTVwUWs",
    n: "Entrada fresca de verão que pode ser preparada toda com antecedência. 191 kcal por dose.",
    i: [
      "# Torres", "200 g de camarão cinzento (congelado)", "100 g de trigo pré-cozido", "2 tomates", "½ pepino (com casca)",
      "½ cebola roxa", "1 c. sopa de azeite", "½ molho de endro", "Alguns raminhos de salsa", "Sal e pimenta q.b.",
      "# Molho gaspacho", "½ pepino descascado", "1 tomate", "1 dente de alho", "Sumo de ½ limão", "2 dl de sumo de tomate",
      "1 c. sopa de vinagre balsâmico", "Tabasco q.b.", "Sal e pimenta q.b."
    ],
    p: [
      "# Preparação",
      "Pique a cebola roxa. Corte o endro, guardando alguns raminhos para decorar. Pique a salsa.",
      "Corte meio pepino com casca em cubos de ½ cm e o outro meio (descascado, para o molho) em pedaços.",
      "Pele os tomates (mergulhe-os 10 segundos em água a ferver), retire as sementes e corte-os em cubos. Descongele e seque bem os camarões.",
      "# Confeção (15 min)",
      "Coza o trigo em água pouco salgada (ver tempo na embalagem). Escorra e deixe arrefecer. Junte os cubos de pepino, 2/3 dos cubos de tomate, a salsa e 1 colher de sopa de azeite.",
      "Misture os camarões com a cebola e o endro. Tempere com sal e pimenta.",
      "Molho: triture o pepino descascado, o alho, o resto do tomate e o sumo de tomate até ficar liso. Tempere com limão, tabasco, vinagre balsâmico, sal e pimenta.",
      "# Apresentação",
      "Em cada prato, monte uma torre de trigo com legumes e cubra com os camarões (use um aro ou um copo de iogurte sem fundo). Decore com endro e regue à volta com o molho antes de servir."
    ]
  },
  {
    id: "briochettes-caracois", t: "Briochettes com caracóis", o: "Briochettes aux escargots", c: "entradas", e: "🐌",
    s: [8, "pessoas"], tm: "35 min + levedar", d: "Média", src: "Notre Famille", f: "1Qe5-MuyrUiimXykvBor8sVPB8LNDj6-z",
    n: "Pode comprar as briochettes na padaria (prep. 15 min). Caracóis em conserva funcionam muito bem; com caracóis congelados já com manteiga ainda é mais rápido.",
    i: [
      "# Briochettes", "200 g de farinha", "65 g de manteiga amolecida", "2 ovos", "100 ml de leite", "1 c. chá de sal",
      "2 c. chá de fermento de padeiro", "1 c. sopa de açúcar", "1 ovo + 1 c. sopa de água + 1 pitada de sal (para pincelar)",
      "Sementes de sésamo ou de papoila q.b.",
      "# Recheio", "48 caracóis cozidos ao natural", "100 g de manteiga amolecida", "½ molho de salsa", "4 dentes de alho", "Sal e pimenta q.b."
    ],
    p: [
      "# Manteiga de caracol",
      "Pique a salsa e o alho e misture com a manteiga. Enrole em película aderente, formando um rolo, e leve ao frigorífico.",
      "# Briochettes",
      "Misture os ingredientes da massa e amasse 10 minutos (idealmente no robot com gancho). Tape com um pano e deixe levedar em lugar morno, sem correntes de ar, cerca de 2 horas (deve dobrar de volume).",
      "Dê um murro na massa para tirar o ar.",
      "Divida-a em 8 partes iguais e forme bolinhas. Coloque-as espaçadas num tabuleiro com papel vegetal. Pincele com a mistura de ovo e deixe levedar mais 45 minutos.",
      "Pré-aqueça o forno a 180 °C. Pincele de novo, polvilhe com sementes e coza 20 a 25 minutos, até dourarem. Deixe arrefecer bem.",
      "# Recheio",
      "Corte um chapéu no topo de cada briochette, escave um pouco e coloque 3 a 4 caracóis. Corte a manteiga em 8 rodelas e ponha uma em cada briochette. Feche com o chapéu e embrulhe em papel de alumínio.",
      "20 minutos antes de servir, leve ao forno pré-aquecido a 200 °C durante 20 minutos. Sirva bem quente sobre salada verde sem tempero."
    ]
  },
  {
    id: "salteado-de-legumes", t: "Salteado de legumes", o: "Poêlée de légumes", c: "entradas", e: "🥦",
    s: [4, "pessoas"], tm: "30 min", d: "Fácil", src: "CuisineAZ", f: "1TidjTdUaKfEKg1rnk2copkoOQ3KGuziw",
    n: "Para mais sabor: 1 c. chá de cominhos (ou caril), 1 c. chá de gengibre em pó e uma pitada de piripiri. Versão mais leve: troque o caldo por sumo de limão. Menos leve: polvilhe com parmesão.",
    i: [
      "2 cenouras", "2 curgetes", "1 brócolo", "200 g de feijão-verde", "1 pimento vermelho", "2 dentes de alho",
      "1 cebola roxa", "1 c. sopa de azeite", "1 caldo concentrado de legumes", "Ervas frescas q.b. (manjericão, hortelã, salsa)"
    ],
    p: [
      "Descasque o alho, a cebola e as cenouras. Arranje o feijão-verde e separe o brócolo em raminhos. Tire as sementes ao pimento.",
      "Corte as cenouras, as curgetes, o pimento e a cebola em juliana (ou rodelas finas). Pique o alho.",
      "Aqueça um wok, junte o azeite e salteie o alho e a cebola alguns minutos em lume forte.",
      "Junte os legumes e salteie cerca de 10 minutos em lume forte, mexendo com frequência.",
      "No fim, junte o caldo concentrado e misture até ser absorvido. Sirva quente, morno ou frio, com ervas frescas picadas."
    ]
  },

  // ───────────────────────── SALGADOS E PETISCOS ─────────────────────────
  {
    id: "croquetes-carne", t: "Croquetes de carne", c: "petiscos", e: "🥖",
    s: null, tm: "1 h", d: "Média", src: "Blog", f: "0BzY_l8VK8soLUlV4WGxRUUtxcGc",
    n: "Podem congelar-se — ficam sempre à mão para uma refeição rápida ou um petisco.",
    i: [
      "# Massa", "500 g de carne picada", "1 cebola grande", "2 dentes de alho", "1 c. sopa de manteiga", "4 c. sopa de farinha",
      "1 ramo de salsa", "1 dl de natas", "Sal e pimenta q.b.",
      "# Para moldar e fritar", "50 g de farinha", "2 ovos batidos", "50 g de pão ralado", "Óleo ou azeite para fritar"
    ],
    p: [
      "Refogue a cebola e o alho picados na manteiga e junte a carne. Deixe fritar um pouco, polvilhe com a farinha e mexa bem.",
      "Junte a salsa e as natas e tempere. Cozinhe, mexendo sempre.",
      "Deixe a massa arrefecer.",
      "Molde os croquetes com as mãos e passe-os por farinha, ovo batido e pão ralado.",
      "Frite em óleo bem quente, virando para alourarem por igual. Escorra em papel absorvente."
    ]
  },
  {
    id: "rissois-camarao", t: "Rissóis de camarão", c: "petiscos", e: "🦐",
    s: null, tm: "1h30", d: "Média", src: "Blog", f: "0BzY_l8VK8soLei1XTnNsNjlYbUk",
    i: [
      "# Massa", "2 chávenas bem cheia(s) de farinha", "2 chávenas de água", "1 c. sopa de margarina", "Um pouco de casca de limão", "Sal q.b.",
      "# Recheio", "200 g de camarão", "1 cebola", "2 c. sopa de margarina", "2 c. sopa de farinha", "Um pouco de leite",
      "Salsa q.b.", "Sal e pimenta q.b.", "Sumo de 1 limão", "2 gemas",
      "# Para panar", "Ovo batido q.b.", "Pão ralado q.b.", "Óleo para fritar"
    ],
    p: [
      "# Recheio",
      "Coza os camarões e descasque-os. Pique as cascas e as cabeças e refogue-as com parte da cebola e margarina. Quando a cebola estiver loura, junte água e deixe ferver. Coe.",
      "Pique finamente a restante cebola e aloure-a na margarina. Polvilhe com a farinha e junte algum leite e o caldo coado dos camarões.",
      "Deixe cozer até engrossar. Tempere com sal, pimenta e sumo de limão a gosto, junte as gemas, os camarões picados e um pouco de salsa picada.",
      "# Massa",
      "Leve a água ao lume com a margarina, a casca de limão e uma pitada de sal. Quando ferver, retire do lume e junte a farinha, mexendo com força.",
      "Volte a lume brando e mexa suavemente até a massa ficar seca e em bola. Trabalhe-a numa superfície lisa e deixe repousar 20 minutos.",
      "Estenda a massa com o rolo até ficar bem fina. Coloque montinhos de recheio, dobre e corte em meia-lua com o bordo de um copo.",
      "Passe por ovo batido e pão ralado e frite em óleo bem quente."
    ]
  },
  {
    id: "rissois-pescada", t: "Rissóis de pescada", c: "petiscos", e: "🐟",
    s: null, tm: "1h30", d: "Média", src: "Receitas da Dona Rosa", f: "0BzY_l8VK8soLei1XTnNsNjlYbUk",
    i: [
      "# Massa", "2 copos de farinha", "1 copo de leite", "1 copo de água", "80 g de margarina", "1 pitada de sal",
      "# Recheio", "Molho bechamel espesso q.b.", "Pescada cozida a gosto", "1 raminho de salsa", "Sumo de ½ limão", "1 pitada de noz-moscada",
      "# Para panar", "1 ovo", "Pão ralado q.b.", "Óleo para fritar"
    ],
    p: [
      "Recheio: misture um bechamel espesso com a pescada cozida aos pedacinhos, salsa picada, sumo de meio limão e noz-moscada ralada.",
      "Massa: num tacho, junte a água, o leite, a margarina e o sal. Quando começar a ferver, junte a farinha de uma só vez e mexa logo com a colher de pau até perder toda a humidade.",
      "Coloque a massa numa bancada e amasse-a ainda quente até não pegar às mãos. Faça uma bola, marque uma cruz e deixe arrefecer.",
      "Estenda pedaços de massa com o rolo até ficarem finos. Ponha uma colher de recheio, dobre a massa, recorte com um copo e cole as pontas com os dedos.",
      "Passe por ovo batido e pão ralado e frite em óleo bem quente (ou congele para mais tarde)."
    ]
  },
  {
    id: "rissois-peixe-bimby", t: "Rissóis de peixe (Bimby)", c: "petiscos", e: "🥟",
    s: [38, "unidades"], tm: "40 min", d: "Média", src: "Mundo de Receitas Bimby", f: "1pCMFA_yOVfwBvzuCsX6CcfLWx4_krN3q",
    i: [
      "# Recheio", "400 g de filetes de pescada", "70 g de cebola pequena", "2 dentes de alho", "Salsa q.b.", "Sal q.b.", "50 g de azeite",
      "500 g de leite", "60 g de água da cozedura do peixe", "15 g de mostarda", "80 g de farinha maizena", "1 gema de ovo",
      "# Massa", "250 g de farinha tipo 65", "320 g de água", "60 g de manteiga", "1 pitada de sal",
      "# Para panar", "3 ovos batidos", "Pão ralado q.b.", "Óleo para fritar"
    ],
    p: [
      "Coloque água no copo até meio, os filetes na Varoma e programe 30 min/Varoma/vel 1. Reserve o peixe e a água.",
      "Coloque no copo a cebola, o alho, a salsa e o azeite: 5 seg/vel 7. Refogue 5 min/120 °C/vel 1.",
      "Junte a água do peixe, o leite, a mostarda, a maizena e a gema: 10 min/90 °C/vel 3.",
      "Junte o peixe desfiado: 2 min/120 °C/colher inversa. Reserve.",
      "Massa: no copo limpo, coloque a água, a manteiga e o sal: 5 min/100 °C/vel 1. Junte a farinha: 20 seg/vel 4.",
      "Estenda a massa com o rolo e corte círculos com cerca de 7 cm. Ponha uma colher de chá de recheio no centro de cada um e feche.",
      "Passe por ovo e pão ralado e frite em óleo bem quente."
    ]
  },
  {
    id: "rissois-atum", t: "Rissóis de atum", c: "petiscos", e: "🥟",
    s: [24, "unidades"], tm: "1 h", d: "Fácil", src: "Revista", f: "0BzY_l8VK8soLZU1JX0VWTVQ0Qnc",
    i: [
      "# Massa", "7,5 dl de água", "100 g de margarina", "1 pitada de sal", "450 g de farinha", "Ovo batido para passar",
      "Pão ralado para passar", "Óleo para fritar",
      "# Recheio", "1 cebola", "2 c. sopa de azeite", "3 latas de atum", "Sal e pimenta q.b.", "2 ovos cozidos", "1 raminho de salsa picada"
    ],
    p: [
      "Recheio: descasque e pique a cebola e cozinhe-a numa frigideira com o azeite até ficar macia.",
      "Junte o atum escorrido e esmagado, misture bem e tempere com sal e pimenta. Retire do lume, junte os ovos cozidos picados e a salsa. Reserve.",
      "Massa: leve a água ao lume com a margarina e o sal e deixe ferver. Junte a farinha de uma só vez e mexa bem, sem tirar do lume, até descolar do tacho.",
      "Deite a massa na bancada e deixe arrefecer ligeiramente.",
      "Trabalhe a massa, corte-a em pedaços e estenda-os finos com o rolo.",
      "Coloque colheradas de recheio, dobre a massa por cima, pressione e corte com um cortador.",
      "Passe por ovo batido e pão ralado e frite em óleo até ficarem douradinhos. Escorra e sirva frio ou quente."
    ]
  },
  {
    id: "cake-azeitonas-fiambre", t: "Cake de azeitonas e fiambre", o: "Cake aux olives et au jambon", c: "petiscos", e: "🫒",
    s: [1, "cake"], tm: "1 h", d: "Fácil", src: "Marmiton", f: "0BzY_l8VK8soLMzAxR0JZVlRvZHM",
    i: [
      "15 cl de vinho branco seco", "15 cl de azeite", "4 ovos", "100 g de queijo gruyère ralado", "250 g de farinha",
      "1 saqueta de fermento", "1 c. chá de sal", "200 g de fiambre em cubos", "200 g de azeitonas verdes"
    ],
    p: [
      "Numa taça, misture o vinho, o azeite e os ovos, um a um.",
      "Junte a farinha, o queijo ralado, o fermento e o sal e, por fim, o fiambre e as azeitonas cortadas ao meio.",
      "Coza numa forma de cake untada e enfarinhada durante 45 minutos a 190 °C."
    ]
  },

  // ───────────────────────── MOLHOS ─────────────────────────
  {
    id: "molho-barbecue", t: "Molho barbecue", c: "molhos", e: "🍖",
    s: [10, "porções"], tm: "40 min", d: "Fácil", src: "CyberCook", f: "1UIVH72052-tYnEUZImo449Ur--7snO2q",
    i: [
      "5 c. sopa de azeite", "3 cebolas picadas", "2 dentes de alho esmagados", "200 g de polpa de tomate", "4 c. sopa de vinagre branco",
      "2 chávenas de vinho branco seco", "2 c. sopa de molho inglês", "1 molho de tomilho", "1 folha de louro picada",
      "1 c. chá de mostarda", "2 c. sopa de mel", "Sal a gosto", "Pimenta branca a gosto"
    ],
    p: [
      "Aqueça o azeite, junte a cebola e o alho e refogue em lume brando.",
      "Quando começar a dourar, junte a polpa de tomate e o vinagre e deixe fritar 15 minutos.",
      "Junte o vinho, o molho inglês, o tomilho, o louro e a mostarda.",
      "Deixe ferver 15 minutos, até obter um molho cremoso.",
      "Junte o mel, tempere com sal e pimenta e deixe ferver mais alguns minutos. Sirva."
    ]
  },
  {
    id: "molho-do-porto", t: "Molho de vinho do Porto", o: "Sauce au Porto", c: "molhos", e: "🍷",
    s: [5, "pessoas"], tm: "30 min", d: "Fácil", src: "Chef Damien · Croquant Fondant Gourmand", f: "1R3cBbjhnFooCU80R8icj35FsaBB9BIbl",
    n: "O limão no fim realça o sabor do molho. Ideal com carnes assadas ou aves.",
    i: [
      "15 g de manteiga", "2 chalotas", "100 ml de vinho do Porto", "250 ml de água", "2,5 c. chá de fundo de vitela em pó",
      "100 ml de natas", "1 c. chá de sumo de limão", "Sal e pimenta moída na hora"
    ],
    p: [
      "Descasque e pique muito finamente as chalotas.",
      "Aqueça a manteiga num tacho e aloure as chalotas até ficarem tenras, sem ganharem cor.",
      "Junte o Porto e leve a ferver. Deixe fervilhar em lume brando até o líquido reduzir três quartos.",
      "Aqueça a água e dissolva nela o fundo de vitela.",
      "Verta este caldo no tacho e deixe fervilhar alguns minutos.",
      "Junte as natas e deixe fervilhar suavemente até o molho envolver a colher.",
      "Junte o sumo de limão e retifique o sal e a pimenta."
    ]
  },
  {
    id: "molho-para-salada", t: "Molho leve para salada", c: "molhos", e: "🥗",
    s: null, tm: "10 min", d: "Fácil", src: "", f: "1UWf7F2Rio8gEgaDUufGwll_dUJGOxNT3",
    i: [
      "1 gema de ovo", "1 c. sopa rasa de mostarda", "10 cl de óleo de amendoim", "10 cl de água gelada",
      "1 c. sopa cheia de queijo fresco batido 0%", "2 c. sopa de vinagre", "Sal e pimenta q.b."
    ],
    p: [
      "Monte como uma maionese com a gema, a mostarda e o óleo.",
      "Junte a água, o queijo fresco, o vinagre, o sal e a pimenta, emulsionando energicamente com a vara ou a varinha mágica.",
      "Retifique os temperos."
    ]
  },

  // ───────────────────────── PÃO E MASSAS ─────────────────────────
  {
    id: "pao-caseiro-fofinho", t: "Pão caseiro simples e fofinho", c: "pao", e: "🍞",
    s: [8, "fatias"], tm: "3h30", d: "Fácil", src: "Instagram", f: "doc:1t8L2nJqnlbY5G8RWxr5dxL0PIOPDSIcxWTagVh6yn14",
    n: "Para melhores resultados, coloque ½ chávena de água gelada no tabuleiro do forno durante a cozedura. ~150 kcal por fatia.",
    i: [
      "1 c. chá de fermento biológico seco instantâneo", "1 c. sopa de açúcar", "550 ml de água à temperatura ambiente",
      "575 g de farinha de trigo", "½ c. chá de sal", "2 c. sopa de azeite"
    ],
    p: [
      "Misture tudo (exceto o azeite) e deixe descansar 30 minutos.",
      "Junte o azeite e deixe descansar mais 30 minutos.",
      "Dobre a massa e deixe descansar 30 minutos.",
      "Dobre novamente e deixe descansar mais 30 minutos.",
      "Dobre a massa mais uma vez e deixe descansar 30 minutos.",
      "Corte o pão e deixe descansar no tabuleiro 15 minutos.",
      "Leve ao forno pré-aquecido a 200 °C durante 20 minutos."
    ]
  },
  {
    id: "pao-caseiro-todos-os-dias", t: "Pão caseiro para todos os dias", c: "pao", e: "🥖",
    s: null, tm: "2h + 1h", d: "Fácil", src: "As minhas receitas (blog)", f: "1rmr5FWFUQdmX9E_O2WHXOAVKDHrYTZ89",
    n: "Dá para 2 pães pequenos e 2 pizzas grandes. A massa aguenta até 2 semanas no frigorífico. 1 copo = 1 cup ≈ 235 ml.",
    i: [
      "6 ½ copos de farinha de trigo", "3 copos de água morna", "1 ½ c. sopa de fermento biológico seco",
      "1 ½ c. sopa de sal grosso", "Farinha de milho para polvilhar q.b."
    ],
    p: [
      "Numa caixa de plástico grande com tampa, misture muito bem todos os ingredientes com uma colher de pau e tape (se a massa ficar muito mole, junte um pouco mais de farinha).",
      "Guarde tapada no frigorífico e use apenas depois de pelo menos 2 horas de repouso.",
      "Quando quiser pão, com as mãos enfarinhadas pegue num pedaço de massa e corte-o com uma faca. Guarde o resto para outra vez.",
      "Sem voltar a amassar, dê-lhe a forma pretendida dobrando as bordas para dentro, sem apertar para não perder o ar.",
      "Deixe repousar no tabuleiro polvilhado com farinha de milho, à temperatura ambiente, pelo menos 30 minutos.",
      "Polvilhe com farinha de trigo e dê uns golpes na massa.",
      "Leve ao forno bem quente durante 30 minutos.",
      "Para pizza: estenda a massa com o rolo, cubra com molho de tomate e os ingredientes preferidos e leve ao forno quente até cozer."
    ]
  },
  {
    id: "baguetes-caseiras", t: "Baguetes caseiras", o: "Baguettes maison", c: "pao", e: "🥖",
    s: [3, "baguetes"], tm: "4 h", d: "Média", src: "La faim des bananes", f: "0BzY_l8VK8soLSEdWV3VCRWhNaEE",
    n: "Dá 3 baguetes grandes ou 4 meias baguetes.",
    i: [
      "500 g de farinha (idealmente T65)", "300 g de água", "10 g de sal",
      "20 g de fermento fresco (ou 1 saqueta de fermento seco)"
    ],
    p: [
      "No robot com gancho, misture a farinha com a água 5 minutos em velocidade baixa. Tape e deixe repousar 1 hora (autólise).",
      "Junte o fermento de um lado e o sal do outro e amasse 7 minutos em velocidade baixa, depois 5 minutos um pouco mais rápido.",
      "Deixe levedar 1h30 em lugar morno e húmido (forno a 40 °C com um pano húmido sobre a taça).",
      "Passe a massa para a bancada enfarinhada e tire-lhe o ar. Divida em 3 ou 4 pedaços, faça bolas e deixe repousar 30 minutos.",
      "Molde as baguetes e coloque-as no tabuleiro com a junta para baixo. Deixe levedar cerca de 1 hora, sem crescerem demasiado.",
      "Pré-aqueça o forno a 230 °C.",
      "Dê golpes nas baguetes com uma lâmina, leve ao forno 20 minutos e deite cerca de 50 g de água no tabuleiro do forno."
    ]
  },
  {
    id: "baguete-maquina-pao", t: "Baguete tradicional na máquina de pão", c: "pao", e: "🥖",
    s: [2, "baguetes"], tm: "2h30", d: "Fácil", src: "Marmiton", f: "1gqW-t_um3JiGpJd_VHm5XQO__KnLfrKM",
    i: ["1 ¼ chávena de água", "1 c. chá de açúcar", "1 c. chá de sal", "3,5 chávenas de farinha T55", "1 c. chá de fermento de padeiro"],
    p: [
      "Coloque todos os ingredientes, pela ordem, na máquina de pão, começando pela água.",
      "Escolha o ciclo DOUGH/massa (amassa sem cozer).",
      "No fim do ciclo (cerca de 1h30), retire a massa para uma superfície bem enfarinhada.",
      "Trabalhe a massa cerca de 5 minutos para tirar as últimas bolhas de ar.",
      "Divida em duas e enrole para formar duas baguetes.",
      "Coloque no forno desligado e deixe levedar cerca de 30 minutos.",
      "Retire do forno e pré-aqueça a 180 °C.",
      "Faça pequenos golpes em cada baguete e coza 30 minutos.",
      "Estão prontas quando soarem a oco."
    ]
  },
  {
    id: "brioche-micheline", t: "Brioche da Micheline", c: "pao", e: "🥐",
    s: null, tm: "15 min + levedar", d: "Fácil", src: "Marmiton", f: "0BzY_l8VK8soLNUpKNWxQOXBBQ0U",
    n: "Truque: use o micro-ondas como estufa — ferva lá água numa taça grande enquanto amassa, depois retire a água e ponha a massa lá dentro com o micro-ondas desligado.",
    i: [
      "1 kg de farinha", "14 g de fermento de padeiro (ou 1 cubo de fermento fresco)", "4 ovos", "125 g de açúcar",
      "125 g de manteiga", "1 c. chá de sal", "30 cl de leite morno (junte aos poucos; pode não ser preciso todo)"
    ],
    p: [
      "Misture a farinha, o fermento, o açúcar e o sal.",
      "Junte os ovos e depois a manteiga amolecida.",
      "Junte o leite morno e amasse até obter uma massa macia e que não cole (cerca de 5 min no robot).",
      "Faça uma bola, coloque numa taça e tape com um pano. Deixe levedar 1h a 1h30, até dobrar de volume.",
      "Tire o ar à massa carregando no meio e volte a trabalhá-la (pode juntar passas ou frutas cristalizadas).",
      "Molde: entrançada, bolas de 80 a 100 g postas às 3 numa forma de cake, caracóis com passas...",
      "Deixe levedar de novo em lugar quente e sem correntes de ar até dobrar de volume.",
      "Coza a 180 °C: 20 min a brioche entrançada, 30 a 35 min na forma de cake, 15 min os caracóis."
    ]
  },
  {
    id: "massa-pizza", t: "Massa de pizza (robot)", o: "Pâte à pizza", c: "pao", e: "🍕",
    s: [1, "pizza"], tm: "1h10", d: "Fácil", src: "Livro do robot de cozinha", f: "0BzY_l8VK8soLRHJhbWhVaEV6eUU",
    i: ["150 g de farinha", "90 g de água morna", "2 c. sopa de azeite", "½ saqueta de fermento de padeiro", "Sal q.b."],
    p: [
      "Coloque a farinha, o fermento e o sal na taça com o gancho. Tape e ligue alguns segundos na velocidade 2, depois passe à 4.",
      "Pela abertura, verta a água morna e o azeite e deixe trabalhar até a massa formar uma bola.",
      "Deixe levedar até dobrar de volume (cerca de 1 hora).",
      "Estenda a massa e coloque a cobertura."
    ]
  },
  {
    id: "massa-pao-robot", t: "Pão de massa simples (robot)", o: "Pâte à pain", c: "pao", e: "🍞",
    s: [800, "g de pão"], tm: "2h40", d: "Fácil", src: "Livro do robot de cozinha", f: "0BzY_l8VK8soLRHJhbWhVaEV6eUU",
    i: ["500 g de farinha", "30 cl de água morna", "2 saquetas de fermento de padeiro", "10 g de sal"],
    p: [
      "Coloque a farinha, o sal e o fermento na taça. Com o gancho e a tampa, ligue alguns segundos na velocidade 1.",
      "Junte a água morna pela abertura e amasse 8 minutos. Deixe repousar à temperatura ambiente cerca de 30 minutos.",
      "Volte a trabalhar a massa à mão e faça uma bola. Coloque num tabuleiro untado e enfarinhado e deixe levedar em lugar morno cerca de 1 hora.",
      "Pré-aqueça o forno a 240 °C. Faça golpes no pão com uma lâmina e pincele com água morna.",
      "Coloque um recipiente com água dentro do forno (ajuda a formar uma côdea dourada) e coza 40 minutos."
    ]
  },

  // ───────────────────────── BOLOS ─────────────────────────
  {
    id: "bolo-de-iogurte", t: "Bolo de iogurte", c: "bolos", e: "🍰",
    s: [1, "bolo"], tm: "1 h", d: "Fácil", src: "Pingo Doce", f: "1Avxc_UlJeq5ZXET2lcCGoNDwRLG-T0gJ",
    n: "O copo do iogurte serve de medida. Pode usar iogurte natural ou de qualquer sabor.",
    i: [
      "1 iogurte natural", "4 ovos M", "3 copos de açúcar", "¼ copo de óleo", "2 copos de farinha",
      "2 c. chá de fermento em pó", "2 c. sopa de açúcar em pó", "Manteiga para untar q.b."
    ],
    p: [
      "Pré-aqueça o forno a 180 °C.",
      "Unte uma forma de chaminé com manteiga e reserve.",
      "Numa taça, junte o iogurte e os ovos. Usando o copo do iogurte como medida, junte o açúcar, o óleo, a farinha e o fermento.",
      "Bata com a batedeira até a massa ficar homogénea.",
      "Deite na forma e leve ao forno 40 a 45 minutos, até um palito sair limpo.",
      "Retire e deixe arrefecer ligeiramente antes de desenformar.",
      "Antes de servir, polvilhe com o açúcar em pó."
    ]
  },
  {
    id: "bolo-facil-de-maca", t: "Bolo fácil de maçã", o: "Gâteau facile aux pommes", c: "bolos", e: "🍎",
    s: [6, "pessoas"], tm: "40 min", d: "Muito fácil", src: "Marmiton", f: "1UNuru3sH1NSJFu58rs_N5ADLZuQLkK75",
    n: "Receita da avó da autora — resulta sempre.",
    i: ["6 maçãs", "3 ovos", "150 g de açúcar", "150 g de manteiga", "225 g de farinha", "1 saqueta de fermento"],
    p: [
      "Descasque as maçãs e corte-as em pedaços.",
      "Separe as gemas das claras.",
      "Bata as gemas numa taça, junte o açúcar e misture bem. Junte a manteiga derretida.",
      "Bata as claras em castelo firme.",
      "Junte a farinha e o fermento à mistura das gemas.",
      "Junte uma colher grande de claras e misture vigorosamente. Depois envolva delicadamente o resto das claras.",
      "Junte os pedaços de maçã.",
      "Unte e enfarinhe uma forma, verta a massa e leve ao forno a 150 °C durante 25 a 30 minutos.",
      "Está pronto quando a ponta de uma faca sair seca."
    ]
  },
  {
    id: "genoise", t: "Genoise leve", o: "Une génoise poids plume", c: "bolos", e: "🧁",
    s: [1, "forma de 24 cm"], tm: "30 min", d: "Fácil", src: "Amuse-bouche", f: "1kbFJneTVBvSyf9jftYey_HQLp-wtJD-x",
    n: "Faça-a na véspera: fica menos quebradiça e corta-se melhor em discos.",
    i: ["4 ovos", "120 g de açúcar", "120 g de farinha", "½ saqueta de fermento químico"],
    p: [
      "Separe as claras das gemas e misture o fermento com a farinha.",
      "Na batedeira, bata as claras em castelo. Quando estiverem espumosas, junte o açúcar e bata até obter um merengue brilhante e firme.",
      "Junte logo as gemas e, de seguida, a farinha. Não bata demasiado tempo.",
      "Verta numa forma de 24 cm untada e enfarinhada e leve ao forno 20 minutos a 180 °C.",
      "Desenforme e deixe arrefecer numa grelha."
    ]
  },
  {
    id: "genoise-amendoa", t: "Genoise de amêndoa", o: "Génoise amande", c: "bolos", e: "🌰",
    s: [6, "pessoas"], tm: "55 min", d: "Fácil", src: "Cuisine Actuelle", f: "1clIuyQgL-4LWQuNLNeGhuUmXAy-l_lvf",
    n: "A receita não indica a temperatura do forno; 180 °C é o habitual.",
    i: [
      "150 g de farinha", "150 g de manteiga com sal (à temperatura ambiente)", "140 g de açúcar", "50 g de amêndoa em pó",
      "4 ovos grandes", "4 c. sopa de leite gordo", "1 saqueta de açúcar baunilhado", "1 saqueta de fermento químico"
    ],
    p: [
      "Corte a manteiga em pedaços e coloque na taça do robot. Cubra com o açúcar e o açúcar baunilhado e bata em potência média.",
      "Parta os ovos por cima, continue a bater e junte o leite.",
      "Junte a farinha em chuva, a amêndoa em pó e o fermento. Bata até ficar homogéneo.",
      "Verta numa forma antiaderente e leve ao forno 30 minutos.",
      "Deixe arrefecer e sirva simples ou com creme de amêndoa."
    ]
  },
  {
    id: "bananier", t: "Bolo de chocolate e banana", o: "Bananier", c: "bolos", e: "🍌",
    s: [6, "pessoas"], tm: "50 min", d: "Muito fácil", src: "Marmiton", f: "0BzY_l8VK8soLazY5ZGlWWEtHUjA",
    i: ["2 bananas", "200 g de chocolate para culinária", "4 ovos", "100 g de açúcar", "50 g de farinha", "150 g de manteiga"],
    p: [
      "Pré-aqueça o forno a 160 °C.",
      "Derreta o chocolate com a manteiga em lume muito brando.",
      "Junte os ovos um a um, o açúcar e a farinha, misturando bem de cada vez.",
      "Unte e enfarinhe uma forma e verta metade da massa.",
      "Descasque as bananas, corte-as às rodelas e cubra o chocolate com elas.",
      "Verta o resto da massa e coza 35 minutos a 160 °C.",
      "Deixe arrefecer antes de servir."
    ]
  },
  {
    id: "quatre-quarts", t: "Quatre-quarts da Mamie Raymonde", o: "Quatre quarts traditionnel", c: "bolos", e: "🍋",
    s: [6, "pessoas"], tm: "1h45", d: "Fácil", src: "Marmiton", f: "0BzY_l8VK8soLLWlsVkxoUGxKMzg",
    n: "O segredo: pese os ovos com casca — esse é o peso do açúcar, da farinha e da manteiga (5 ovos ≈ 300 g). Variante: pôr maçãs ou pêssegos no fundo da forma.",
    i: [
      "5 ovos", "300 g de açúcar (o mesmo peso dos ovos)", "300 g de farinha (o mesmo peso)",
      "300 g de manteiga (o mesmo peso)", "1 c. sopa de rum", "1 saqueta de fermento", "1 pitada de sal"
    ],
    p: [
      "Separe as gemas das claras.",
      "Misture as gemas com o açúcar à colher de pau durante meia hora — deve crescer e ficar esbranquiçado.",
      "Junte devagar a farinha peneirada e, no fim, o fermento. Derreta um pouco de manteiga e vá juntando se for preciso para ajudar a envolver a farinha.",
      "Junte o rum e o resto da manteiga.",
      "Bata as claras em castelo com uma pitada de sal e envolva-as delicadamente (mexer devagar no fim).",
      "Unte a forma de cake com manteiga e pré-aqueça o forno só alguns minutos.",
      "Coza a 160 °C durante 1 hora, no terço inferior do forno. Evite abrir a porta."
    ]
  },
  {
    id: "cake-simples", t: "Cake simples", o: "Cake nature sucré facile", c: "bolos", e: "🍞",
    s: [6, "pessoas"], tm: "45 min", d: "Fácil", src: "CuisineAZ", f: "1QAHIj-cxlNxwAti-VBf7nRklP0ALhmYD",
    n: "Bom com compota, chocolate, caramelo ou fruta — ao lanche ou à sobremesa.",
    i: [
      "200 g de farinha", "100 g de açúcar", "1 saqueta de açúcar baunilhado", "2 ovos", "15 cl de leite",
      "5 cl de óleo", "½ saqueta de fermento químico", "50 g de manteiga (para untar)"
    ],
    p: [
      "Pré-aqueça o forno a 180 °C. Bata os ovos numa taça com o açúcar e o açúcar baunilhado, com a vara, até ficar espumoso.",
      "Junte a farinha, o fermento e o óleo e dilua com o leite aos poucos. Misture até ficar homogéneo.",
      "Unte e enfarinhe uma forma de cake e verta a massa. Leve ao forno 30 minutos (a lâmina de uma faca deve sair limpa).",
      "Quando estiver dourado, retire e deixe arrefecer à temperatura ambiente."
    ]
  },
  {
    id: "bolo-masterchef", t: "Bolo MasterChef de nozes com mascarpone e caramelo", o: "Apple & Vanilla Mascarpone Cake with Caramel", c: "bolos", e: "🎂",
    s: [1, "tabuleiro 20×30"], tm: "1 h", d: "Média", src: "MasterChef", f: "1b03xriziYh3_aQP6hOigINJO1w25u4D7",
    i: [
      "# Bolo de manteiga e nozes", "250 g de manteiga amolecida", "250 g de açúcar", "Raspa fina de 1 limão", "4 ovos grandes",
      "125 g de farinha", "65 g de nozes picadas", "65 g de amêndoa ou avelã moída", "2 c. chá de fermento",
      "# Mascarpone de baunilha", "250 g de mascarpone", "3 c. sopa de açúcar em pó", "2 c. chá de pasta de baunilha",
      "# Molho de caramelo", "80 g de manteiga", "600 ml de natas", "2 chávenas de açúcar mascavado"
    ],
    p: [
      "# Bolo",
      "Pré-aqueça o forno a 160 °C e forre um tabuleiro de 20 × 30 cm com papel vegetal.",
      "Bata a manteiga com o açúcar até ficar leve e fofo. Junte os ovos um a um, batendo bem entre cada um.",
      "Junte a raspa de limão, a farinha, o fermento, as nozes e a amêndoa e misture.",
      "Espalhe no tabuleiro e coza 30 minutos, ou até estar cozido. Deixe arrefecer 10 minutos antes de desenformar.",
      "# Mascarpone",
      "Misture os três ingredientes numa taça e guarde no frigorífico até usar.",
      "# Caramelo",
      "Num tacho, derreta todos os ingredientes juntos, mexendo até o açúcar dissolver. Não deixe ferver.",
      "Deixe fervilhar até engrossar ligeiramente, 5 a 10 minutos."
    ]
  },
  {
    id: "raisin-bread", t: "Pão doce de passas e nozes", o: "Raisin Bread", c: "bolos", e: "🍇",
    s: [2, "pães"], tm: "1h15", d: "Fácil", src: "food.com", f: "0BzY_l8VK8soLamVHb3NPMnJjOEE",
    n: "Com metade da receita (1 pão), a autora cozeu 35 minutos. 1 chávena = 1 cup americana (≈ 240 ml).",
    i: [
      "2 chávenas de passas", "2 chávenas de água", "2 c. chá de bicarbonato de sódio", "2 ovos", "1 ½ chávena de açúcar",
      "2 c. chá de canela", "1 pitada de sal", "1 ½ c. chá de baunilha", "3 chávenas de farinha", "1 chávena de nozes picadas"
    ],
    p: [
      "Junte as passas, a água e o bicarbonato e leve a ferver.",
      "Quando começar a espumar, retire do lume e reserve.",
      "Bata os ovos com o açúcar, o sal, a baunilha e a canela.",
      "Envolva a farinha e as nozes e junte à mistura das passas.",
      "Verta em 2 formas de pão bem untadas e enfarinhadas.",
      "Coza a 175 °C cerca de 1 hora.",
      "Desenforme e deixe arrefecer."
    ]
  },
  {
    id: "galette-des-rois", t: "Galette des rois de Cyril Lignac", c: "bolos", e: "👑",
    s: [4, "pessoas"], tm: "2h30", d: "Média", src: "Paris Secret", f: "1tGrw5X_bgXjBVryzlbV7rjZx-x11UjNR",
    n: "Se não tiver fava, use um feijão vermelho ou branco cru.",
    i: [
      "# Massa", "2 rolos de massa folhada de manteiga", "2 gemas (para pincelar)",
      "# Creme pasteleiro", "2 ovos", "50 g de açúcar", "30 g de farinha", "25 cl de leite", "1 vagem de baunilha",
      "# Creme de amêndoa", "3 gemas", "125 g de amêndoa em pó", "125 g de manteiga amolecida", "100 g de açúcar",
      "# Frangipane", "1 tampinha de rum", "Uma fava (brinde)"
    ],
    p: [
      "Creme pasteleiro: bata os ovos com o açúcar até esbranquiçar. Junte a farinha e misture devagar.",
      "Abra a vagem de baunilha, raspe as sementes e junte-as ao leite num tacho. Junte a mistura de ovos e deixe engrossar em lume brando. Cubra com película e deixe arrefecer 1 hora.",
      "Creme de amêndoa: bata a manteiga amolecida com o açúcar até esbranquiçar. Junte as gemas uma a uma e depois a amêndoa.",
      "Misture o creme pasteleiro com o creme de amêndoa e o rum. Coloque num saco de pasteleiro.",
      "Sobre o primeiro disco de massa, espalhe o creme em espiral a partir do centro, parando a 2 cm do bordo.",
      "Coloque a fava no creme e pincele o bordo da massa com gema.",
      "Cubra com o segundo disco, fechando bem os bordos. Pincele com gema e desenhe riscas com uma faca.",
      "Leve ao frigorífico 1 hora.",
      "Pré-aqueça o forno a 200 °C, coza 10 minutos, baixe para 180 °C e continue cerca de 30 minutos.",
      "Sirva morna."
    ]
  },

  // ───────────────────────── SOBREMESAS E DOCES ─────────────────────────
  {
    id: "pasteis-de-nata", t: "Pastéis de nata", c: "sobremesas", e: "🥧",
    s: null, tm: "1h30", d: "Média", src: "Diogo Duarte", f: "doc:12WxTFGnV0iSU2Dj5Gq5vGF0oznxX-jLszdphU9I1eyw",
    i: [
      "600 g de massa folhada em retângulo (pode ser comprada)", "500 ml de leite", "1 casca de limão", "1 pau de canela",
      "60 g de farinha de trigo sem fermento", "500 g de açúcar", "250 ml de água", "7 gemas"
    ],
    p: [
      "Com o rolo, estenda a massa num retângulo. Enrole-a num rolo, apertando bem, e corte rodelas com 1,5 cm.",
      "Coloque as rodelas nas formas untadas com manteiga. Com os polegares, pressione o centro e espalhe a massa até aos bordos (bordos mais grossos, fundo fininho). Ponha as formas num tabuleiro.",
      "Dissolva a farinha num pouco de leite.",
      "Leve o restante leite ao lume com o pau de canela e a casca de limão. Quando ferver, junte a farinha e mexa bem até voltar a ferver. Apague o lume.",
      "Num tacho, leve ao lume o açúcar e a água, mexendo. Depois de começar a ferver, deixe ferver exatamente 3 minutos.",
      "Junte a calda em fio ao leite e misture bem. Coe e deixe arrefecer — mesmo até ficar frio.",
      "Junte as gemas ao creme e mexa bem. Encha as formas.",
      "Leve ao forno pré-aquecido a 250 °C durante 17 minutos.",
      "Desenforme e sirva quentes ou frios, polvilhados com açúcar em pó ou canela."
    ]
  },
  {
    id: "tarte-pastel-de-nata", t: "Tarte de pastel de nata (Bimby)", c: "sobremesas", e: "🥧",
    s: [1, "tarte"], tm: "55 min", d: "Fácil", src: "Mundo de Receitas Bimby", f: "1Kt3f5nMpIvF1fL5Sq6Ru_LD4tG8V5rnD",
    i: [
      "1 base de massa folhada", "240 g de açúcar", "250 ml de água", "500 ml de leite", "70 g de farinha maizena",
      "6 gemas", "1 pau de canela", "1 casca de limão"
    ],
    p: [
      "Pré-aqueça o forno a 200 °C.",
      "Coloque todos os ingredientes no copo (exceto o pau de canela e a casca de limão) e misture 40 seg/vel 4.",
      "Coloque a borboleta, junte a canela e a casca de limão e programe 18 min/90 °C/vel 1,5.",
      "Forre uma forma de fundo amovível com a massa folhada e pique o fundo com um garfo.",
      "Retire o pau de canela e a casca de limão, deite o creme sobre a massa e leve ao forno cerca de 30 minutos, na parte mais baixa.",
      "Pode rodar a forma após 15 minutos para cozer por igual."
    ]
  },
  {
    id: "pasteis-maravilha", t: "Pastéis maravilha", c: "sobremesas", e: "🧁",
    s: null, tm: "30 min", d: "Fácil", src: "", f: "0BzY_l8VK8soLckZBU19WNDJtRk0",
    n: "A autora usou 300 g de açúcar em vez de 400 g.",
    i: ["400 g de açúcar", "4 ovos", "0,5 l de leite", "100 g de farinha", "50 g de margarina", "Canela q.b."],
    p: [
      "Misture numa taça o açúcar, os ovos, o leite, a farinha e a margarina amolecida.",
      "Unte formas individuais, polvilhe-as com farinha e encha-as com o preparado.",
      "Polvilhe com canela e leve ao forno forte, num tabuleiro, durante 15 minutos.",
      "Desenforme e passe para forminhas de papel."
    ]
  },
  {
    id: "delicias-de-leite", t: "Delícias de leite", c: "sobremesas", e: "🍮",
    s: [16, "unidades"], tm: "50 min", d: "Fácil", src: "Mafalda Agante", f: "1FwwZdJ6-zSs2xf4zrKxdXtXBI8Ncxmr6",
    n: "Dá 16 a 18 unidades. A autora faz com 350 g de açúcar.",
    i: ["500 ml de leite", "25 g de manteiga", "400 g de açúcar", "100 g de farinha", "4 ovos", "Raspa de ½ limão"],
    p: [
      "Leve o leite ao lume até levantar fervura. Entretanto, aqueça o forno a 175 °C.",
      "Derreta a manteiga no micro-ondas.",
      "Num recipiente, misture bem o açúcar, a farinha e a manteiga derretida.",
      "Junte os ovos, a raspa de limão e o leite. Bata até ficar uniforme.",
      "Deite em formas pequenas untadas com manteiga.",
      "Leve ao forno num tabuleiro em banho-maria durante 35 minutos, a 175 °C.",
      "Deixe arrefecer um pouco e desenforme."
    ]
  },
  {
    id: "flan-de-coco", t: "Pudim de coco", o: "Flan à la noix de coco", c: "sobremesas", e: "🥥",
    s: [6, "pessoas"], tm: "40 min", d: "Muito fácil", src: "Marmiton", f: "0BzY_l8VK8soLMGpDWDJ4RVZ0cXc",
    n: "Use a lata do leite condensado para medir o leite.",
    i: ["1 lata de leite condensado (375 g)", "3 ovos", "5 c. sopa de coco ralado", "1 ½ lata de leite"],
    p: [
      "Triture tudo numa taça com a varinha.",
      "Coza 30 minutos em forno médio (180 °C), em banho-maria (uma forma de pudim dentro de uma forma maior serve).",
      "Se a crosta de coco dourar demasiado depressa, cubra com papel de alumínio.",
      "Depois de arrefecer, leve ao frigorífico."
    ]
  },
  {
    id: "flan-parisien", t: "Flan parisiense de Christophe Michalak", o: "Flan parisien", c: "sobremesas", e: "🍮",
    s: [5, "pessoas"], tm: "1 h + arrefecer", d: "Média", src: "Mercotte", f: "1outxfbMnmmG3lazOVJR_aejPFsUj5fdz",
    n: "Para 4 a 6 pessoas, num aro de pastelaria de 18 cm.",
    i: ["50 cl de leite", "25 cl de natas (crème fleurette)", "125 g de açúcar", "100 g de gemas", "50 g de maizena"],
    p: [
      "Leve o leite e as natas a ferver.",
      "Numa taça, misture as gemas, o açúcar e a maizena. Verta por cima o leite a ferver, volte ao lume e deixe cozer 30 segundos depois de retomar a fervura.",
      "Passe para um prato, cubra com película em contacto e deixe arrefecer completamente.",
      "Unte e enfarinhe o aro e coloque-o num tabuleiro com papel. Pré-aqueça o forno a 180 °C.",
      "Bata o creme frio para o amaciar, verta-o no aro e alise.",
      "Leve ao forno cerca de 35 minutos: a superfície deve ficar cor de caramelo, com algumas manchas escuras.",
      "Deixe arrefecer numa grelha antes de passar para o prato de servir."
    ]
  },
  {
    id: "molotof", t: "Molotof", c: "sobremesas", e: "☁️",
    s: [10, "doses"], tm: "50 min", d: "Fácil", src: "Petiscos.com", f: "0BzY_l8VK8soLeFR1SWpBaFJTV1U",
    n: "Não abra o forno durante os cerca de 38 minutos em que o molotof está a cozinhar — a diferença de temperatura estraga-o.",
    i: ["8 claras de ovo", "8 c. sopa de açúcar", "Caramelo q.b."],
    p: [
      "Bata as claras em castelo, juntando o açúcar uma colherada de cada vez.",
      "Junte caramelo a gosto (normalmente até ficar cor de café com leite).",
      "Coloque numa forma de buraco previamente untada com caramelo.",
      "Pré-aqueça o forno a 180 °C.",
      "Coza 8 minutos, desligue o forno e deixe repousar lá dentro 30 minutos, sem abrir a porta.",
      "Retire do forno e desenforme de imediato."
    ]
  },
  {
    id: "sericaia", t: "Sericaia", c: "sobremesas", e: "🍮",
    s: null, tm: "1 h", d: "Média", src: "Paulo Ferreira", f: "0BzY_l8VK8soLQzUtb0I1LU1iRms",
    i: ["6 ovos", "250 g de açúcar", "Um pouco de água", "0,5 l de leite morno", "3 c. sopa de farinha", "1 casca de limão", "Canela em pó q.b."],
    p: [
      "Faça uma calda de açúcar em ponto de pérola.",
      "Misture o leite com a farinha e, a seguir, as gemas.",
      "Junte este creme ao açúcar em ponto e leve ao lume até fazer ponto de estrada.",
      "Bata as claras em castelo e envolva-as na massa.",
      "Deite tudo num prato próprio e polvilhe com bastante canela.",
      "Leve ao forno com um tabuleiro com água por baixo.",
      "Quando começar a crescer, faça os cortes. Deixe acabar de cozer."
    ]
  },
  {
    id: "toucinho-do-ceu", t: "Toucinho do céu", c: "sobremesas", e: "✨",
    s: [8, "pessoas"], tm: "50 min", d: "Média", src: "Blog", f: "0BzY_l8VK8soLQXdMc0d0LTBJeTA",
    i: [
      "300 g de açúcar", "150 g de miolo de amêndoa moída sem pele", "12 gemas", "1 clara", "1 dl de água",
      "Açúcar em pó q.b.", "Miolo de amêndoa sem pele para decorar q.b."
    ],
    p: [
      "Leve ao lume o açúcar e a água e deixe ferver.",
      "Junte a amêndoa moída e deixe ferver mais 5 minutos, mexendo de vez em quando. Retire do lume e deixe amornar.",
      "Junte as gemas batidas e volte ao lume, mexendo sempre até a massa se soltar do fundo do tacho.",
      "Retire e envolva a clara batida em castelo.",
      "Verta numa forma de 23 cm untada com manteiga e farinha e coza a 180 °C durante 30 minutos.",
      "Sirva polvilhado com açúcar em pó e decorado com amêndoa."
    ]
  },
  {
    id: "tiramisu", t: "Tiramisu dos cunhados", c: "sobremesas", e: "☕",
    s: [8, "pessoas"], tm: "30 min + 4 h", d: "Fácil", src: "Tampa de mascarpone", f: "1YWJNKUrQeZC0lN6GHiSGjitqWZ0LtUYh",
    i: [
      "3 ovos grandes", "100 g de açúcar mascavado", "1 saqueta de açúcar baunilhado", "500 g de mascarpone",
      "24 biscoitos de champanhe", "½ l de café forte", "30 g de cacau em pó sem açúcar"
    ],
    p: [
      "Separe as claras das gemas. Misture as gemas com o açúcar e o açúcar baunilhado.",
      "Junte o mascarpone com a vara.",
      "Bata as claras em castelo e envolva-as delicadamente com uma espátula.",
      "Prepare o café. Molhe os biscoitos no café e forre o fundo da forma.",
      "Cubra com uma camada de creme. Alterne biscoitos e creme, terminando com creme.",
      "Polvilhe com cacau e leve ao frigorífico pelo menos 4 horas."
    ]
  },
  {
    id: "far-breton", t: "Far bretão de ameixas", o: "Far breton aux pruneaux", c: "sobremesas", e: "🫐",
    s: [6, "pessoas"], tm: "1h45", d: "Fácil", src: "Marmiton", f: "0BzY_l8VK8soLalJtT0luY0RHdjA",
    n: "Importante: depois de ir ao forno, não abra a porta durante uma hora.",
    i: ["200 g de farinha", "200 g de açúcar", "4 ovos", "2 saquetas de açúcar baunilhado", "75 cl de leite", "20 ameixas secas", "Manteiga para a forma q.b."],
    p: [
      "Prepare a massa misturando a farinha, o leite, o açúcar, os ovos e o açúcar baunilhado. Deixe repousar 1 hora.",
      "Pré-aqueça o forno a 200 °C. Derreta um pedaço de manteiga numa travessa (de barro, se possível) e espalhe bem no fundo e nos lados.",
      "Verta a massa na travessa e junte as ameixas (passadas antes por farinha para não irem ao fundo).",
      "Coza meia hora a 200 °C.",
      "Desligue o forno e deixe ficar mais meia hora lá dentro."
    ]
  },
  {
    id: "clafoutis-cerejas", t: "Clafoutis de cerejas", o: "Clafoutis suprême aux cerises", c: "sobremesas", e: "🍒",
    s: [6, "pessoas"], tm: "1h05", d: "Fácil", src: "Marmiton", f: "0BzY_l8VK8soLNFdxZGFWVXNGM0U",
    i: [
      "5 ovos", "1 pitada de sal", "130 g de açúcar (+ 1 c. chá)", "80 g de farinha", "60 g de manteiga (+ 1 c. chá e para untar)",
      "30 cl de leite", "400 g de cerejas", "1 saqueta de açúcar baunilhado (opcional)"
    ],
    p: [
      "Pré-aqueça o forno a 180 °C.",
      "Bata os ovos como para omelete. Junte o sal e o açúcar e misture bem — deve ficar espumoso.",
      "Junte a manteiga derretida, depois a farinha e dilua com o leite.",
      "Lave e tire o pé às cerejas e salteie-as 3 a 5 minutos numa frigideira em lume brando com 1 colher de chá de açúcar e 1 de manteiga.",
      "Disponha as cerejas com o suco numa travessa bem untada.",
      "Verta a massa por cima e coza 25 minutos a 180 °C. Sirva morno."
    ]
  },
  {
    id: "tarte-bounty", t: "Tarte Bounty (chocolate e coco)", c: "sobremesas", e: "🥥",
    s: [8, "pessoas"], tm: "50 min", d: "Muito fácil", src: "Marmiton", f: "0BzY_l8VK8soLaWZNT3dqbDRBRFU",
    i: [
      "1 base de massa sablée ou quebrada", "150 g de coco ralado", "150 g de manteiga", "150 g de açúcar", "3 ovos",
      "20 cl de natas líquidas", "150 g de chocolate negro"
    ],
    p: [
      "Forre uma tarteira com a massa, cubra com papel de alumínio e feijões e coza em branco 10 minutos.",
      "Misture o coco, o açúcar, a manteiga mole e os ovos.",
      "Verta sobre a massa e leve de novo ao forno 30 minutos.",
      "Derreta o chocolate com as natas e verta sobre a tarte.",
      "Deixe arrefecer antes de servir."
    ]
  },
  {
    id: "tarte-limao-merengada", t: "Tarte de limão merengada", o: "Tarte au citron meringuée", c: "sobremesas", e: "🍋",
    s: [1, "tarte"], tm: "1h45", d: "Média", src: "Hervé Cuisine", f: "1Vte23RZwYdB6UEJv2hShEwKHOEzgE04T",
    i: [
      "# Massa sablée", "250 g de farinha", "150 g de manteiga", "50 g de açúcar", "50 g de açúcar em pó (glace)", "1 ovo", "1 pitada de sal",
      "# Creme de limão", "150 ml de sumo de limão", "Raspa de 1 limão", "150 g de açúcar (ou menos, a gosto)",
      "3 ovos", "1 c. sopa de maizena (ou farinha)", "75 g de manteiga",
      "# Merengue (opcional)", "2 claras", "75 g de açúcar"
    ],
    p: [
      "# Massa",
      "Bata o ovo com os açúcares e o sal.",
      "Junte a farinha de uma vez e amasse com a ponta dos dedos.",
      "Junte a manteiga mole em pedaços, amasse rapidamente e forme uma bola.",
      "Envolva em película e leve ao frio pelo menos 1 hora.",
      "Estenda na tarteira, cubra com papel vegetal e feijões (ou bolinhas de cerâmica).",
      "Coza 10 minutos a 180 °C, retire o peso e coza mais 8 a 10 minutos, até dourar. Reserve.",
      "# Creme de limão",
      "Retire a raspa de um limão não tratado. Esprema os limões (3 a 4 por tarte) e leve o sumo a ferver com a raspa.",
      "Bata os ovos com o açúcar e a maizena. Junte o sumo quente em fio, sem parar de bater.",
      "Volte a lume médio e deixe engrossar, mexendo sempre, até obter um creme.",
      "Deixe amornar e junte a manteiga mole em pedaços, batendo bem.",
      "Recheie a base cozida e reserve no frio.",
      "# Merengue",
      "Bata as claras em castelo; quando estiverem firmes, junte o açúcar e bata mais alguns segundos.",
      "Cubra a tarte com o merengue (com um saco de pasteleiro) e leve ao grill do forno cerca de 1 minuto para corar — ou use um maçarico."
    ]
  },
  {
    id: "buche-limao-merengada", t: "Tronco de Natal de tarte de limão", o: "Bûche tarte citron meringuée", c: "sobremesas", e: "🎄",
    s: [7, "pessoas"], tm: "2 dias", d: "Média", src: "Pâtisserie.News", f: "1Qt0K3IruSOUSK_xrkNxrxSPs0uB23Jir",
    n: "Para 6 a 8 pessoas. Os merengues podem ser feitos vários dias antes. Para descongelar, conte cerca de 6 horas: glaceie de manhã para servir à noite.",
    i: [
      "# Merengue francês", "150 g de claras", "300 g de açúcar", "Chocolate branco derretido q.b. (para pincelar)",
      "# Sablé bretão", "2 gemas", "120 g de açúcar", "120 g de manteiga mole", "190 g de farinha", "2 g de sal",
      "10 g de fermento químico", "1 c. chá de extrato de baunilha",
      "# Mousse de limão", "Raspa e sumo de 1 ½ limão", "2 ovos", "40 g de manteiga amolecida", "80 g de açúcar em pó (glace)",
      "40 cl de natas líquidas gordas",
      "# Cobertura amarela", "9 folhas de gelatina", "300 g de água", "400 g de açúcar", "Corante amarelo q.b."
    ],
    p: [
      "# Merengue",
      "Pré-aqueça o forno a 90 °C. Bata as claras e junte o açúcar em 3 vezes.",
      "Com o saco de pasteleiro, forme o merengue sobre papel vegetal com a forma do molde (retangular para forma de tronco), mais pequeno que a forma — será o recheio. Com o resto, faça pequenos merengues para decorar.",
      "Coza 2 horas a 90 °C. Depois pincele o merengue com uma camada fina de chocolate branco, para não amolecer no congelador.",
      "# Sablé bretão",
      "Bata no robot as gemas com o açúcar até esbranquiçar. Junte a manteiga mole e misture até ficar liso.",
      "Junte a farinha peneirada, o fermento, a baunilha e o sal e misture até ficar homogéneo.",
      "Envolva em película e guarde no frio 2 horas (indispensável — a massa tem muita manteiga).",
      "Pré-aqueça o forno a 180 °C. Estenda a massa com 5 mm e corte um retângulo com um aro retangular mais pequeno que a forma. Coza cerca de 15 minutos (10 podem chegar), mantendo o aro.",
      "# Mousse de limão",
      "Misture a raspa, o sumo, os ovos, a manteiga e o açúcar numa taça em banho-maria. Mexa sem parar até ferver. Reserve no frio.",
      "Bata as natas bem frias em chantilly (não precisa de ficar muito firme) e envolva-as no creme de limão. Coloque num saco de pasteleiro.",
      "# Montagem",
      "Encha o fundo da forma com mousse, subindo bem pelas paredes. Ponha o merengue e cubra com o resto da mousse. Termine com o sablé. Leve ao congelador, idealmente uma noite.",
      "# Cobertura",
      "Amoleça a gelatina em água fria. Ferva a água, o açúcar e o corante. Fora do lume, junte a gelatina.",
      "Quando a cobertura estiver a 34 °C, desenforme o tronco acabado de sair do congelador e cubra-o.",
      "Decore com os merengues e guarde no frigorífico."
    ]
  },
  {
    id: "semifrio-chocolate", t: "Semifrio de chocolate e praliné", o: "Entremets chocolat praliné feuilleté", c: "sobremesas", e: "🍫",
    s: [10, "pessoas"], tm: "1 dia", d: "Média", src: "Beau à la louche", f: "doc:11cFMLUHhy82L-Tsb1MSL8nT9vD9FI7AhzMXcSHZpdK0",
    n: "Preparar na véspera. Para um aro de 20 cm (num maior o bolo fica só mais baixo). Pode aromatizar a mousse (fava tonka, canela, gengibre) ou juntar uma camada de fruta.",
    i: [
      "# Biscoito de chocolate", "60 g de chocolate negro", "1 clara", "1 ovo inteiro", "½ gema", "2 g de fécula",
      "# Praliné estaladiço", "100 g de chocolate negro", "300 g de pralin (pasta de frutos secos caramelizados)", "150 g de crepes dentelle (gavottes) esfarelados",
      "# Mousse de chocolate", "550 g de chocolate negro", "12 claras", "1 boa pitada de sal"
    ],
    p: [
      "# Biscoito",
      "Pré-aqueça o forno a 150 °C. Derreta o chocolate em banho-maria e bata a clara em castelo.",
      "Fora do lume, junte ao chocolate o ovo inteiro e a meia gema, mexendo bem. Junte a fécula e envolva delicadamente a clara.",
      "Unte e enfarinhe o aro, coloque-o num tabuleiro com papel vegetal, espalhe a massa e coza cerca de 10 minutos.",
      "# Praliné estaladiço",
      "Derreta o chocolate em banho-maria e junte o pralin e os crepes esfarelados.",
      "Forre o aro com uma tira de acetato e espalhe esta mistura sobre o biscoito. Calque com as costas de uma colher e leve ao frigorífico.",
      "# Mousse",
      "Derreta o chocolate em banho-maria. Bata as claras em castelo com o sal.",
      "Envolva delicadamente o chocolate nas claras até ficar homogéneo.",
      "Verta sobre o praliné, alise, cubra com película e leve ao frigorífico meio dia. Decore a gosto."
    ]
  },
  {
    id: "floresta-negra-framboesa", t: "Floresta negra de framboesa", o: "Vosgienne ou forêt noire aux framboises", c: "sobremesas", e: "🍓",
    s: [10, "pessoas"], tm: "2 dias", d: "Média", src: "Marmiton", f: "0BzY_l8VK8soLZWhsN2pmb2laTEE",
    n: "Para 8 a 12 pessoas. Prepara-se em 2 dias.",
    i: [
      "# Biscoito de chocolate", "8 ovos", "400 g de açúcar", "200 g de farinha", "2 c. sopa de cacau sem açúcar", "1 pitada de sal",
      "# Chantilly e recheio", "1 l de natas frescas", "4 saquetas de fixador de chantilly", "4 saquetas de açúcar baunilhado",
      "4 c. sopa de açúcar", "500 g de framboesas congeladas", "1 cálice de aguardente de framboesa (ou kirsch)",
      "100 g de chocolate negro (para as raspas)"
    ],
    p: [
      "# Dois dias antes",
      "Raspas: derreta o chocolate, espalhe numa pedra mármore e deixe arrefecer. Raspe com uma faca larga, puxando para si. Guarde as raspas no frio.",
      "Biscoito: pré-aqueça o forno a 180 °C. Bata as 8 gemas com o açúcar até dobrarem de volume.",
      "Bata as claras em castelo firme com uma pitada de sal.",
      "Importante: junte 1/4 das claras e 1 colher de sopa de água às gemas e bata tudo mais 10 minutos.",
      "Só então junte a farinha peneirada e o cacau e envolva delicadamente o resto das claras.",
      "Unte bem uma forma de 28 cm de fundo amovível, verta a massa e coza 40 minutos (entre 150 e 200 °C).",
      "# Na véspera",
      "Chantilly: bata as natas acabadas de tirar do frigorífico; após alguns minutos junte o fixador misturado com os açúcares e bata até ficar firme. Guarde no frio.",
      "Montagem: corte o biscoito em 3 discos (ou 2). Coloque a base num cartão, regue com algumas gotas de aguardente, barre com 1 cm de chantilly e espete as framboesas ainda congeladas.",
      "Coloque o segundo disco e repita (e o terceiro, se houver).",
      "Use metade da chantilly para cobrir todo o bolo e tapar os buracos. Decore com as raspas de chocolate e framboesas. Guarde no frio até servir."
    ]
  },
  {
    id: "peras-folhadas", t: "Peras folhadas com chocolate", c: "sobremesas", e: "🍐",
    s: [2, "doses"], tm: "45 min", d: "Fácil", src: "Pingo Doce", f: "1UXH4WhldYNov4RzlBAPnH3PVwilCpHk4",
    n: "Ótima para aproveitar peras que ficaram esquecidas.",
    i: [
      "180 g de pera já passada", "600 ml de água", "50 g de mel", "50 g de açúcar", "1 pau de canela",
      "50 g de chocolate preto picado", "115 g de massa folhada refrigerada", "1 gema de ovo M"
    ],
    p: [
      "Pré-aqueça o forno a 200 °C. Corte as bases das peras e retire-lhes o caroço por baixo, deixando uma cavidade.",
      "Num tacho, junte a água, o mel, o açúcar e a canela. Quando ferver, junte as peras e coza cerca de 15 minutos, até estarem tenras mas não muito cozidas. Escorra e deixe arrefecer.",
      "Estenda a massa folhada e corte dois círculos um pouco maiores que a base das peras. Corte o resto em tiras de ± 1,5 cm.",
      "Recheie as peras com o chocolate, tape a abertura com um círculo de massa e coloque-as num tabuleiro com papel vegetal.",
      "Enrole as tiras de massa à volta das peras até ficarem cobertas, pincele com a gema batida e leve ao forno até a massa dourar."
    ]
  },
  {
    id: "creme-baunilha", t: "Creme de baunilha", o: "Crème vanille", c: "sobremesas", e: "🍨",
    s: [4, "pessoas"], tm: "15 min", d: "Fácil", src: "", f: "doc:144BGcBxQFPiq74_dNIaDdeUo0Vdpd34qKbIeyvifeNo",
    i: ["2 gemas", "½ l de leite", "60 g de açúcar", "20 g de maizena", "2 c. sopa de baunilha líquida", "20 cl de natas"],
    p: [
      "Bata as gemas, o açúcar e a baunilha. Junte o leite e as natas.",
      "Junte a maizena dissolvida num pouco de leite.",
      "Leve ao lume até ferver, mexendo com frequência."
    ]
  },
  {
    id: "creme-chocolate", t: "Creme de chocolate tipo Danette", o: "Crème au chocolat façon Danette", c: "sobremesas", e: "🍫",
    s: [4, "pessoas"], tm: "20 min", d: "Fácil", src: "750g", f: "doc:13g-x0Bo0KoadFVex8Oi9r55pIEECh8foNx-At1RCGQI",
    i: ["50 g de cacau amargo em pó", "60 g de açúcar", "20 g de maizena", "550 g de leite gordo", "Natas batidas ou chantilly (para decorar)"],
    p: [
      "Num tacho, junte o leite frio, o açúcar, a maizena e o cacau. Só então leve ao lume, sem nunca parar de mexer para não criar grumos.",
      "Deixe ferver bem durante 2 minutos: o creme engrossa. Desligue e mexa mais um pouco.",
      "Verta em taças ou ramequins e deixe arrefecer (engrossa ao arrefecer).",
      "Sirva com natas batidas ou chantilly."
    ]
  },
  {
    id: "creme-caramelo", t: "Creme de caramelo tipo Danette", o: "Crème dessert au caramel façon Danette", c: "sobremesas", e: "🍮",
    s: [4, "pessoas"], tm: "15 min + 2 h", d: "Fácil", src: "Blog", f: "doc:135TGnuqBPmUApPf7t-zO03ZfREzDVYdJiah3JIN_eFE",
    i: ["2 gemas", "15 cl de leite gordo", "15 cl de natas líquidas", "5 g de maizena", "80 g de caramelo líquido"],
    p: [
      "Dissolva a maizena no leite frio.",
      "Numa taça, bata as gemas.",
      "Junte o leite, as natas e o caramelo e misture tudo.",
      "Verta num tacho e deixe engrossar em lume médio.",
      "Verta em ramequins pequenos e leve ao frigorífico 2 horas."
    ]
  },
  {
    id: "semola-com-leite", t: "Sêmola com leite", o: "Semoule au lait", c: "sobremesas", e: "🥛",
    s: [6, "pessoas"], tm: "25 min", d: "Fácil", src: "Marmiton", f: "1bJo9oO8qVTl4fDjkqOu0fXnqCy3JK9bn",
    i: ["½ l de leite", "70 g de sêmola (fina ou média)", "2 ovos", "4 c. sopa de açúcar", "2 c. sopa de rum"],
    p: [
      "Ferva o leite com o açúcar. Junte o rum e depois a sêmola e deixe cozer 8 a 10 minutos.",
      "Dilua as gemas com um pouco de leite quente e, fora do lume, junte-as à sêmola.",
      "Bata as claras em castelo.",
      "Envolva a sêmola nas claras, mexendo delicadamente.",
      "Deixe arrefecer."
    ]
  },
  {
    id: "crepes-dukan", t: "Crepes Dukan", c: "sobremesas", e: "🥞",
    s: null, tm: "1h15", d: "Fácil", src: "Dukan", f: "doc:1CWjAgE7sNirJOBjp-RnMvZY5aPHLn_G39LjMcdcqnvY",
    i: ["2 ovos", "100 g de maizena", "½ c. chá de aroma de baunilha ou de rum", "¼ l de leite magro"],
    p: [
      "Triture todos os ingredientes e deixe repousar cerca de uma hora.",
      "Unte uma frigideira antiaderente com papel de cozinha e um pouco de óleo entre cada crepe.",
      "Coza como crepes normais."
    ]
  },
  {
    id: "gaufres-cyril-lignac", t: "Waffles de Cyril Lignac", o: "Gaufres de Cyril Lignac", c: "sobremesas", e: "🧇",
    s: [12, "waffles"], tm: "45 min + 1 h", d: "Muito fácil", src: "Ôdélices", f: "1UHsjMONJ6JiacpU4qmShH7B87p0A5sTE",
    n: "Tire o leite e os ovos do frigorífico antes, para estarem à temperatura ambiente. Se a waffle se partir ao abrir, ainda não está cozida.",
    i: ["250 g de farinha", "1 saqueta de fermento químico (10 g)", "40 g de açúcar", "2 ovos", "50 cl de leite", "100 g de manteiga derretida", "1 pitada de sal"],
    p: [
      "Misture a farinha, o fermento e o açúcar.",
      "Junte os ovos batidos e misture bem.",
      "Junte o leite aos poucos, mexendo com a vara para evitar grumos.",
      "Junte a manteiga derretida e uma pitada de sal e misture bem.",
      "Deixe repousar a massa 1 hora no frigorífico.",
      "Coza as waffles na máquina bem quente, 3 a 5 minutos cada. Se a máquina for antiga, unte-a levemente com óleo."
    ]
  },
  {
    id: "chouquettes", t: "Chouquettes", c: "sobremesas", e: "🍬",
    s: [45, "unidades"], tm: "35 min", d: "Muito fácil", src: "Marmiton", f: "0BzY_l8VK8soLUkZGQUJlRm1sZjQ",
    i: [
      "¼ l de água", "100 g de manteiga", "150 g de farinha", "1 c. sopa rasa de açúcar", "½ c. chá de sal",
      "½ c. chá de fermento", "1 saqueta de açúcar baunilhado", "3 ovos grandes", "Açúcar em pérolas q.b."
    ],
    p: [
      "Ponha a água e a manteiga num tacho e leve a ferver.",
      "Quando ferver, retire do lume e junte de uma vez a farinha com o sal e o fermento.",
      "Mexa com uma colher de pau até a massa descolar sozinha das paredes e formar uma bola.",
      "Deixe arrefecer ligeiramente.",
      "Junte o açúcar e o primeiro ovo e misture até ser absorvido. Repita com os outros 2 ovos (pode usar a batedeira).",
      "Com uma colher de chá, faça montinhos espaçados em tabuleiros untados ou com papel vegetal (2 tabuleiros).",
      "Ponha açúcar em pérolas em cada chou, enterrando-o ligeiramente.",
      "Coza em forno pré-aquecido a 210 °C durante 15 a 20 minutos (190 °C chegam em forno ventilado)."
    ]
  },
  {
    id: "sables-manteiga", t: "Sablés de manteiga", o: "Sablés au beurre", c: "sobremesas", e: "🍪",
    s: [12, "sablés"], tm: "30 min", d: "Muito fácil", src: "Marmiton", f: "0BzY_l8VK8soLVW10bWhORlJKUk0",
    i: ["50 g de farinha", "50 g de farinha de trigo-sarraceno", "60 g de manteiga", "30 g de açúcar", "1 pitada grande de sal"],
    p: [
      "Derreta a manteiga. Ponha os outros ingredientes numa taça e junte a manteiga.",
      "Misture vigorosamente com uma espátula de madeira (junte 1 colher de sopa de água se for preciso ligar).",
      "Estenda a massa com ½ cm de espessura e corte discos de 5 cm (por exemplo, com um copo de ovo virado ao contrário).",
      "Coza 10 a 15 minutos a 200 °C sobre papel vegetal, até ficarem louros.",
      "Deixe arrefecer antes de servir."
    ]
  },
  {
    id: "paris-brest", t: "Paris-Brest pralinado", c: "sobremesas", e: "🍩",
    s: [8, "pessoas"], tm: "1h25", d: "Média", src: "Marmiton", f: "1Ua489ZBWuSyKTepnPW_8h57FVQfCTRTr",
    n: "O ficheiro original só tem os ingredientes; os passos abaixo seguem o método clássico da massa choux e do creme pralinado.",
    i: [
      "# Massa choux (cerca de ¼ l)", "25 cl de água", "50 g de manteiga", "1 pitada de sal", "1 pitada de açúcar", "65 g de farinha",
      "2 ovos", "1 ovo (para pincelar)", "80 g de amêndoa laminada", "Açúcar em pó q.b.",
      "# Creme pasteleiro pralinado", "50 cl de leite", "3 ovos", "125 g de açúcar", "60 g de farinha", "120 g de manteiga", "70 g de pralin"
    ],
    p: [
      "# Massa choux",
      "Pré-aqueça o forno a 180 °C. Ferva a água com a manteiga, o sal e o açúcar.",
      "Fora do lume, junte a farinha de uma vez e mexa; volte ao lume a secar a massa até formar uma bola.",
      "Deixe amornar e junte os ovos um a um, batendo bem.",
      "Com um saco de pasteleiro, forme uma coroa num tabuleiro com papel vegetal. Pincele com ovo e cubra com a amêndoa laminada.",
      "Coza cerca de 30 minutos sem abrir o forno. Deixe arrefecer e corte ao meio na horizontal.",
      "# Creme",
      "Ferva o leite. Bata os ovos com o açúcar, junte a farinha e verta o leite quente por cima.",
      "Volte ao lume, mexendo até engrossar. Deixe arrefecer com película em contacto.",
      "Bata a manteiga amolecida com o pralin e junte ao creme frio, batendo até ficar leve.",
      "# Montagem",
      "Recheie a coroa com o creme usando um saco de pasteleiro, tape e polvilhe com açúcar em pó."
    ]
  },
  {
    id: "caramelo-manteiga-salgada", t: "Caramelo de manteiga salgada", o: "Crème caramel au beurre salé", c: "sobremesas", e: "🍯",
    s: [4, "pessoas"], tm: "15 min", d: "Fácil", src: "Isabelle Bonneau", f: "doc:1IJuhLSJgQzx_-3fpRnwAio-Rlbl5qg6hMsrWc0qRxlo",
    n: "O sabor da Bretanha! Para crepes e muitas outras gulodices.",
    i: ["160 g de açúcar", "80 g de manteiga com sal", "20 cl de natas líquidas"],
    p: [
      "Num tacho, aqueça o açúcar em lume médio para obter um caramelo a seco (3 a 4 minutos, até ficar âmbar). Entretanto, aqueça as natas noutro tacho.",
      "Quando o caramelo estiver pronto, retire do lume e junte com cuidado um pouco das natas (atenção aos salpicos). Mexa bem e junte o resto aos poucos.",
      "Quando deixar de borbulhar, junte a manteiga e mexa até ficar um creme meio líquido. Se quiser mais espesso, volte a lume brando a mexer.",
      "Verta num frasco de vidro, tape e guarde no frigorífico."
    ]
  },
  {
    id: "caramelo-manteiga-salgada-rapido", t: "Caramelo salgado rápido", o: "Caramel beurre salé", c: "sobremesas", e: "🍯",
    s: [4, "pessoas"], tm: "15 min", d: "Muito fácil", src: "Marmiton", f: "0BzY_l8VK8soLbnNhSVJVcU1KdEk",
    i: ["15 cubos de açúcar", "10 cl de água", "30 g de manteiga com sal", "4 c. sopa de natas (crème fraîche)"],
    p: [
      "Leve o açúcar e a água a lume forte.",
      "Espere que caramelize (louro escuro) e retire do lume.",
      "Junte a manteiga com sal e misture bem.",
      "Volte a lume brando e junte as natas.",
      "Misture até o creme ficar liso. Leve ao congelador cerca de 30 minutos e depois ao frigorífico."
    ]
  },
  {
    id: "caramelo-liquido", t: "Caramelo líquido (não endurece)", o: "Caramel liquide", c: "sobremesas", e: "🍯",
    s: [4, "pessoas"], tm: "25 min", d: "Muito fácil", src: "Marmiton", f: "0BzY_l8VK8soLLTZnWWd3X1BGOVU",
    i: ["1 c. sopa de vinagre", "500 g de açúcar", "12,5 cl de água", "25 cl de água fria"],
    p: [
      "Coloque o vinagre, o açúcar e 12,5 cl de água num tacho.",
      "Aqueça em lume forte cerca de 15 minutos.",
      "Quando o caramelo alourar, baixe um pouco o lume e junte muito, muito devagar os 25 cl de água fria (atenção aos salpicos).",
      "Volte a aquecer 1 minuto em lume forte e guarde num frasco."
    ]
  },
  {
    id: "creme-pasteleiro-caramelo", t: "Creme pasteleiro de caramelo salgado", o: "Crème pâtissière au caramel au beurre salé", c: "sobremesas", e: "🍮",
    s: null, tm: "20 min", d: "Fácil", src: "Gourmandes, ils disent", f: "0BzY_l8VK8soLaFZsSUhERjVkUTQ",
    i: ["¼ l de leite", "3 gemas", "70 g de açúcar", "20 g de maizena", "1 pitada de flor de sal", "20 g de manteiga"],
    p: [
      "Com metade do açúcar (35 g), faça um caramelo a seco. À parte, aqueça o leite.",
      "Quando o caramelo estiver pronto, junte-lhe o leite quente. Se o caramelo fizer pedaços, não faz mal — continue a mexer até derreterem.",
      "Numa taça, bata as gemas com a outra metade do açúcar (35 g) até esbranquiçar. Junte a maizena e misture bem.",
      "Quando o caramelo estiver de novo líquido, verta o leite de caramelo sobre as gemas e misture bem.",
      "Volte a levar tudo ao lume até ferver, mexendo vivamente para não criar grumos.",
      "Fora do lume, junte a manteiga e a flor de sal, bata um pouco e cubra com película em contacto. Deixe arrefecer."
    ]
  },
  {
    id: "barras-cereais-tamaras", t: "Barras de cereais caseiras", o: "Barre de céréales maison", c: "sobremesas", e: "🌾",
    s: [11, "barras"], tm: "45 min", d: "Fácil", src: "Blog", f: "0BzY_l8VK8soLNzNkVHJRNGVRQVE",
    n: "Dá 10 a 12 barras. Pode trocar as tâmaras por alperces ou figos secos e usar os frutos secos que quiser.",
    i: [
      "½ chávena de tâmaras picadas grosseiramente", "¼ chávena de mel (ou xarope de ácer)", "¼ chávena de manteiga de amendoim",
      "1 chávena de amêndoas torradas", "1 ½ chávena de flocos de aveia", "½ chávena de pistácios", "½ chávena de arandos secos"
    ],
    p: [
      "No robot, triture as tâmaras em pedacinhos.",
      "No forno a 175 °C, torre a aveia e as amêndoas 10 a 15 minutos.",
      "Coloque a aveia, as amêndoas, os pistácios, os arandos e a pasta de tâmara numa taça grande.",
      "Num tacho pequeno, em lume brando, aqueça o mel com a manteiga de amendoim.",
      "Verta sobre a mistura de aveia e misture uniformemente.",
      "Passe para uma travessa forrada com papel vegetal, achate bem e cubra com película.",
      "Deixe endurecer no congelador 20 a 30 minutos.",
      "Corte as barras e guarde numa caixa hermética (5 a 6 dias no máximo)."
    ]
  },

  // ───────────────────────── BEBIDAS ─────────────────────────
  {
    id: "ginjinha-de-obidos", t: "Ginjinha de Óbidos", c: "bebidas", e: "🍒",
    s: [20, "porções"], tm: "6 meses", d: "Fácil", src: "Receita tradicional", f: "1TnfF2UOBhzp7KpFlvz0vISn-T-07QBB_",
    n: "Sirva nos tradicionais copinhos de chocolate.",
    i: ["1 kg de ginjas frescas", "1 l de aguardente de boa qualidade", "1 kg de açúcar (branco, mascavado ou amarelo)", "4 paus de canela"],
    p: [
      "Lave bem as ginjas, seque-as sobre papel absorvente ou um pano e retire os pés.",
      "Coloque as ginjas num frasco grande de boca larga — não devem ultrapassar 1/3 da capacidade.",
      "Numa panela, deite a aguardente, a canela e o açúcar e leve ao lume no mínimo, mexendo sempre, sem passar dos 35 °C, só para dissolver o açúcar.",
      "Deite o preparado no frasco sobre as ginjas, feche bem e agite.",
      "Guarde em local escuro e fresco e agite o frasco pelo menos uma vez por dia até o açúcar dissolver completamente (cerca de uma semana).",
      "Deixe repousar em local escuro e fresco cerca de 6 meses.",
      "Coe o licor e engarrafe."
    ]
  },
  {
    id: "batida-de-coco", t: "Batida de coco", c: "bebidas", e: "🥥",
    s: [1, "copo grande"], tm: "5 min", d: "Muito fácil", src: "Kitchen Trotter", f: "doc:11ekzUdLckd5f_GcJ_qTHICsT7HatgElB9mT1YQZe0fQ",
    n: "Variante: troque a cachaça por vodka. É forte em álcool!",
    i: ["20 cl de leite condensado", "10 cl de cachaça", "10 cl de leite de coco", "Gelo q.b.", "Coco ralado q.b. (opcional)"],
    p: [
      "Triture tudo.",
      "Verta num copo com gelo e polvilhe com coco ralado, se quiser."
    ]
  },
  {
    id: "gemada-quente", t: "Gemada quente", o: "Lait de poule", c: "bebidas", e: "🥚",
    s: [1, "pessoa"], tm: "7 min", d: "Fácil", src: "Journal des Femmes", f: "1QpvSnGPj4DlkwtR6vkrhV8bzN9Rqinol",
    i: [
      "25 g de açúcar (ou xarope de cana)", "1 gema de ovo", "10 cl de leite", "1 pitada de canela", "1 pitada de noz-moscada",
      "1 cl de rum branco ou outro álcool (só para adultos)"
    ],
    p: [
      "Num tacho, aqueça o leite com a canela e a noz-moscada. Não deixe ferver.",
      "Bata a gema com o açúcar durante 4 a 5 minutos.",
      "Junte o leite quente, batendo sem parar com a vara, até ficar homogéneo. Junte o álcool, se quiser."
    ]
  }
];

window.CATEGORIES = [
  { id: "pratos", name: "Pratos", emoji: "🍽️" },
  { id: "entradas", name: "Entradas e sopas", emoji: "🥣" },
  { id: "petiscos", name: "Salgados", emoji: "🥟" },
  { id: "molhos", name: "Molhos", emoji: "🫙" },
  { id: "pao", name: "Pão e massas", emoji: "🍞" },
  { id: "bolos", name: "Bolos", emoji: "🍰" },
  { id: "sobremesas", name: "Sobremesas", emoji: "🍮" },
  { id: "bebidas", name: "Bebidas", emoji: "🍹" }
];
