# Workflows n8n · LinkedIn 10 leads/semana

Para importar: copia um bloco JSON inteiro e cola-o (Ctrl+V / Cmd+V) num workflow vazio do n8n. Repete para os 7.

## LinkedIn Leads · 01 · Convites diários

```json
{
  "name": "LinkedIn Leads · 01 · Convites diários",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 10 * * 1-5"
            }
          ]
        }
      },
      "id": "f1a39f85-a8f1-4b45-8e4e-b2ae84ee2494",
      "name": "Dias úteis às 10h",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        0,
        300
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "cfad5cad-cebe-4fa4-a284-f8fd498cef62",
              "name": "unipile_base_url",
              "value": "https://apiX.unipile.com:XXXXX/api/v1",
              "type": "string"
            },
            {
              "id": "1bd0221c-0089-423b-be6b-b901c2c741f6",
              "name": "unipile_account_id",
              "value": "ID_DA_CONTA_LINKEDIN_NA_UNIPILE",
              "type": "string"
            },
            {
              "id": "99d80633-ed0a-4707-8f8f-8b665c3cfb4d",
              "name": "sheet_id",
              "value": "ID_DA_GOOGLE_SHEET",
              "type": "string"
            },
            {
              "id": "69797cb0-d0c3-4d75-9ff3-1a864194e35d",
              "name": "limite_convites_dia",
              "value": "20",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "bc47cd46-eff7-41e4-bc29-4130115b7538",
      "name": "Config",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        220,
        300
      ]
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "options": {},
        "filtersUI": {
          "values": [
            {
              "lookupColumn": "estado",
              "lookupValue": "novo"
            }
          ]
        }
      },
      "id": "f10432be-1125-4efa-bc3d-04b3394d3e20",
      "name": "Ler prospects novos",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        440,
        300
      ]
    },
    {
      "parameters": {
        "jsCode": "const TZ = 'Europe/Lisbon';\nconst hoje = DateTime.now().setZone(TZ).startOf('day');\nconst hojeStr = hoje.toFormat('yyyy-MM-dd');\nfunction parseData(v) {\n  if (!v) return null;\n  const s = String(v).trim();\n  let d = DateTime.fromISO(s, { zone: TZ });\n  if (!d.isValid) d = DateTime.fromFormat(s, 'dd/MM/yyyy', { zone: TZ });\n  return d.isValid ? d.startOf('day') : null;\n}\nfunction diasDesde(v) {\n  const d = parseData(v);\n  return d ? Math.floor(hoje.diff(d, 'days').days) : Infinity;\n}\n\nconst limite = Number($('Config').first().json.limite_convites_dia) || 20;\nconst linhas = $input.all()\n  .map(i => i.json)\n  .filter(p => p.linkedin_url || p.provider_id)\n  .sort((a, b) => (Number(b.prioridade) || 0) - (Number(a.prioridade) || 0))\n  .slice(0, limite);\n\nreturn linhas.map(p => {\n  const slug = String(p.linkedin_url || '').split('/in/')[1]?.split(/[/?#]/)[0] || '';\n  return { json: { ...p, identificador: p.provider_id || decodeURIComponent(slug) } };\n});\n"
      },
      "id": "ea0efd6c-ea71-4c5a-81ea-013cf1a7cf03",
      "name": "Selecionar os do dia",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        660,
        300
      ]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "id": "51339ab8-4d74-43a7-ac3f-e4b1cac146d8",
      "name": "Um de cada vez",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [
        880,
        300
      ]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={{ $('Config').first().json.unipile_base_url }}/users/{{ $json.identificador }}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            }
          ]
        },
        "options": {}
      },
      "id": "faacc706-ff54-452b-b967-c3da984aa6ca",
      "name": "Visitar perfil",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1100,
        200
      ],
      "onError": "continueErrorOutput"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "loose",
            "version": 2
          },
          "conditions": [
            {
              "id": "a8b6cd00-8a2f-49ca-b9da-60d0dfa5dbe7",
              "leftValue": "={{ $json.network_distance === 'FIRST_DEGREE' }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "looseTypeValidation": true,
        "options": {}
      },
      "id": "b728a261-39d8-4bb9-b22f-e28cb154e63e",
      "name": "Já é ligação de 1.º grau?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1320,
        100
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{ $('Config').first().json.unipile_base_url }}/users/invite",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ provider_id: $json.provider_id, account_id: $('Config').first().json.unipile_account_id }) }}",
        "options": {}
      },
      "id": "492f5540-e129-4919-83af-b4352fc018bb",
      "name": "Enviar convite (sem nota)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1540,
        200
      ],
      "onError": "continueErrorOutput"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "f3287153-757a-4028-b3a8-f7a75ca5b43c",
              "name": "linkedin_url",
              "value": "={{ $('Um de cada vez').item.json.linkedin_url }}",
              "type": "string"
            },
            {
              "id": "477c215f-2a4b-406c-90d0-9014e2a8dddf",
              "name": "provider_id",
              "value": "={{ $json.provider_id }}",
              "type": "string"
            },
            {
              "id": "cd0eddba-19ca-42fa-98fe-d6bf604d55d4",
              "name": "public_identifier",
              "value": "={{ $json.public_identifier }}",
              "type": "string"
            },
            {
              "id": "755aadf3-dd96-4473-8abd-b24dce7aaf91",
              "name": "estado",
              "value": "ligado",
              "type": "string"
            },
            {
              "id": "0f99d3bf-1aef-4c83-84a9-2739c64a4b63",
              "name": "data_ligacao",
              "value": "={{ $now.setZone('Europe/Lisbon').toFormat('yyyy-MM-dd') }}",
              "type": "string"
            },
            {
              "id": "65be1a53-d241-4edf-91cb-dd4dfee0e044",
              "name": "passo",
              "value": "0",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "id": "d0f2b1f8-cce7-423e-bb50-ae6f2510c62b",
      "name": "Marcar como ligado",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1760,
        0
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "34f8b324-bd4f-4c25-8ab6-020b327e2d2e",
              "name": "linkedin_url",
              "value": "={{ $('Um de cada vez').item.json.linkedin_url }}",
              "type": "string"
            },
            {
              "id": "4d9fc214-56bd-44f2-ab70-fa91fbc490f0",
              "name": "provider_id",
              "value": "={{ $('Visitar perfil').item.json.provider_id }}",
              "type": "string"
            },
            {
              "id": "01b33b31-5622-447a-9c8c-2a5672c8872e",
              "name": "public_identifier",
              "value": "={{ $('Visitar perfil').item.json.public_identifier }}",
              "type": "string"
            },
            {
              "id": "e82ec975-8c26-4342-a25f-20823eb96576",
              "name": "estado",
              "value": "convite_enviado",
              "type": "string"
            },
            {
              "id": "a4002ec5-70f5-4889-b4e7-0b7a1840d4bd",
              "name": "invitation_id",
              "value": "={{ $json.invitation_id }}",
              "type": "string"
            },
            {
              "id": "c07583f4-050b-4f09-8120-aa6c18fb1dc2",
              "name": "data_convite",
              "value": "={{ $now.setZone('Europe/Lisbon').toFormat('yyyy-MM-dd') }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "488269ca-ac02-4eaa-87ff-4c50da57d752",
      "name": "Marcar convite enviado",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1760,
        200
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "2fb8f21c-1fdb-4502-ba23-d8267282a096",
              "name": "linkedin_url",
              "value": "={{ $('Um de cada vez').item.json.linkedin_url }}",
              "type": "string"
            },
            {
              "id": "297bac02-fae6-44b6-ba76-a5a9f02298c3",
              "name": "estado",
              "value": "erro",
              "type": "string"
            },
            {
              "id": "7e42e9a6-cc6d-4d9b-83e2-bd29766dcbc1",
              "name": "notas",
              "value": "={{ 'Erro Unipile: ' + ($json.error?.message || JSON.stringify($json.error || $json)).slice(0, 300) }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "b13883bb-aa62-42e9-8cd5-499c14e8b436",
      "name": "Marcar erro",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1760,
        400
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [
            "linkedin_url"
          ],
          "schema": []
        },
        "options": {
          "cellFormat": "RAW",
          "handlingExtraData": "ignoreIt"
        }
      },
      "id": "c9cf488e-f62f-4d04-8632-733903aca249",
      "name": "Atualizar prospect",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        1980,
        200
      ]
    },
    {
      "parameters": {
        "amount": "={{ Math.floor(Math.random() * 75) + 45 }}",
        "unit": "seconds"
      },
      "id": "1ac2dc63-9bb2-4262-a000-789bfee2f177",
      "name": "Pausa humana 45–120 s",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        2200,
        200
      ],
      "webhookId": "478f0a63-fc19-47b2-9a4e-7f02aae664c2"
    }
  ],
  "connections": {
    "Dias úteis às 10h": {
      "main": [
        [
          {
            "node": "Config",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Config": {
      "main": [
        [
          {
            "node": "Ler prospects novos",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ler prospects novos": {
      "main": [
        [
          {
            "node": "Selecionar os do dia",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Selecionar os do dia": {
      "main": [
        [
          {
            "node": "Um de cada vez",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Um de cada vez": {
      "main": [
        [],
        [
          {
            "node": "Visitar perfil",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Visitar perfil": {
      "main": [
        [
          {
            "node": "Já é ligação de 1.º grau?",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Marcar erro",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Já é ligação de 1.º grau?": {
      "main": [
        [
          {
            "node": "Marcar como ligado",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Enviar convite (sem nota)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enviar convite (sem nota)": {
      "main": [
        [
          {
            "node": "Marcar convite enviado",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Marcar erro",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Marcar como ligado": {
      "main": [
        [
          {
            "node": "Atualizar prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Marcar convite enviado": {
      "main": [
        [
          {
            "node": "Atualizar prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Marcar erro": {
      "main": [
        [
          {
            "node": "Atualizar prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Atualizar prospect": {
      "main": [
        [
          {
            "node": "Pausa humana 45–120 s",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Pausa humana 45–120 s": {
      "main": [
        [
          {
            "node": "Um de cada vez",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "timezone": "Europe/Lisbon",
    "saveManualExecutions": true
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": false
  }
}
```

