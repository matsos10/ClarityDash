# ClarityDash

Gestão da rede de casa e dos aparelhos ligados a ela. Corre num computador da própria rede
(PC, Raspberry Pi, NAS…) e abre-se no browser — também no telemóvel.

Só usa Python 3.9+ (biblioteca padrão): não há nada para instalar.

## Arrancar

```bash
python3 -m claritydash
```

Abre `http://<ip-do-computador>:8080`. Para exigir palavra-passe:

```bash
CLARITYDASH_PASSWORD='a-tua-palavra-passe' python3 -m claritydash
```

Opções: `--port 8080`, `--host 0.0.0.0`, `--data ./data` (pasta da base de dados), `-v` (registo detalhado).
Também por variáveis de ambiente: `CLARITYDASH_PORT`, `CLARITYDASH_HOST`, `CLARITYDASH_DATA`.

## O que faz

- **Descoberta automática** — varre a rede a cada 2 min (ping + tabela ARP) e regista cada aparelho
  por MAC: IP, hostname, fabricante e tipo provável (telemóvel, TV, impressora, câmara, casa inteligente…).
- **Inventário** — dá nome, tipo, dono, local e notas a cada aparelho; filtra, pesquisa e exporta para CSV.
- **Segurança** — aparelhos novos ficam "por confirmar" e geram alerta; MACs privados/aleatórios são assinalados.
- **Presença** — histórico de quando cada aparelho entra, sai ou muda de IP; alerta opcional quando um
  aparelho importante (câmara, servidor…) fica offline.
- **Qualidade da ligação** — latência ao router e à internet medida a cada minuto, com gráfico de 24 h.
- **Ferramentas** — ping, DNS, análise de portas abertas (com atalhos para as interfaces web dos aparelhos),
  Wake-on-LAN e IP público.
- **Notificações** — webhook para ntfy, Discord, Slack, Home Assistant ou outro serviço.

Na primeira execução, os aparelhos encontrados são marcados como confiáveis; a partir daí, qualquer aparelho
novo fica por confirmar.

## Notas

- Corre no Linux, macOS e Windows. No Linux deteta melhor os aparelhos que não respondem a ping (via `ip neigh`).
- A lista de fabricantes (IEEE OUI, ~5 MB) é descarregada automaticamente para `data/oui.txt` no primeiro arranque.
- Para ver aparelhos de várias sub-redes ou VLANs, define a sub-rede em **Configurações** (máximo /22).
- Bloquear aparelhos ou limitar velocidade depende do router e não é feito pela app.
