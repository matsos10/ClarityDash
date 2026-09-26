# n8n · LinkedIn → 10 leads/semana

7 workflows que executam o plano (outbound + sinais mornos + conteúdo + métricas).

| # | Workflow | Quando | O que faz |
|---|---|---|---|
| 01 | Convites diários | Seg–sex 10h | Pega nos 20 prospects `novo` com maior prioridade, visita o perfil e envia convite sem nota (pausa aleatória de 45–120 s entre cada um). Se já for ligação de 1.º grau, passa-o logo para `ligado`. |
| 02 | Respostas recebidas | Webhook | Cada mensagem recebida de um prospect: o Claude classifica (interessado / neutro / sem interesse), para a sequência, atualiza a Sheet e envia-te email com resumo e resposta sugerida. `interessado` → estado `lead`. |
| 03 | Sequência de mensagens | Seg–sex 11h | Deteta convites aceites e envia a sequência: abertura D+1, valor +3 dias, direto +5, encerramento +7. Mensagens personalizadas pelo Claude (cargo, empresa, publicações recentes). Relê a linha antes de cada envio para nunca escrever a quem já respondeu. |
| 04 | Sinais mornos | Seg–sex 9h | Lê quem comentou as tuas publicações dos últimos 14 dias, o Claude avalia o encaixe no ICP (0–10) e quem tiver ≥7 entra na lista com prioridade 10 e o comentário como contexto. |
| 05 | Gerar conteúdo | Domingo 18h | Escreve 3 publicações (terça educativo, quarta prova, quinta opinião; na 1.ª semana do mês a de quinta leva o lead magnet) e guarda-as como `rascunho`. |
| 06 | Publicar conteúdo | Ter–qui 8h30 | Publica a publicação `aprovado` com a data de hoje. |
| 07 | Relatório semanal | Sexta 17h | Email com KPIs vs. metas e diagnóstico; retira convites pendentes há mais de 21 dias. |

## 1. Contas necessárias

- **n8n** (cloud ou self-hosted).
- **[Unipile](https://www.unipile.com)**: API que liga à tua conta LinkedIn (o LinkedIn não tem API oficial para convites/mensagens). Liga a conta no painel e anota o **DSN** (ex.: `api8.unipile.com:13851`), a **API key** e o **account_id** da conta LinkedIn.
- **Anthropic API key** (console.anthropic.com).
- **Google Sheets** e **Gmail** ligados ao n8n.

## 2. Google Sheet

Cria uma Sheet com dois separadores. A linha 1 tem de ter exatamente estes cabeçalhos.

**`Prospects`**
```
nome	empresa	cargo	linkedin_url	public_identifier	provider_id	fonte	prioridade	contexto	estado	invitation_id	chat_id	data_convite	data_ligacao	passo	data_ultima_msg	ultima_msg	data_resposta	classificacao	resposta	resumo_ia	resposta_sugerida	notas
```
Para adicionar prospects (ex.: exportados do Sales Navigator), preenche `nome`, `empresa`, `cargo`, `linkedin_url` (`https://www.linkedin.com/in/...`), `fonte` e `estado = novo`. `prioridade` é opcional: quanto maior, mais cedo é convidado.

**`Conteudo`**
```
id	data_publicacao	dia	tipo	texto	estado	post_id	data_publicado
```

Estados de um prospect: `novo → convite_enviado → ligado → em_sequencia → respondeu / lead / sem_interesse / sequencia_terminada` (e também `convite_retirado`, `erro`).

## 3. Credenciais no n8n

Todas do tipo **Header Auth**, exceto as da Google:

| Nome sugerido | Header | Valor | Usada em |
|---|---|---|---|
| Unipile API | `X-API-KEY` | a tua API key Unipile | Todos os nós HTTP que chamam `…/api/v1/…` |
| Anthropic API | `x-api-key` | a tua API key Anthropic | Nós `Claude · …` |
| Unipile Webhook Secret | `X-Webhook-Secret` | uma palavra-passe longa à tua escolha | Nó `Webhook Unipile` (02) |

Mais **Google Sheets OAuth2** e **Gmail OAuth2**.

## 4. Importar e configurar

1. No n8n: **Workflows → Import from File**, para cada `.json`.
2. Em cada workflow, abre o nó **Config** e preenche:
   - `unipile_base_url` = `https://<DSN>/api/v1`
   - `unipile_account_id`
   - `sheet_id`: o ID que aparece no URL da Sheet
   - e, conforme o workflow, `oferta`, `icp`, `dor`, `prova`, `recurso_gratuito`, `link_agenda`, `temas`, `lead_magnet`, `email_alertas`.
3. Abre cada nó assinalado a vermelho e escolhe a credencial correta.
4. **Webhook de mensagens (02):** ativa o workflow 02, copia o *Production URL* do nó `Webhook Unipile` e regista-o na Unipile:
   ```bash
   curl -X POST "https://<DSN>/api/v1/webhooks" \
     -H "X-API-KEY: <UNIPILE_API_KEY>" -H "Content-Type: application/json" \
     -d '{
       "request_url": "<PRODUCTION_URL_DO_N8N>",
       "name": "n8n linkedin respostas",
       "source": "messaging",
       "format": "json",
       "events": ["message_received"],
       "account_ids": ["<ACCOUNT_ID>"],
       "headers": [{ "key": "X-Webhook-Secret", "value": "<O_MESMO_SEGREDO_DA_CREDENCIAL>" }]
     }'
   ```
5. Testa cada workflow com **Execute workflow** usando 2–3 prospects de teste. Depois ativa-os por esta ordem: 02 → 03 → 01 → 04 → 07 → 05 → 06.

## 5. Rotina que continua a ser tua (~20 min/dia)

- Responder às pessoas que chegam por email (02). A resposta sugerida é só um ponto de partida.
- Rever e aprovar os rascunhos de domingo (05).
- 10 comentários com substância em publicações do ICP. Não foram automatizados de propósito: comentários automáticos são fáceis de detetar e prejudicam a marca.
- Manter 400+ prospects `novo` na Sheet (o relatório de sexta avisa quando baixa de 100).

## 6. Limites e risco

Automatizar o LinkedIn viola os termos de utilização e pode levar à restrição da conta. Os valores por omissão são conservadores: 20 convites/dia, 40 mensagens/dia, pausas aleatórias, apenas dias úteis, retirada de convites pendentes. Nas primeiras 2 semanas, reduz `limite_convites_dia` para 10 e sobe gradualmente. Não corras outras ferramentas de automação na mesma conta.