## LinkedIn Leads · 02 · Respostas recebidas

```json
{
  "name": "LinkedIn Leads · 02 · Respostas recebidas",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "unipile-linkedin-mensagens",
        "authentication": "headerAuth",
        "options": {}
      },
      "id": "fd37f51f-3923-472a-98b4-88524fb76fb4",
      "name": "Webhook Unipile",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [
        0,
        300
      ],
      "webhookId": "f8156a20-c0b5-4ef7-ae72-679b41f04e3e"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "131a7f11-5fd0-484a-a0c0-9502b6ae95c4",
              "name": "unipile_base_url",
              "value": "https://apiX.unipile.com:XXXXX/api/v1",
              "type": "string"
            },
            {
              "id": "ece82cae-804e-4060-99dd-52154c0f3aed",
              "name": "unipile_account_id",
              "value": "ID_DA_CONTA_LINKEDIN_NA_UNIPILE",
              "type": "string"
            },
            {
              "id": "4ba3b19e-cdd8-4167-b7c3-a094241356c7",
              "name": "sheet_id",
              "value": "ID_DA_GOOGLE_SHEET",
              "type": "string"
            },
            {
              "id": "3bee0747-61a6-40f8-a04d-068fcffe9c6d",
              "name": "nome_remetente",
              "value": "O teu primeiro nome",
              "type": "string"
            },
            {
              "id": "f1749e82-e425-4d37-bed4-5f51c0fcdf81",
              "name": "oferta",
              "value": "O que fazes, numa frase (ex.: ajudo CFOs de PMEs a fechar o mês em 2 dias em vez de 10)",
              "type": "string"
            },
            {
              "id": "d82a86e7-afdc-4303-89ae-166b9eadcf3c",
              "name": "email_alertas",
              "value": "o-teu-email@exemplo.com",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "759aaab7-5d27-4390-aee3-232fb8c47938",
      "name": "Config",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        220,
        300
      ]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "loose",
            "version": 2
          },
          "conditions": [
            {
              "id": "d0fe0229-e324-4ccd-af69-1097d96db369",
              "leftValue": "={{ $('Webhook Unipile').item.json.body.event === 'message_received' && $('Webhook Unipile').item.json.body.account_id === $('Config').first().json.unipile_account_id && $('Webhook Unipile').item.json.body.sender?.attendee_provider_id !== $('Webhook Unipile').item.json.body.account_info?.user_id }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "looseTypeValidation": true,
        "options": {}
      },
      "id": "7ffa1dbd-3085-40f3-8533-e925de2751f8",
      "name": "Mensagem recebida de outra pessoa?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        440,
        300
      ]
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "options": {},
        "filtersUI": {
          "values": [
            {
              "lookupColumn": "provider_id",
              "lookupValue": "={{ $('Webhook Unipile').item.json.body.sender.attendee_provider_id }}"
            }
          ]
        }
      },
      "id": "353e1e39-ca46-417a-8c95-aaf383949e81",
      "name": "Procurar prospect",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        660,
        300
      ]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "loose",
            "version": 2
          },
          "conditions": [
            {
              "id": "83c12e56-668b-4fdd-aecc-dc76b3b20e13",
              "leftValue": "={{ $json.estado !== 'lead' }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "looseTypeValidation": true,
        "options": {}
      },
      "id": "bf57a5a3-4657-4b3d-a4f9-8c53a132d40c",
      "name": "Ainda não é lead?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        880,
        300
      ]
    },
    {
      "parameters": {
        "jsCode": "const cfg = $('Config').first().json;\nconst body = $('Webhook Unipile').first().json.body;\nconst p = $input.first().json;\n\nconst system = `Classificas respostas de prospects no LinkedIn para ${cfg.nome_remetente}, que ${cfg.oferta}.\nCategorias:\n- interessado: quer saber mais, aceita chamada, pede proposta/preço/recurso, ou descreve a dor como prioridade.\n- neutro: responde mas sem sinal claro (agradece, pergunta genérica, \"agora não mas talvez\", fora do escritório).\n- sem_interesse: recusa, não é a pessoa certa, pede para não contactar.\nEscreve também um resumo de uma frase e uma resposta sugerida (português de Portugal, tratar por tu, máx. 300 caracteres, humana, sem pitch agressivo; se interessado, propõe 20 min e 2 opções de dia).`;\n\nconst dados = {\n  prospect: { nome: p.nome, cargo: p.cargo, empresa: p.empresa },\n  minha_ultima_mensagem: p.ultima_msg || '',\n  resposta_recebida: body.message || '',\n};\n\nreturn [{ json: {\n  provider_id: p.provider_id,\n  mensagem: body.message || '',\n  chat_id: body.chat_id || p.chat_id || '',\n  claude_request: {\n    model: 'claude-opus-5',\n    max_tokens: 8000,\n    fallbacks: 'default',\n    output_config: {\n      effort: 'low',\n      format: {\n        type: 'json_schema',\n        schema: {\n          type: 'object',\n          properties: {\n            classificacao: { type: 'string', enum: ['interessado', 'neutro', 'sem_interesse'] },\n            resumo: { type: 'string' },\n            resposta_sugerida: { type: 'string' },\n          },\n          required: ['classificacao', 'resumo', 'resposta_sugerida'],\n          additionalProperties: false,\n        },\n      },\n    },\n    system,\n    messages: [{ role: 'user', content: JSON.stringify(dados, null, 2) }],\n  },\n} }];\n"
      },
      "id": "c4534d21-8977-4403-9a64-f754e39e82d9",
      "name": "Preparar classificação",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1100,
        300
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.anthropic.com/v1/messages",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "anthropic-version",
              "value": "2023-06-01"
            },
            {
              "name": "anthropic-beta",
              "value": "server-side-fallback-2026-07-01"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json.claude_request) }}",
        "options": {
          "timeout": 180000
        }
      },
      "id": "67590ad0-2a06-4396-bca0-556c9d0f961d",
      "name": "Claude · classificar resposta",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1320,
        300
      ],
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 5000,
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "const TZ = 'Europe/Lisbon';\nconst hoje = DateTime.now().setZone(TZ).startOf('day');\nconst hojeStr = hoje.toFormat('yyyy-MM-dd');\nfunction parseData(v) {\n  if (!v) return null;\n  const s = String(v).trim();\n  let d = DateTime.fromISO(s, { zone: TZ });\n  if (!d.isValid) d = DateTime.fromFormat(s, 'dd/MM/yyyy', { zone: TZ });\n  return d.isValid ? d.startOf('day') : null;\n}\nfunction diasDesde(v) {\n  const d = parseData(v);\n  return d ? Math.floor(hoje.diff(d, 'days').days) : Infinity;\n}\n\nconst prep = $('Preparar classificação').first().json;\nconst r = $input.first().json;\nlet out = { classificacao: 'neutro', resumo: 'Classificação automática falhou: rever manualmente.', resposta_sugerida: '' };\ntry {\n  if (r.stop_reason !== 'refusal') {\n    const bloco = (r.content || []).find(c => c.type === 'text');\n    if (bloco) out = JSON.parse(bloco.text);\n  }\n} catch (e) {}\n\nconst estado = { interessado: 'lead', sem_interesse: 'sem_interesse' }[out.classificacao] || 'respondeu';\nreturn [{ json: {\n  provider_id: prep.provider_id,\n  estado,\n  classificacao: out.classificacao,\n  resumo_ia: out.resumo,\n  resposta_sugerida: out.resposta_sugerida,\n  resposta: String(prep.mensagem).slice(0, 1000),\n  data_resposta: hojeStr,\n  chat_id: prep.chat_id,\n} }];\n"
      },
      "id": "be7832a9-962b-4309-8f8a-5d8c13cd80c6",
      "name": "Interpretar classificação",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1540,
        300
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [
            "provider_id"
          ],
          "schema": []
        },
        "options": {
          "cellFormat": "RAW",
          "handlingExtraData": "ignoreIt"
        }
      },
      "id": "f0d5512e-f08d-4b27-be28-a0d388719731",
      "name": "Atualizar prospect",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        1760,
        300
      ]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "loose",
            "version": 2
          },
          "conditions": [
            {
              "id": "a2a3e9ef-bc7e-4457-9dfc-b43f2009adc8",
              "leftValue": "={{ $json.estado !== 'sem_interesse' }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "looseTypeValidation": true,
        "options": {}
      },
      "id": "58ee8619-d810-4735-a877-2802979f2b1e",
      "name": "Precisa de resposta tua?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1980,
        300
      ]
    },
    {
      "parameters": {
        "operation": "send",
        "sendTo": "={{ $('Config').first().json.email_alertas }}",
        "subject": "={{ ($json.estado === 'lead' ? '🔥 LEAD: ' : '💬 Resposta: ') + $('Procurar prospect').item.json.nome + ' (' + ($('Procurar prospect').item.json.empresa || '') + ')' }}",
        "emailType": "html",
        "message": "=<p><b>{{ $('Procurar prospect').item.json.nome }}</b> — {{ $('Procurar prospect').item.json.cargo }} @ {{ $('Procurar prospect').item.json.empresa }}</p><p><b>Classificação:</b> {{ $json.classificacao }}<br><b>Resumo:</b> {{ $json.resumo_ia }}</p><p><b>Mensagem recebida:</b><br>{{ $json.resposta }}</p><p><b>Resposta sugerida:</b><br>{{ $json.resposta_sugerida }}</p><p><a href=\"{{ $('Procurar prospect').item.json.linkedin_url }}\">Abrir perfil</a> · <a href=\"https://www.linkedin.com/messaging/\">Abrir mensagens</a></p>",
        "options": {
          "appendAttribution": false
        }
      },
      "id": "a4da1263-5153-47a8-87b4-5d9b1075e301",
      "name": "Alertar por email",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        2200,
        300
      ]
    }
  ],
  "connections": {
    "Webhook Unipile": {
      "main": [
        [
          {
            "node": "Config",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Config": {
      "main": [
        [
          {
            "node": "Mensagem recebida de outra pessoa?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Mensagem recebida de outra pessoa?": {
      "main": [
        [
          {
            "node": "Procurar prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Procurar prospect": {
      "main": [
        [
          {
            "node": "Ainda não é lead?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ainda não é lead?": {
      "main": [
        [
          {
            "node": "Preparar classificação",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Preparar classificação": {
      "main": [
        [
          {
            "node": "Claude · classificar resposta",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Claude · classificar resposta": {
      "main": [
        [
          {
            "node": "Interpretar classificação",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Interpretar classificação": {
      "main": [
        [
          {
            "node": "Atualizar prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Atualizar prospect": {
      "main": [
        [
          {
            "node": "Precisa de resposta tua?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Precisa de resposta tua?": {
      "main": [
        [
          {
            "node": "Alertar por email",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "timezone": "Europe/Lisbon",
    "saveManualExecutions": true
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": false
  }
}
```

## LinkedIn Leads · 03 · Sequência de mensagens

```json
{
  "name": "LinkedIn Leads · 03 · Sequência de mensagens",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 11 * * 1-5"
            }
          ]
        }
      },
      "id": "1c768c00-cf7b-418f-ad6c-dd39932c3370",
      "name": "Dias úteis às 11h",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        0,
        300
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "862b1936-68a1-4b93-b37d-07dc8c0223cc",
              "name": "unipile_base_url",
              "value": "https://apiX.unipile.com:XXXXX/api/v1",
              "type": "string"
            },
            {
              "id": "a6b99ff0-023b-4f6c-aae6-c46f32c4e025",
              "name": "unipile_account_id",
              "value": "ID_DA_CONTA_LINKEDIN_NA_UNIPILE",
              "type": "string"
            },
            {
              "id": "7a8e7ac5-16f6-4309-a2af-211c4797b18f",
              "name": "sheet_id",
              "value": "ID_DA_GOOGLE_SHEET",
              "type": "string"
            },
            {
              "id": "4f4b0f79-34aa-4ab3-9ee7-8be531b67a20",
              "name": "nome_remetente",
              "value": "O teu primeiro nome",
              "type": "string"
            },
            {
              "id": "ff145be7-e22b-45bc-b0a9-89e569733993",
              "name": "oferta",
              "value": "O que fazes, numa frase (ex.: ajudo CFOs de PMEs a fechar o mês em 2 dias em vez de 10)",
              "type": "string"
            },
            {
              "id": "8c57cebf-e99e-40ca-91c5-bc0a868220d9",
              "name": "icp",
              "value": "Diretores financeiros de PMEs portuguesas com 20-200 funcionários, setor de serviços, que ainda fazem reporting em Excel",
              "type": "string"
            },
            {
              "id": "7b3662fb-4e85-4c13-891f-4c75a09e59e5",
              "name": "dor",
              "value": "fecho de mês lento e reporting manual em Excel",
              "type": "string"
            },
            {
              "id": "17f05413-190a-4b2c-8166-161f8a897716",
              "name": "prova",
              "value": "Caso real com números (ex.: a empresa X passou de 10 para 2 dias de fecho)",
              "type": "string"
            },
            {
              "id": "100fd342-3819-4ac1-b1f7-bd8bbaae3f8c",
              "name": "recurso_gratuito",
              "value": "Guia curto sobre [tema] com o que resultou em [nº] empresas",
              "type": "string"
            },
            {
              "id": "978a257f-22db-40cb-ad59-d9ffc7d9d310",
              "name": "link_agenda",
              "value": "https://calendly.com/o-teu-link/20min",
              "type": "string"
            },
            {
              "id": "dc86de28-c298-4d5f-958c-704bd8fa4cbb",
              "name": "limite_mensagens_dia",
              "value": "40",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "6fc79f16-2cca-4fcc-8b80-2a4bab25c702",
      "name": "Config",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        220,
        300
      ]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={{ $('Config').first().json.unipile_base_url }}/users/relations",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            },
            {
              "name": "limit",
              "value": "100"
            }
          ]
        },
        "options": {}
      },
      "id": "79d50b17-1d72-452e-8ec9-e22395ff6175",
      "name": "Ligações recentes",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        440,
        300
      ]
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "options": {}
      },
      "id": "96b9da89-6663-46e8-978e-04871ce8139a",
      "name": "Ler prospects",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        660,
        300
      ],
      "executeOnce": true
    },
    {
      "parameters": {
        "jsCode": "const TZ = 'Europe/Lisbon';\nconst hoje = DateTime.now().setZone(TZ).startOf('day');\nconst hojeStr = hoje.toFormat('yyyy-MM-dd');\nfunction parseData(v) {\n  if (!v) return null;\n  const s = String(v).trim();\n  let d = DateTime.fromISO(s, { zone: TZ });\n  if (!d.isValid) d = DateTime.fromFormat(s, 'dd/MM/yyyy', { zone: TZ });\n  return d.isValid ? d.startOf('day') : null;\n}\nfunction diasDesde(v) {\n  const d = parseData(v);\n  return d ? Math.floor(hoje.diff(d, 'days').days) : Infinity;\n}\n\nconst limite = Number($('Config').first().json.limite_mensagens_dia) || 40;\nconst aceites = new Set(\n  ($('Ligações recentes').first().json.items || [])\n    .map(r => String(r.public_identifier || '').toLowerCase())\n    .filter(Boolean)\n);\n// dias de espera antes de cada passo: msg1 = D+1 após aceitar, FU1 +3, FU2 +5, FU3 +7\nconst ESPERA = [1, 3, 5, 7];\nconst aceitacoes = [];\nconst envios = [];\n\nfor (const { json: p } of $input.all()) {\n  if (!p.provider_id) continue;\n  if (p.estado === 'convite_enviado' && aceites.has(String(p.public_identifier || '').toLowerCase())) {\n    aceitacoes.push({ json: { acao: 'aceite', provider_id: p.provider_id, estado: 'ligado', data_ligacao: hojeStr, passo: 0 } });\n    continue;\n  }\n  if (!['ligado', 'em_sequencia'].includes(p.estado) || p.data_resposta) continue;\n  const passo = Number(p.passo) || 0;\n  if (passo > 3) continue;\n  const dias = diasDesde(passo === 0 ? p.data_ligacao : p.data_ultima_msg);\n  if (dias >= ESPERA[passo]) envios.push({ json: { acao: 'enviar', provider_id: p.provider_id, passo } });\n}\n\nenvios.sort((a, b) => a.json.passo - b.json.passo);\nreturn [...aceitacoes, ...envios.slice(0, limite)];\n"
      },
      "id": "d7d358b3-0f94-4e77-ad3e-a71470d2488e",
      "name": "Calcular ações do dia",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        880,
        300
      ]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "loose",
            "version": 2
          },
          "conditions": [
            {
              "id": "2c97f25f-3c80-4015-a155-b0f3b365f502",
              "leftValue": "={{ $json.acao === 'aceite' }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "looseTypeValidation": true,
        "options": {}
      },
      "id": "31faa933-e7bd-48e2-9de7-5d5264b5f6cd",
      "name": "É aceitação?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1100,
        300
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [
            "provider_id"
          ],
          "schema": []
        },
        "options": {
          "cellFormat": "RAW",
          "handlingExtraData": "ignoreIt"
        }
      },
      "id": "44fce3fa-df77-4f32-91df-773009a446d5",
      "name": "Registar aceitação",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        1320,
        100
      ]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "id": "a4157b82-7d89-44dd-8ec3-dc52c14ff548",
      "name": "Um de cada vez",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [
        1320,
        400
      ]
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "options": {},
        "filtersUI": {
          "values": [
            {
              "lookupColumn": "provider_id",
              "lookupValue": "={{ $json.provider_id }}"
            }
          ]
        }
      },
      "id": "b3da6443-ecaa-48b5-a460-85bb8fc5142f",
      "name": "Reler prospect",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        1540,
        500
      ],
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "loose",
            "version": 2
          },
          "conditions": [
            {
              "id": "92657d5a-3052-4c9d-85a3-c45f83e4ccad",
              "leftValue": "={{ ['ligado', 'em_sequencia'].includes($json.estado) && !$json.data_resposta }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "looseTypeValidation": true,
        "options": {}
      },
      "id": "ac9f2c41-bc72-4924-8723-ed9478e22da7",
      "name": "Continua na sequência?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1760,
        500
      ]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={{ $('Config').first().json.unipile_base_url }}/users/{{ $json.provider_id }}/posts",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            },
            {
              "name": "limit",
              "value": "3"
            }
          ]
        },
        "options": {}
      },
      "id": "465c2ac0-abca-4144-ab1e-a46d307c426a",
      "name": "Últimas publicações",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1980,
        400
      ],
      "onError": "continueRegularOutput",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "jsCode": "const cfg = $('Config').first().json;\nconst p = $('Reler prospect').first().json;\nconst passo = Number(p.passo) || 0;\nlet publicacoes = [];\ntry {\n  publicacoes = ($input.first().json.items || [])\n    .slice(0, 2)\n    .map(x => String(x.text || '').slice(0, 500))\n    .filter(Boolean);\n} catch (e) {}\n\nconst system = `És ${cfg.nome_remetente}. ${cfg.oferta}.\nEscreves mensagens privadas de LinkedIn para prospects do teu cliente ideal (${cfg.icp}), numa sequência de 4 passos.\n\nRegras:\n- Português de Portugal, tratar por tu, tom humano e direto, frases curtas.\n- Máximo 300 caracteres. Sem emojis (no máximo 1). Sem links, exceto quando o passo o pede.\n- Usa apenas factos dos dados fornecidos; nunca inventes nada sobre a pessoa.\n- Responde apenas com o texto da mensagem, sem aspas nem explicações.\n\nPassos:\n0. Abertura (sem qualquer pitch): agradece ter aceitado a ligação, refere um detalhe específico (publicação recente, cargo, empresa; se fonte = \"comentario\", o comentário que fez ao teu post) e faz uma pergunta aberta sobre ${cfg.dor}.\n1. Valor: oferece \"${cfg.recurso_gratuito}\" e pergunta se quer que envies. Podes referir a prova: ${cfg.prova}.\n2. Direto: pergunta, numa linha, se ${cfg.dor} é prioridade para ela este trimestre ou nem por isso.\n3. Encerramento: diz que não queres incomodar, que ficas por aqui e que a porta fica aberta se o tema se tornar prioridade. Deseja boa semana.\nNos passos 1–3 não repitas a mensagem anterior e mantém a continuidade da conversa.`;\n\nconst dados = {\n  passo,\n  nome: p.nome, cargo: p.cargo, empresa: p.empresa,\n  fonte: p.fonte, contexto: p.contexto,\n  publicacoes_recentes: publicacoes,\n  mensagem_anterior: p.ultima_msg || '',\n};\n\nreturn [{ json: {\n  provider_id: p.provider_id,\n  passo,\n  claude_request: {\n    model: 'claude-opus-5',\n    max_tokens: 8000,\n    fallbacks: 'default',\n    output_config: { effort: 'medium' },\n    system,\n    messages: [{ role: 'user', content: `Escreve a mensagem do passo ${passo}.\\n` + JSON.stringify(dados, null, 2) }],\n  },\n} }];\n"
      },
      "id": "2455faea-63b4-4696-9d46-f7c5a8df0db3",
      "name": "Preparar mensagem",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2200,
        400
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.anthropic.com/v1/messages",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "anthropic-version",
              "value": "2023-06-01"
            },
            {
              "name": "anthropic-beta",
              "value": "server-side-fallback-2026-07-01"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json.claude_request) }}",
        "options": {
          "timeout": 180000
        }
      },
      "id": "22ab9a30-f036-4815-a10b-369e6ebe5080",
      "name": "Claude · escrever mensagem",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        2420,
        400
      ],
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 5000,
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "const prep = $('Preparar mensagem').first().json;\nconst r = $input.first().json;\nlet texto = '';\nif (r.stop_reason !== 'refusal') {\n  const bloco = (r.content || []).find(c => c.type === 'text');\n  texto = String(bloco?.text || '').trim().replace(/^[\"“]+|[\"”]+$/g, '').trim();\n}\nreturn [{ json: { provider_id: prep.provider_id, passo: prep.passo, texto, ok: texto.length > 0 && texto.length <= 600 } }];\n"
      },
      "id": "51ae420b-3910-4f0a-8faf-e5ef919268ae",
      "name": "Extrair mensagem",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2640,
        400
      ]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "loose",
            "version": 2
          },
          "conditions": [
            {
              "id": "81db9660-81e2-47aa-abbd-e8e243824f54",
              "leftValue": "={{ $json.ok }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "looseTypeValidation": true,
        "options": {}
      },
      "id": "0caacc51-b84e-4ac8-8e94-766f2e77834d",
      "name": "Mensagem válida?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        2860,
        400
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{ $('Config').first().json.unipile_base_url }}/chats",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "contentType": "multipart-form-data",
        "bodyParameters": {
          "parameters": [
            {
              "parameterType": "formData",
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            },
            {
              "parameterType": "formData",
              "name": "attendees_ids",
              "value": "={{ $json.provider_id }}"
            },
            {
              "parameterType": "formData",
              "name": "text",
              "value": "={{ $json.texto }}"
            }
          ]
        },
        "options": {}
      },
      "id": "4eb1ffff-2e56-4370-9da0-76209edd0263",
      "name": "Enviar mensagem",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        3080,
        300
      ],
      "onError": "continueErrorOutput"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "b12e8ac3-690b-41e8-a132-41230e3abf51",
              "name": "provider_id",
              "value": "={{ $('Extrair mensagem').item.json.provider_id }}",
              "type": "string"
            },
            {
              "id": "4fe50800-4f48-49cb-a081-f0497518c001",
              "name": "passo",
              "value": "={{ $('Extrair mensagem').item.json.passo + 1 }}",
              "type": "number"
            },
            {
              "id": "3bb45989-628e-48b0-974a-f9674b081a45",
              "name": "estado",
              "value": "={{ $('Extrair mensagem').item.json.passo + 1 >= 4 ? 'sequencia_terminada' : 'em_sequencia' }}",
              "type": "string"
            },
            {
              "id": "3df71274-0ff2-4451-ad66-c900f86cc529",
              "name": "data_ultima_msg",
              "value": "={{ $now.setZone('Europe/Lisbon').toFormat('yyyy-MM-dd') }}",
              "type": "string"
            },
            {
              "id": "b7fecd15-fd64-4e9f-acf8-d3898c469676",
              "name": "ultima_msg",
              "value": "={{ $('Extrair mensagem').item.json.texto }}",
              "type": "string"
            },
            {
              "id": "a2a8135d-a8d0-4c9e-a487-704b9b6b0766",
              "name": "chat_id",
              "value": "={{ $json.chat_id || '' }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "68e83bac-5a45-4215-933b-294977a195c1",
      "name": "Registar envio",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        3300,
        200
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "689ffda5-1b1b-4289-a825-9daa8313c7b7",
              "name": "provider_id",
              "value": "={{ $('Extrair mensagem').item.json.provider_id }}",
              "type": "string"
            },
            {
              "id": "95ad54aa-7c18-46d6-a898-4a67b1de7406",
              "name": "notas",
              "value": "={{ 'Erro ao enviar passo ' + $('Extrair mensagem').item.json.passo + ': ' + ($json.error?.message || '').slice(0, 250) }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "0618b47a-f263-4514-87ed-448b63501fce",
      "name": "Registar erro de envio",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        3300,
        400
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [
            "provider_id"
          ],
          "schema": []
        },
        "options": {
          "cellFormat": "RAW",
          "handlingExtraData": "ignoreIt"
        }
      },
      "id": "4d8abade-654a-4755-a5a8-4c8cf67d1979",
      "name": "Atualizar prospect",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        3520,
        300
      ]
    },
    {
      "parameters": {
        "amount": "={{ Math.floor(Math.random() * 120) + 60 }}",
        "unit": "seconds"
      },
      "id": "f13d7ecb-ae96-4945-b416-eb0534e86f7a",
      "name": "Pausa humana 60–180 s",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        3740,
        300
      ],
      "webhookId": "6619b41d-1823-4a5e-9f3d-5e79e73b2cfd"
    }
  ],
  "connections": {
    "Dias úteis às 11h": {
      "main": [
        [
          {
            "node": "Config",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Config": {
      "main": [
        [
          {
            "node": "Ligações recentes",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ligações recentes": {
      "main": [
        [
          {
            "node": "Ler prospects",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ler prospects": {
      "main": [
        [
          {
            "node": "Calcular ações do dia",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Calcular ações do dia": {
      "main": [
        [
          {
            "node": "É aceitação?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "É aceitação?": {
      "main": [
        [
          {
            "node": "Registar aceitação",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Um de cada vez",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Um de cada vez": {
      "main": [
        [],
        [
          {
            "node": "Reler prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Reler prospect": {
      "main": [
        [
          {
            "node": "Continua na sequência?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Continua na sequência?": {
      "main": [
        [
          {
            "node": "Últimas publicações",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Um de cada vez",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Últimas publicações": {
      "main": [
        [
          {
            "node": "Preparar mensagem",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Preparar mensagem": {
      "main": [
        [
          {
            "node": "Claude · escrever mensagem",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Claude · escrever mensagem": {
      "main": [
        [
          {
            "node": "Extrair mensagem",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extrair mensagem": {
      "main": [
        [
          {
            "node": "Mensagem válida?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Mensagem válida?": {
      "main": [
        [
          {
            "node": "Enviar mensagem",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Um de cada vez",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enviar mensagem": {
      "main": [
        [
          {
            "node": "Registar envio",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Registar erro de envio",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Registar envio": {
      "main": [
        [
          {
            "node": "Atualizar prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Registar erro de envio": {
      "main": [
        [
          {
            "node": "Atualizar prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Atualizar prospect": {
      "main": [
        [
          {
            "node": "Pausa humana 60–180 s",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Pausa humana 60–180 s": {
      "main": [
        [
          {
            "node": "Um de cada vez",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "timezone": "Europe/Lisbon",
    "saveManualExecutions": true
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": false
  }
}
```

## LinkedIn Leads · 04 · Sinais mornos

```json
{
  "name": "LinkedIn Leads · 04 · Sinais mornos",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 9 * * 1-5"
            }
          ]
        }
      },
      "id": "a8e173b4-560e-4aa6-8777-3ebd5647410e",
      "name": "Dias úteis às 9h",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        0,
        300
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "40b23f6b-a142-47ea-ab00-00e0cac9f4cc",
              "name": "unipile_base_url",
              "value": "https://apiX.unipile.com:XXXXX/api/v1",
              "type": "string"
            },
            {
              "id": "ce089a13-c6a5-4f36-a847-27a8a495843a",
              "name": "unipile_account_id",
              "value": "ID_DA_CONTA_LINKEDIN_NA_UNIPILE",
              "type": "string"
            },
            {
              "id": "4c1bbd83-a139-4f57-9c84-0fef15561274",
              "name": "sheet_id",
              "value": "ID_DA_GOOGLE_SHEET",
              "type": "string"
            },
            {
              "id": "20bbd19f-1247-476c-9524-c53258351bf0",
              "name": "icp",
              "value": "Diretores financeiros de PMEs portuguesas com 20-200 funcionários, setor de serviços, que ainda fazem reporting em Excel",
              "type": "string"
            },
            {
              "id": "88ba9fa9-8c63-4bb3-96c6-7158d9a35c1a",
              "name": "score_minimo_icp",
              "value": "7",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "ebf58254-f429-4c60-b8f5-b6f37e99fb91",
      "name": "Config",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        220,
        300
      ]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={{ $('Config').first().json.unipile_base_url }}/users/me",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            }
          ]
        },
        "options": {}
      },
      "id": "fd8beaca-7c57-4da1-9437-613396210514",
      "name": "O meu perfil",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        440,
        300
      ]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={{ $('Config').first().json.unipile_base_url }}/users/{{ $json.provider_id }}/posts",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            },
            {
              "name": "limit",
              "value": "10"
            }
          ]
        },
        "options": {}
      },
      "id": "9cc3ca30-075e-4751-96e8-dd337b240d4c",
      "name": "As minhas publicações",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        660,
        300
      ]
    },
    {
      "parameters": {
        "jsCode": "const TZ = 'Europe/Lisbon';\nconst hoje = DateTime.now().setZone(TZ).startOf('day');\nconst hojeStr = hoje.toFormat('yyyy-MM-dd');\nfunction parseData(v) {\n  if (!v) return null;\n  const s = String(v).trim();\n  let d = DateTime.fromISO(s, { zone: TZ });\n  if (!d.isValid) d = DateTime.fromFormat(s, 'dd/MM/yyyy', { zone: TZ });\n  return d.isValid ? d.startOf('day') : null;\n}\nfunction diasDesde(v) {\n  const d = parseData(v);\n  return d ? Math.floor(hoje.diff(d, 'days').days) : Infinity;\n}\n\nreturn ($input.first().json.items || [])\n  .filter(p => (p.comment_counter || 0) > 0)\n  .filter(p => diasDesde(p.parsed_datetime) <= 14)\n  .map(p => ({ json: { social_id: p.social_id, texto: String(p.text || '').slice(0, 200) } }));\n"
      },
      "id": "7e839b60-e0cf-41a4-9e99-a4b561404c83",
      "name": "Publicações dos últimos 14 dias",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        880,
        300
      ]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={{ $('Config').first().json.unipile_base_url }}/posts/{{ encodeURIComponent($json.social_id) }}/comments",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            },
            {
              "name": "limit",
              "value": "100"
            }
          ]
        },
        "options": {}
      },
      "id": "351851b8-7aac-4ff2-8617-c8b76bf346b5",
      "name": "Comentários",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1100,
        300
      ],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "options": {}
      },
      "id": "cc66a608-7d72-42b9-8cee-f02bfa0be237",
      "name": "Ler prospects",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        1320,
        300
      ],
      "executeOnce": true,
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "jsCode": "const eu = $('O meu perfil').first().json.provider_id;\nconst posts = $('Publicações dos últimos 14 dias').all().map(i => i.json);\nconst norm = v => String(v || '').toLowerCase().replace(/\\/+$/, '');\n\nconst existentes = new Set();\nfor (const { json: r } of $input.all()) {\n  [r.provider_id, r.public_identifier, r.linkedin_url].map(norm).filter(Boolean).forEach(v => existentes.add(v));\n}\n\nconst candidatos = new Map();\n$('Comentários').all().forEach((resp, idx) => {\n  const post = posts[idx] || {};\n  for (const c of resp.json.items || []) {\n    const a = c.author_details || {};\n    if (!a.id || a.id === eu || candidatos.has(a.id)) continue;\n    if (existentes.has(norm(a.id)) || existentes.has(norm(a.profile_url))) continue;\n    candidatos.set(a.id, {\n      id: a.id,\n      nome: typeof c.author === 'string' ? c.author : (c.author?.name || ''),\n      headline: a.headline || '',\n      linkedin_url: a.profile_url || '',\n      comentario: String(c.text || '').slice(0, 300),\n      post: post.texto || '',\n    });\n  }\n});\n\nif (!candidatos.size) return [];\nreturn [{ json: { candidatos: [...candidatos.values()] } }];\n"
      },
      "id": "a21fa1aa-30cd-4505-8a65-322b01e3c126",
      "name": "Novos comentadores",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1540,
        300
      ]
    },
    {
      "parameters": {
        "jsCode": "const cfg = $('Config').first().json;\nconst candidatos = $input.first().json.candidatos;\nreturn [{ json: {\n  claude_request: {\n    model: 'claude-opus-5',\n    max_tokens: 16000,\n    fallbacks: 'default',\n    output_config: {\n      effort: 'low',\n      format: {\n        type: 'json_schema',\n        schema: {\n          type: 'object',\n          properties: {\n            avaliacoes: {\n              type: 'array',\n              items: {\n                type: 'object',\n                properties: {\n                  id: { type: 'string' },\n                  score: { type: 'integer' },\n                  motivo: { type: 'string' },\n                },\n                required: ['id', 'score', 'motivo'],\n                additionalProperties: false,\n              },\n            },\n          },\n          required: ['avaliacoes'],\n          additionalProperties: false,\n        },\n      },\n    },\n    system: `Avalias, de 0 a 10, quanto cada pessoa corresponde a este cliente ideal (ICP): ${cfg.icp}.\nBaseia-te só no headline (cargo/empresa). 10 = encaixe perfeito; 0 = sem relação (concorrentes, estudantes, recrutadores, vendedores de serviços semelhantes = 0-2). Motivo numa frase curta em português de Portugal. Avalia todas as pessoas.`,\n    messages: [{ role: 'user', content: JSON.stringify(candidatos.map(c => ({ id: c.id, nome: c.nome, headline: c.headline })), null, 2) }],\n  },\n} }];\n"
      },
      "id": "dcaebc88-eeba-4e34-98a7-8d67e84a6ef7",
      "name": "Preparar qualificação ICP",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1760,
        300
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.anthropic.com/v1/messages",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "anthropic-version",
              "value": "2023-06-01"
            },
            {
              "name": "anthropic-beta",
              "value": "server-side-fallback-2026-07-01"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json.claude_request) }}",
        "options": {
          "timeout": 180000
        }
      },
      "id": "139fa107-9237-4607-9477-45432477679c",
      "name": "Claude · qualificar ICP",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1980,
        300
      ],
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 5000,
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "const minimo = Number($('Config').first().json.score_minimo_icp) || 7;\nconst candidatos = new Map($('Novos comentadores').first().json.candidatos.map(c => [c.id, c]));\nconst r = $input.first().json;\nlet avaliacoes = [];\ntry {\n  const bloco = (r.content || []).find(c => c.type === 'text');\n  avaliacoes = JSON.parse(bloco.text).avaliacoes || [];\n} catch (e) { return []; }\n\nreturn avaliacoes\n  .filter(a => a.score >= minimo && candidatos.has(a.id))\n  .map(a => {\n    const c = candidatos.get(a.id);\n    return { json: {\n      nome: c.nome,\n      cargo: c.headline,\n      empresa: '',\n      linkedin_url: c.linkedin_url,\n      provider_id: c.id,\n      fonte: 'comentario',\n      prioridade: 10,\n      contexto: `Comentou o teu post \"${c.post.slice(0, 80)}…\": \"${c.comentario}\"`,\n      estado: 'novo',\n      notas: `ICP ${a.score}/10 — ${a.motivo}`,\n    } };\n  });\n"
      },
      "id": "49e2b2b2-1dd2-48f1-8309-ca9df29a6f02",
      "name": "Linhas a adicionar",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2200,
        300
      ]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [],
          "schema": []
        },
        "options": {
          "cellFormat": "RAW",
          "handlingExtraData": "ignoreIt"
        }
      },
      "id": "e8f4501c-1bef-47b3-8c4a-8b000d169e9b",
      "name": "Adicionar à lista (prioridade máxima)",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        2420,
        300
      ]
    }
  ],
  "connections": {
    "Dias úteis às 9h": {
      "main": [
        [
          {
            "node": "Config",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Config": {
      "main": [
        [
          {
            "node": "O meu perfil",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "O meu perfil": {
      "main": [
        [
          {
            "node": "As minhas publicações",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "As minhas publicações": {
      "main": [
        [
          {
            "node": "Publicações dos últimos 14 dias",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Publicações dos últimos 14 dias": {
      "main": [
        [
          {
            "node": "Comentários",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Comentários": {
      "main": [
        [
          {
            "node": "Ler prospects",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ler prospects": {
      "main": [
        [
          {
            "node": "Novos comentadores",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Novos comentadores": {
      "main": [
        [
          {
            "node": "Preparar qualificação ICP",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Preparar qualificação ICP": {
      "main": [
        [
          {
            "node": "Claude · qualificar ICP",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Claude · qualificar ICP": {
      "main": [
        [
          {
            "node": "Linhas a adicionar",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Linhas a adicionar": {
      "main": [
        [
          {
            "node": "Adicionar à lista (prioridade máxima)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "timezone": "Europe/Lisbon",
    "saveManualExecutions": true
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": false
  }
}
```

## LinkedIn Leads · 05 · Gerar conteúdo da semana

```json
{
  "name": "LinkedIn Leads · 05 · Gerar conteúdo da semana",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 18 * * 0"
            }
          ]
        }
      },
      "id": "2f9d3332-cdcc-412e-86ae-a4a88edfc03a",
      "name": "Domingo às 18h",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        0,
        300
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "75160f6d-b3af-4d40-8085-be324f480ca0",
              "name": "unipile_base_url",
              "value": "https://apiX.unipile.com:XXXXX/api/v1",
              "type": "string"
            },
            {
              "id": "07411cab-31c5-43c7-92f5-15e89a248f5b",
              "name": "unipile_account_id",
              "value": "ID_DA_CONTA_LINKEDIN_NA_UNIPILE",
              "type": "string"
            },
            {
              "id": "81999f63-3abb-4345-b6b3-dc59bba86e7a",
              "name": "sheet_id",
              "value": "ID_DA_GOOGLE_SHEET",
              "type": "string"
            },
            {
              "id": "caf75f68-96e7-4546-9960-fbaadc7cbdff",
              "name": "nome_remetente",
              "value": "O teu primeiro nome",
              "type": "string"
            },
            {
              "id": "abb251a0-78ec-4d88-9c8d-32061fe311a4",
              "name": "oferta",
              "value": "O que fazes, numa frase (ex.: ajudo CFOs de PMEs a fechar o mês em 2 dias em vez de 10)",
              "type": "string"
            },
            {
              "id": "e75a4798-92cc-4a8c-93da-0ed90a028864",
              "name": "icp",
              "value": "Diretores financeiros de PMEs portuguesas com 20-200 funcionários, setor de serviços, que ainda fazem reporting em Excel",
              "type": "string"
            },
            {
              "id": "c411ba2d-e8ba-4825-95af-2ba4d46566ff",
              "name": "dor",
              "value": "fecho de mês lento e reporting manual em Excel",
              "type": "string"
            },
            {
              "id": "a50d86a7-1a0f-40ca-927f-212491bd56f1",
              "name": "prova",
              "value": "Caso real com números (ex.: a empresa X passou de 10 para 2 dias de fecho)",
              "type": "string"
            },
            {
              "id": "500876af-c8a9-43b8-a674-c3821182c5c4",
              "name": "temas",
              "value": "3-5 temas sobre os quais queres ser conhecido, separados por vírgulas",
              "type": "string"
            },
            {
              "id": "984802f5-0604-4456-b369-4ec97a951594",
              "name": "lead_magnet",
              "value": "Guia PDF sobre [tema] — quem comentar 'GUIA' recebe por mensagem",
              "type": "string"
            },
            {
              "id": "180348bf-aa56-4b30-bfa8-0db63d403317",
              "name": "email_alertas",
              "value": "o-teu-email@exemplo.com",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "432a0d5b-c799-4475-bbb3-a3e296a4a82b",
      "name": "Config",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        220,
        300
      ]
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Conteudo",
          "mode": "name"
        },
        "options": {}
      },
      "id": "813cedc1-40ff-4d14-98de-5e4fa012b436",
      "name": "Publicações anteriores",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        440,
        300
      ],
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "jsCode": "const TZ = 'Europe/Lisbon';\nconst hoje = DateTime.now().setZone(TZ).startOf('day');\nconst hojeStr = hoje.toFormat('yyyy-MM-dd');\nfunction parseData(v) {\n  if (!v) return null;\n  const s = String(v).trim();\n  let d = DateTime.fromISO(s, { zone: TZ });\n  if (!d.isValid) d = DateTime.fromFormat(s, 'dd/MM/yyyy', { zone: TZ });\n  return d.isValid ? d.startOf('day') : null;\n}\nfunction diasDesde(v) {\n  const d = parseData(v);\n  return d ? Math.floor(hoje.diff(d, 'days').days) : Infinity;\n}\n\nconst cfg = $('Config').first().json;\nconst proximo = wd => hoje.plus({ days: ((wd - hoje.weekday + 7) % 7) || 7 });\nconst datas = { terca: proximo(2), quarta: proximo(3), quinta: proximo(4) };\nconst comLeadMagnet = datas.quinta.day <= 7; // 1.ª semana do mês\n\nconst anteriores = $input.all()\n  .map(i => i.json)\n  .filter(r => r.texto)\n  .slice(-9)\n  .map(r => String(r.texto).slice(0, 300));\n\nconst system = `És ghostwriter de LinkedIn de ${cfg.nome_remetente}, que ${cfg.oferta}.\nPúblico: ${cfg.icp}. Dor principal: ${cfg.dor}. Prova disponível: ${cfg.prova}. Temas: ${cfg.temas}.\n\nEscreve 3 publicações em português de Portugal:\n- terca (educativo): framework, passo a passo ou erro comum. Objetivo: autoridade.\n- quarta (prova): caso de cliente com números, antes e depois. Usa apenas a prova fornecida, sem inventar números.\n- quinta (opiniao): ponto de vista contrário ou história de bastidores. Objetivo: alcance e ligação.\n${comLeadMagnet ? `A de quinta termina com CTA de lead magnet: ${cfg.lead_magnet}.` : ''}\n\nFormato: gancho forte nas 2 primeiras linhas; frases curtas e espaçadas; uma ideia por publicação; 900–1500 caracteres; CTA leve no fim (pergunta); sem links; 0–3 hashtags no fim; sem emojis em excesso.\nNão repitas ideias nem ganchos das publicações anteriores.`;\n\nreturn [{ json: {\n  datas: Object.fromEntries(Object.entries(datas).map(([k, d]) => [k, d.toFormat('yyyy-MM-dd')])),\n  claude_request: {\n    model: 'claude-opus-5',\n    max_tokens: 16000,\n    fallbacks: 'default',\n    output_config: {\n      effort: 'high',\n      format: {\n        type: 'json_schema',\n        schema: {\n          type: 'object',\n          properties: {\n            posts: {\n              type: 'array',\n              items: {\n                type: 'object',\n                properties: {\n                  dia: { type: 'string', enum: ['terca', 'quarta', 'quinta'] },\n                  tipo: { type: 'string' },\n                  texto: { type: 'string' },\n                },\n                required: ['dia', 'tipo', 'texto'],\n                additionalProperties: false,\n              },\n            },\n          },\n          required: ['posts'],\n          additionalProperties: false,\n        },\n      },\n    },\n    system,\n    messages: [{ role: 'user', content: 'Publicações anteriores (não repetir):\\n' + (anteriores.join('\\n---\\n') || '(nenhuma)') }],\n  },\n} }];\n"
      },
      "id": "4becc032-6f55-4879-994a-345c6a44c1e1",
      "name": "Preparar pedido de conteúdo",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        660,
        300
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.anthropic.com/v1/messages",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "anthropic-version",
              "value": "2023-06-01"
            },
            {
              "name": "anthropic-beta",
              "value": "server-side-fallback-2026-07-01"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json.claude_request) }}",
        "options": {
          "timeout": 180000
        }
      },
      "id": "6f9aa693-fdff-4a6a-b1f0-486e8c3b5a9e",
      "name": "Claude · escrever publicações",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        880,
        300
      ],
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 5000,
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "const datas = $('Preparar pedido de conteúdo').first().json.datas;\nconst r = $input.first().json;\nconst bloco = (r.content || []).find(c => c.type === 'text');\nif (!bloco) throw new Error('Claude não devolveu texto (stop_reason: ' + r.stop_reason + ')');\nreturn JSON.parse(bloco.text).posts.map(p => ({ json: {\n  id: datas[p.dia],\n  data_publicacao: datas[p.dia],\n  dia: p.dia,\n  tipo: p.tipo,\n  texto: p.texto,\n  estado: 'rascunho',\n} }));\n"
      },
      "id": "08a36739-20a7-412e-adee-3f1578dc2a55",
      "name": "Linhas de conteúdo",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1100,
        300
      ]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Conteudo",
          "mode": "name"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [],
          "schema": []
        },
        "options": {
          "cellFormat": "RAW",
          "handlingExtraData": "ignoreIt"
        }
      },
      "id": "11eeec12-58c6-4d0c-b47e-04e5290c61d8",
      "name": "Guardar rascunhos",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        1320,
        300
      ]
    },
    {
      "parameters": {
        "operation": "send",
        "sendTo": "={{ $('Config').first().json.email_alertas }}",
        "subject": "📝 3 publicações de LinkedIn para rever",
        "emailType": "html",
        "message": "=<p>Tens 3 rascunhos novos no separador <b>Conteudo</b> da Google Sheet.</p><p>Revê, edita o texto se quiseres e muda o <b>estado</b> para <b>aprovado</b>. Só as aprovadas são publicadas (terça, quarta e quinta às 8h30).</p><p><a href=\"https://docs.google.com/spreadsheets/d/{{ $('Config').first().json.sheet_id }}\">Abrir a Sheet</a></p>",
        "options": {
          "appendAttribution": false
        }
      },
      "id": "b38abdfd-1f89-4908-aa67-ede2a6633461",
      "name": "Avisar que há rascunhos",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        1540,
        300
      ],
      "executeOnce": true
    }
  ],
  "connections": {
    "Domingo às 18h": {
      "main": [
        [
          {
            "node": "Config",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Config": {
      "main": [
        [
          {
            "node": "Publicações anteriores",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Publicações anteriores": {
      "main": [
        [
          {
            "node": "Preparar pedido de conteúdo",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Preparar pedido de conteúdo": {
      "main": [
        [
          {
            "node": "Claude · escrever publicações",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Claude · escrever publicações": {
      "main": [
        [
          {
            "node": "Linhas de conteúdo",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Linhas de conteúdo": {
      "main": [
        [
          {
            "node": "Guardar rascunhos",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Guardar rascunhos": {
      "main": [
        [
          {
            "node": "Avisar que há rascunhos",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "timezone": "Europe/Lisbon",
    "saveManualExecutions": true
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": false
  }
}
```

## LinkedIn Leads · 06 · Publicar conteúdo aprovado

```json
{
  "name": "LinkedIn Leads · 06 · Publicar conteúdo aprovado",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "30 8 * * 2-4"
            }
          ]
        }
      },
      "id": "430e4394-62c4-4c7b-bf2a-1062a12eac09",
      "name": "Terça a quinta às 8h30",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        0,
        300
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "63de5d24-0da5-4e43-9644-0bca639b4d63",
              "name": "unipile_base_url",
              "value": "https://apiX.unipile.com:XXXXX/api/v1",
              "type": "string"
            },
            {
              "id": "c4a13568-496a-4f58-a0be-78663f6c1c3b",
              "name": "unipile_account_id",
              "value": "ID_DA_CONTA_LINKEDIN_NA_UNIPILE",
              "type": "string"
            },
            {
              "id": "1d92dfdb-13de-4fcb-9c3b-d30ace595300",
              "name": "sheet_id",
              "value": "ID_DA_GOOGLE_SHEET",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "196d5b29-1b12-4e0a-b1dd-7572ba92dcda",
      "name": "Config",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        220,
        300
      ]
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Conteudo",
          "mode": "name"
        },
        "options": {},
        "filtersUI": {
          "values": [
            {
              "lookupColumn": "estado",
              "lookupValue": "aprovado"
            }
          ]
        }
      },
      "id": "adbe9cfc-1906-4c57-ab2f-e3abfde8cdb2",
      "name": "Publicações aprovadas",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        440,
        300
      ]
    },
    {
      "parameters": {
        "jsCode": "const TZ = 'Europe/Lisbon';\nconst hoje = DateTime.now().setZone(TZ).startOf('day');\nconst hojeStr = hoje.toFormat('yyyy-MM-dd');\nfunction parseData(v) {\n  if (!v) return null;\n  const s = String(v).trim();\n  let d = DateTime.fromISO(s, { zone: TZ });\n  if (!d.isValid) d = DateTime.fromFormat(s, 'dd/MM/yyyy', { zone: TZ });\n  return d.isValid ? d.startOf('day') : null;\n}\nfunction diasDesde(v) {\n  const d = parseData(v);\n  return d ? Math.floor(hoje.diff(d, 'days').days) : Infinity;\n}\n\nconst p = $input.all().map(i => i.json).find(r => diasDesde(r.data_publicacao) === 0 && r.texto);\nreturn p ? [{ json: p }] : [];\n"
      },
      "id": "1d9c44b3-af76-49ce-aadb-7894c1137acb",
      "name": "Publicação de hoje",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        660,
        300
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{ $('Config').first().json.unipile_base_url }}/posts",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "contentType": "multipart-form-data",
        "bodyParameters": {
          "parameters": [
            {
              "parameterType": "formData",
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            },
            {
              "parameterType": "formData",
              "name": "text",
              "value": "={{ $json.texto }}"
            }
          ]
        },
        "options": {}
      },
      "id": "ebcbb92a-1d2b-47d8-a91b-291e83f2035e",
      "name": "Publicar no LinkedIn",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        880,
        300
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "f41b6066-8e38-4dbb-811a-7d0a96e45a40",
              "name": "id",
              "value": "={{ $('Publicação de hoje').item.json.id }}",
              "type": "string"
            },
            {
              "id": "98ef4f1b-2413-4753-85ee-d53bf2c7d6ee",
              "name": "estado",
              "value": "publicado",
              "type": "string"
            },
            {
              "id": "97e967e7-e45e-4bf0-91cb-6120285d53c5",
              "name": "post_id",
              "value": "={{ $json.post_id || $json.id || '' }}",
              "type": "string"
            },
            {
              "id": "68036c23-42fe-4a87-8aa6-386df19e0538",
              "name": "data_publicado",
              "value": "={{ $now.setZone('Europe/Lisbon').toFormat('yyyy-MM-dd') }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "44805cea-cfc3-452b-9dd6-48c4f2e4d28e",
      "name": "Marcar publicado",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1100,
        300
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Conteudo",
          "mode": "name"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [
            "id"
          ],
          "schema": []
        },
        "options": {
          "cellFormat": "RAW",
          "handlingExtraData": "ignoreIt"
        }
      },
      "id": "889f19a0-2db1-484f-8a79-fbe59023fdb6",
      "name": "Atualizar conteúdo",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        1320,
        300
      ]
    }
  ],
  "connections": {
    "Terça a quinta às 8h30": {
      "main": [
        [
          {
            "node": "Config",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Config": {
      "main": [
        [
          {
            "node": "Publicações aprovadas",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Publicações aprovadas": {
      "main": [
        [
          {
            "node": "Publicação de hoje",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Publicação de hoje": {
      "main": [
        [
          {
            "node": "Publicar no LinkedIn",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Publicar no LinkedIn": {
      "main": [
        [
          {
            "node": "Marcar publicado",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Marcar publicado": {
      "main": [
        [
          {
            "node": "Atualizar conteúdo",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "timezone": "Europe/Lisbon",
    "saveManualExecutions": true
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": false
  }
}
```

## LinkedIn Leads · 07 · Relatório semanal e limpeza

```json
{
  "name": "LinkedIn Leads · 07 · Relatório semanal e limpeza",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 17 * * 5"
            }
          ]
        }
      },
      "id": "6a7f0705-1c78-4d9e-a97f-703acbafeed5",
      "name": "Sexta às 17h",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        0,
        300
      ]
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "45f9f663-29b2-4cb8-b384-5ffc4fb2067a",
              "name": "unipile_base_url",
              "value": "https://apiX.unipile.com:XXXXX/api/v1",
              "type": "string"
            },
            {
              "id": "d73a04cb-057b-4a8b-bcd4-d7c37a829fa2",
              "name": "unipile_account_id",
              "value": "ID_DA_CONTA_LINKEDIN_NA_UNIPILE",
              "type": "string"
            },
            {
              "id": "3cced040-d220-45c0-bc44-e6ceae49d029",
              "name": "sheet_id",
              "value": "ID_DA_GOOGLE_SHEET",
              "type": "string"
            },
            {
              "id": "3f78549b-9be0-44ce-a1af-36d21c673e9b",
              "name": "email_alertas",
              "value": "o-teu-email@exemplo.com",
              "type": "string"
            },
            {
              "id": "c58f29fa-243b-4d7f-a67c-171c6301b76b",
              "name": "dias_ate_retirar_convite",
              "value": "21",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "c0c5f431-eae6-4bbd-8416-e9d104cb5024",
      "name": "Config",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        220,
        300
      ]
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "options": {}
      },
      "id": "046c85bf-ee0a-4da5-b874-8a1997bf71b1",
      "name": "Ler prospects",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        440,
        300
      ]
    },
    {
      "parameters": {
        "jsCode": "const TZ = 'Europe/Lisbon';\nconst hoje = DateTime.now().setZone(TZ).startOf('day');\nconst hojeStr = hoje.toFormat('yyyy-MM-dd');\nfunction parseData(v) {\n  if (!v) return null;\n  const s = String(v).trim();\n  let d = DateTime.fromISO(s, { zone: TZ });\n  if (!d.isValid) d = DateTime.fromFormat(s, 'dd/MM/yyyy', { zone: TZ });\n  return d.isValid ? d.startOf('day') : null;\n}\nfunction diasDesde(v) {\n  const d = parseData(v);\n  return d ? Math.floor(hoje.diff(d, 'days').days) : Infinity;\n}\n\nconst P = $input.all().map(i => i.json);\nconst semana = v => diasDesde(v) <= 6;\nconst pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);\n\nconst convites = P.filter(p => semana(p.data_convite)).length;\nconst aceites = P.filter(p => semana(p.data_ligacao)).length;\nconst respostas = P.filter(p => semana(p.data_resposta)).length;\nconst leads = P.filter(p => p.estado === 'lead' && semana(p.data_resposta));\nconst contactados = P.filter(p => (Number(p.passo) || 0) >= 1).length;\nconst responderam = P.filter(p => p.data_resposta).length;\nconst leadsTotal = P.filter(p => p.estado === 'lead').length;\n\nconst taxaAceite = pct(aceites, convites);\nconst taxaResposta = pct(responderam, contactados);\nconst taxaLead = pct(leadsTotal, responderam);\nconst novos = P.filter(p => p.estado === 'novo').length;\nconst pendentes = P.filter(p => p.estado === 'convite_enviado').length;\nconst emSequencia = P.filter(p => ['ligado', 'em_sequencia'].includes(p.estado)).length;\n\nconst diag = [];\nif (convites < 100) diag.push(`Só ${convites} convites esta semana (meta 100): verifica erros na coluna \"notas\" ou a lista de novos.`);\nif (convites >= 20 && taxaAceite < 30) diag.push('Aceitação abaixo de 30%: melhora o perfil (título/banner) ou aperta o ICP.');\nif (contactados >= 20 && taxaResposta < 25) diag.push('Resposta abaixo de 25%: personaliza mais a abertura (passo 0).');\nif (responderam >= 10 && taxaLead < 40) diag.push('Resposta→lead abaixo de 40%: qualifica melhor a dor ou testa outra oferta.');\nif (novos < 100) diag.push(`Só restam ${novos} prospects novos: adiciona mais ao Sales Navigator/Sheet (meta 400+).`);\nif (pendentes > 100) diag.push(`${pendentes} convites pendentes: acima de 100 aumenta o risco de restrição.`);\nif (!diag.length) diag.push('Tudo dentro das metas. Mantém a rotina.');\n\nconst cor = (v, meta) => `<b style=\"color:${v >= meta ? '#1a7f37' : '#cf222e'}\">${v}</b>`;\nconst html = `\n<h2>LinkedIn — semana até ${hoje.toFormat('dd/MM/yyyy')}</h2>\n<table cellpadding=\"6\" style=\"border-collapse:collapse\">\n<tr><td>Leads esta semana</td><td>${cor(leads.length, 10)} / 10</td></tr>\n<tr><td>Convites enviados</td><td>${cor(convites, 100)} / 100</td></tr>\n<tr><td>Novas ligações</td><td>${aceites}</td></tr>\n<tr><td>Taxa de aceitação</td><td>${cor(taxaAceite, 35)}% (meta &gt;35%)</td></tr>\n<tr><td>Respostas esta semana</td><td>${respostas}</td></tr>\n<tr><td>Taxa de resposta (acumulada)</td><td>${cor(taxaResposta, 25)}% (meta &gt;25%)</td></tr>\n<tr><td>Resposta → lead (acumulada)</td><td>${cor(taxaLead, 40)}% (meta &gt;40%)</td></tr>\n<tr><td>Em sequência</td><td>${emSequencia}</td></tr>\n<tr><td>Convites pendentes</td><td>${pendentes}</td></tr>\n<tr><td>Prospects novos na lista</td><td>${novos}</td></tr>\n</table>\n<h3>Diagnóstico</h3><ul>${diag.map(d => `<li>${d}</li>`).join('')}</ul>\n<h3>Leads da semana</h3><ul>${leads.map(l => `<li><a href=\"${l.linkedin_url}\">${l.nome}</a> — ${l.cargo || ''} ${l.empresa ? '@ ' + l.empresa : ''}: ${l.resumo_ia || ''}</li>`).join('') || '<li>Nenhuma</li>'}</ul>`;\n\nreturn [{ json: { assunto: `📊 LinkedIn: ${leads.length} leads esta semana`, html } }];\n"
      },
      "id": "647489a4-8bdf-4f28-98ce-4b0d86307e88",
      "name": "Calcular KPIs",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        660,
        200
      ]
    },
    {
      "parameters": {
        "operation": "send",
        "sendTo": "={{ $('Config').first().json.email_alertas }}",
        "subject": "={{ $json.assunto }}",
        "emailType": "html",
        "message": "={{ $json.html }}",
        "options": {
          "appendAttribution": false
        }
      },
      "id": "6619588b-5c11-4996-9dfb-edfc574fb4a8",
      "name": "Enviar relatório",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        880,
        200
      ]
    },
    {
      "parameters": {
        "jsCode": "const TZ = 'Europe/Lisbon';\nconst hoje = DateTime.now().setZone(TZ).startOf('day');\nconst hojeStr = hoje.toFormat('yyyy-MM-dd');\nfunction parseData(v) {\n  if (!v) return null;\n  const s = String(v).trim();\n  let d = DateTime.fromISO(s, { zone: TZ });\n  if (!d.isValid) d = DateTime.fromFormat(s, 'dd/MM/yyyy', { zone: TZ });\n  return d.isValid ? d.startOf('day') : null;\n}\nfunction diasDesde(v) {\n  const d = parseData(v);\n  return d ? Math.floor(hoje.diff(d, 'days').days) : Infinity;\n}\n\nconst dias = Number($('Config').first().json.dias_ate_retirar_convite) || 21;\nreturn $input.all()\n  .map(i => i.json)\n  .filter(p => p.estado === 'convite_enviado' && p.invitation_id && p.provider_id && diasDesde(p.data_convite) >= dias)\n  .map(p => ({ json: { provider_id: p.provider_id, invitation_id: p.invitation_id } }));\n"
      },
      "id": "05c858f6-2538-41f0-a510-dc2b4ed7b7ae",
      "name": "Convites antigos",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        660,
        420
      ]
    },
    {
      "parameters": {
        "method": "DELETE",
        "url": "={{ $('Config').first().json.unipile_base_url }}/users/invite/sent/{{ $json.invitation_id }}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "account_id",
              "value": "={{ $('Config').first().json.unipile_account_id }}"
            }
          ]
        },
        "options": {
          "batching": {
            "batch": {
              "batchSize": 1,
              "batchInterval": 5000
            }
          }
        }
      },
      "id": "ff26e7aa-4ce4-4815-96f1-511f1bc16042",
      "name": "Retirar convite",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        880,
        420
      ],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "b965cfb7-f0f6-401d-8690-3ca061bffe82",
              "name": "provider_id",
              "value": "={{ $('Convites antigos').item.json.provider_id }}",
              "type": "string"
            },
            {
              "id": "7cfb6072-a054-4b7a-ade9-330ec11e228d",
              "name": "estado",
              "value": "={{ $json.error ? 'convite_enviado' : 'convite_retirado' }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "id": "27cf69f9-4595-4d61-9a28-f5dd1b31afa4",
      "name": "Marcar retirado",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1100,
        420
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Config').first().json.sheet_id }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Prospects",
          "mode": "name"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [
            "provider_id"
          ],
          "schema": []
        },
        "options": {
          "cellFormat": "RAW",
          "handlingExtraData": "ignoreIt"
        }
      },
      "id": "774f3416-5f34-41ec-a569-c4fdff6ef742",
      "name": "Atualizar prospect",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [
        1320,
        420
      ]
    }
  ],
  "connections": {
    "Sexta às 17h": {
      "main": [
        [
          {
            "node": "Config",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Config": {
      "main": [
        [
          {
            "node": "Ler prospects",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ler prospects": {
      "main": [
        [
          {
            "node": "Calcular KPIs",
            "type": "main",
            "index": 0
          },
          {
            "node": "Convites antigos",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Calcular KPIs": {
      "main": [
        [
          {
            "node": "Enviar relatório",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Convites antigos": {
      "main": [
        [
          {
            "node": "Retirar convite",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Retirar convite": {
      "main": [
        [
          {
            "node": "Marcar retirado",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Marcar retirado": {
      "main": [
        [
          {
            "node": "Atualizar prospect",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "timezone": "Europe/Lisbon",
    "saveManualExecutions": true
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": false
  }
}
```
